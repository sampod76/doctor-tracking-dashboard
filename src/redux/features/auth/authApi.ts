import { tags, userTags } from "@/constants";
import { TResponseRedux } from "@/types";
import { baseApi } from "../../api/baseApi";

const url = `/auth`

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login
        siginin: builder.mutation({
            query: (data) => {
                return {
                    url: `${url}/login`,
                    method: "POST",
                    body: data,
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        sendLoginRequest: builder.mutation({
            query: (data) => {
                return {
                    url: `${url}/send-login-request`,
                    method: "POST",
                    body: data,
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Rsend OTP
        resendOtp: builder.mutation({
            query: (data) => ({
                url: `${url}/resend-otp`,
                method: "POST",
                body: data,
            }),
        }),

        // Register
        createSubAdmin: builder.mutation({
            query: (data) => ({
                url: `/users/create-sub-admin-account`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [userTags.admin],
        }),
        // Temp User Register
        createTempUser: builder.mutation({
            query: (data) => ({
                url: `/users/temp-user`,
                method: "POST",
                body: data,
            }),
        }),

        // Get user profile
        getUserProfile: builder.query({
            query: () => ({
                url: `${url}/profile`,
                method: "GET",
            }),
            providesTags: [tags.userTag],
            transformResponse: (response: TResponseRedux<unknown>) => {
                return response.data;
            },
        }),

        verifyAccount: builder.mutation({
            query: ({ email, token }) => {
                return {
                    url: `${url}/verify/${email}`,
                    method: "POST",
                    headers: {
                        Authorization: token,
                    },
                };
            },
        }),
        forgetPassword: builder.mutation({
            query: (data) => {
                return {
                    url: `${url}/forgot-password`,
                    body: data,
                    method: "POST",
                };
            },
        }),
        changePassword: builder.mutation({
            query: (data) => {
                return {
                    url: `${url}/change-password`,
                    body: data,
                    method: "POST",
                };
            },
        }),
        getTokenOTPforgetPassword: builder.mutation({
            query: (data) => {
                return {
                    url: `${url}/forgot-password/set-otp`,
                    body: data,
                    method: "POST",
                };
            },
        }),
        resetPassword: builder.mutation({
            query: ({ resetPasswordToken, newPassword, token_id }) => ({
                url: `${url}/forgot-password/token-to-set-password`,
                method: "POST",
                body: { resetPasswordToken, newPassword, token_id },
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useSigininMutation,
    useSendLoginRequestMutation,
    useResendOtpMutation,
    useCreateTempUserMutation,
    useChangePasswordMutation,
    useCreateSubAdminMutation,
    useGetUserProfileQuery,
    useGetTokenOTPforgetPasswordMutation,
    useVerifyAccountMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
} = authApi;
