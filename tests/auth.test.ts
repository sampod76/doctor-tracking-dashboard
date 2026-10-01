import assert from "node:assert/strict";
import { test } from "node:test";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer, { login, logout } from "../src/redux/features/auth/authSlice";
import { baseApi } from "../src/redux/api/baseApi";
import { authApi } from "../src/redux/features/auth/authApi";
import { passwordSetSchema } from "../src/schema/change-password.schema";
const session = {
  accessToken: "old-access",
  refreshToken: "old-refresh-token",
  expiresIn: 604800,
  user: { userId: "123", email: "admin@example.com", role: "ADMIN", name: "Samantha Reed" },
};
const fresh = { ...session, accessToken: "new-access", refreshToken: "new-refresh-token" };
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const envelope = (data: unknown) => ({ success: true, statusCode: 200, data });
function makeStore() {
  const store = configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  store.dispatch(login(session));
  return store;
}
test("authentication contracts and lifecycle", async (t) => {
  const originalFetch = globalThis.fetch;
  try {
    await t.test(
      "login sends only credentials and does not refresh on invalid credentials",
      async () => {
        const store = makeStore();
        let calls = 0;
        globalThis.fetch = async (input) => {
          calls++;
          const req = input as Request;
          assert.equal(new URL(req.url).pathname, "/api/v1/auth/login");
          assert.deepEqual(await req.json(), { email: "admin@example.com", password: "p" });
          return response({ message: "Invalid credentials" }, 401);
        };
        const result = await store.dispatch(
          authApi.endpoints.login.initiate({ email: "admin@example.com", password: "p" }),
        );
        assert.ok(result.error);
        assert.equal(calls, 1);
        assert.equal(store.getState().auth.accessToken, "old-access");
        store.dispatch(baseApi.util.resetApiState());
      },
    );
    await t.test(
      "concurrent 401s refresh once, rotate all auth data, and retry with Bearer",
      async () => {
        const store = makeStore();
        let refreshes = 0;
        let attempts = 0;
        globalThis.fetch = async (input) => {
          const req = input as Request;
          if (req.url.endsWith("/auth/refresh-token")) {
            refreshes++;
            assert.deepEqual(await req.json(), { refreshToken: session.refreshToken });
            await new Promise((resolve) => setTimeout(resolve, 20));
            return response(envelope(fresh));
          }
          attempts++;
          if (req.headers.get("authorization") === "Bearer old-access") return response({}, 401);
          assert.equal(req.headers.get("authorization"), "Bearer new-access");
          return response(
            envelope({
              user: { ...session.user, isActive: true, profile: { name: "Updated Name" } },
            }),
          );
        };
        await Promise.all([
          store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap(),
          store
            .dispatch(
              authApi.endpoints.changePassword.initiate({
                currentPassword: "p",
                newPassword: "12345678",
              }),
            )
            .unwrap(),
        ]);
        assert.equal(refreshes, 1);
        assert.equal(attempts, 4);
        assert.equal(store.getState().auth.refreshToken, fresh.refreshToken);
        assert.equal(store.getState().auth.user?.name, "Updated Name");
        store.dispatch(baseApi.util.resetApiState());
      },
    );
    await t.test("invalid refresh clears authentication", async () => {
      const store = makeStore();
      let calls = 0;
      globalThis.fetch = async () => {
        calls++;
        return response({}, 401);
      };
      await store.dispatch(authApi.endpoints.getProfile.initiate());
      assert.equal(calls, 2);
      assert.deepEqual(store.getState().auth, {
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresIn: null,
      });
      store.dispatch(baseApi.util.resetApiState());
    });
    await t.test("retry is bounded to one and missing refresh ends the session", async () => {
      for (const missing of [false, true]) {
        const store = makeStore();
        if (missing) store.dispatch(login({ ...session, refreshToken: "" }));
        let calls = 0;
        globalThis.fetch = async (input) => {
          calls++;
          return (input as Request).url.endsWith("/refresh-token")
            ? response(envelope(fresh))
            : response({}, 401);
        };
        await store.dispatch(authApi.endpoints.getProfile.initiate());
        assert.equal(calls, missing ? 1 : 3);
        assert.equal(store.getState().auth.accessToken, null);
        store.dispatch(baseApi.util.resetApiState());
      }
    });
    await t.test("logout during refresh cannot restore authentication", async () => {
      const store = makeStore();
      globalThis.fetch = async (input) => {
        if ((input as Request).url.endsWith("/refresh-token")) {
          store.dispatch(logout());
          return response(envelope(fresh));
        }
        return response({}, 401);
      };
      await store.dispatch(authApi.endpoints.getProfile.initiate());
      assert.equal(store.getState().auth.accessToken, null);
      store.dispatch(baseApi.util.resetApiState());
    });
    await t.test(
      "password contract includes only backend fields and confirmation stays local",
      async () => {
        assert.ok(
          passwordSetSchema.safeParse({
            currentPassword: "p",
            newPassword: "12345678",
            confirmPassword: "12345678",
          }).success,
        );
        for (const password of ["1234567", "x".repeat(129)])
          assert.equal(
            passwordSetSchema.safeParse({
              currentPassword: "p",
              newPassword: password,
              confirmPassword: password,
            }).success,
            false,
          );
        assert.equal(
          passwordSetSchema.safeParse({
            currentPassword: "p",
            newPassword: "12345678",
            confirmPassword: "different",
          }).success,
          false,
        );
        const store = makeStore();
        globalThis.fetch = async (input) => {
          const req = input as Request;
          assert.equal(req.headers.get("authorization"), "Bearer old-access");
          assert.deepEqual(await req.json(), { currentPassword: "p", newPassword: "12345678" });
          return response(envelope({ message: "Password changed. Please log in again." }));
        };
        await store
          .dispatch(
            authApi.endpoints.changePassword.initiate({
              currentPassword: "p",
              newPassword: "12345678",
            }),
          )
          .unwrap();
        store.dispatch(baseApi.util.resetApiState());
      },
    );
    await t.test("Redux Persist rehydrates all auth fields and persists logout", async () => {
      const values = new Map<string, string>();
      const storage = {
        getItem: async (key: string) => values.get(key) ?? null,
        setItem: async (key: string, value: string) => {
          values.set(key, value);
        },
        removeItem: async (key: string) => {
          values.delete(key);
        },
      };
      const create = () =>
        configureStore({
          reducer: { auth: persistReducer({ key: "auth-test", storage }, authReducer) },
          middleware: (getDefault) => getDefault({ serializableCheck: false }),
        });
      const first = create();
      let ready!: () => void;
      const hydrated = new Promise<void>((resolve) => {
        ready = resolve;
      });
      const persist = persistStore(first, undefined, () => ready());
      await hydrated;
      first.dispatch(login(session));
      await persist.flush();
      persist.pause();
      const second = create();
      const rehydrated = new Promise<void>((resolve) => {
        ready = resolve;
      });
      const nextPersist = persistStore(second, undefined, () => ready());
      await rehydrated;
      assert.equal(second.getState().auth.user?.name, session.user.name);
      assert.equal(second.getState().auth.refreshToken, session.refreshToken);
      assert.equal(second.getState().auth.expiresIn, session.expiresIn);
      second.dispatch(logout());
      await nextPersist.flush();
      assert.equal(JSON.parse(values.get("persist:auth-test")!).accessToken, "null");
      nextPersist.pause();
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
