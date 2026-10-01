import config from "@/config";
import { tags, userTags } from "@/constants";
import { login, logout } from "@/redux/features/auth/authSlice";
import type { AuthState, RefreshTokenResponse } from "@/types/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
const rawQuery = fetchBaseQuery({
  baseUrl: `${config.host}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);

    return headers;
  },
});
const mutex = new Mutex();
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  options,
) => {
  const url = typeof args === "string" ? args : args.url;
  const publicAuth = url === "/auth/login" || url === "/auth/refresh-token";
  const auth = () => (api.getState() as { auth: AuthState }).auth;
  const endSession = () => {
    api.dispatch(logout());
    api.dispatch(baseApi.util.resetApiState());
  };
  // Wait for a concurrent refresh before sending another authenticated request.
  if (!publicAuth) await mutex.waitForUnlock();
  const originalToken = auth().accessToken;
  let result = await rawQuery(args, api, options);
  if (publicAuth || result.error?.status !== 401 || !originalToken) return result;
  const release = await mutex.acquire();
  try {
    // A concurrent request may already have refreshed (or cleared) this session.
    if (!auth().accessToken) return result;
    if (auth().accessToken === originalToken) {
      const refreshToken = auth().refreshToken;
      if (!refreshToken) {
        endSession();
        return result;
      }
      const refreshed = await rawQuery(
        { url: "/auth/refresh-token", method: "POST", body: { refreshToken } },
        api,
        options,
      );
      // Do not restore a session after logout or overwrite a new login.
      if (auth().accessToken !== originalToken || auth().refreshToken !== refreshToken)
        return result;
      const response = refreshed.data as RefreshTokenResponse | undefined;
      if (
        !response?.success ||
        !response.data?.accessToken ||
        !response.data.refreshToken ||
        !response.data.user ||
        typeof response.data.expiresIn !== "number"
      ) {
        endSession();
        return result;
      }
      api.dispatch(login(response.data));
    }
    // Retry at most once; a second 401 ends the session without another refresh.
    const retryToken = auth().accessToken;
    result = await rawQuery(args, api, options);
    if (result.error?.status === 401 && auth().accessToken === retryToken) endSession();
  } finally {
    release();
  }
  return result;
};
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  endpoints: () => ({}),
  tagTypes: [...Object.values(tags), ...Object.values(userTags)],
});
