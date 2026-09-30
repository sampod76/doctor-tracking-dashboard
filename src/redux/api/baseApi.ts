/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "@/config";
import { tags, userTags } from "@/constants";
import { logout, update } from "@/redux/features/auth/authSlice";
import {
    BaseQueryApi,
    BaseQueryFn,
    createApi,
    DefinitionType,
    FetchArgs,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
    baseUrl: `${config.host}/api/v1`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        headers.set(
            "X-Time-Zone",
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        return headers;
    },
});

const mutex = new Mutex();

const baseQueryWithRefreshToken: BaseQueryFn<
    FetchArgs,
    BaseQueryApi,
    DefinitionType
> = async (args, api, extraOption): Promise<any> => {
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock();

    let result = await baseQuery(args, api, extraOption);

    if (result?.error?.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();

            try {
                const { handleRefreshToken } = await import("@/service/auth");
                const res = await handleRefreshToken();

                if (res?.success && res?.data?.accessToken) {
                    api.dispatch(update({ accessToken: res.data.accessToken }));
                    // Retry the original query with the new token
                    result = await baseQuery(args, api, extraOption);
                } else {
                    // Refresh token is invalid/expired - sign the user out
                    api.dispatch(logout());
                    api.dispatch(baseApi.util.resetApiState());
                    try {
                        const { signout } = await import("@/service/auth");
                        await signout();
                    } catch {
                        // Ignore Next.js redirect errors from server actions
                    }
                    if (typeof window !== "undefined") {
                        window.location.href = "/auth/signin";
                    }
                }
            } finally {
                release();
            }
        } else {
            // Another request is already refreshing - wait, then retry
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOption);
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQueryWithRefreshToken,
    endpoints: () => ({}),
    tagTypes: [...Object.values(tags), ...Object.values(userTags)],
});
