/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import config from "@/config";
import { decrypt } from "@/lib/session";
import {
    SetAccessToken,
    SetPermissions,
    SetRefreshToken,
} from "@/lib/set-cookie";
import {
    passwordSetSchema,
    PasswordSetValues,
} from "@/schema/change-password.schema";
import { loginSchema, otpSchema } from "@/schema/signin.schema";
import { buildCleanPermissions } from "@/utils/buildCleanPermissions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SigninFormValues {
    token_id: string;
    otp: string;
}

interface SignupFormValues {
    full_name: string;
    email: string;
    phone: string;
    password: string;
}

export async function signin(formData: SigninFormValues) {
    const validatedFields = otpSchema.safeParse({
        token_id: formData.token_id,
        otp: formData.otp,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const res = await fetch(`${config.host}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token_id: formData.token_id,
                otp: formData.otp,
            }),
            credentials: "include",
        });

        const result = await res.json();

        if (!result?.success) {
            return {
                success: false,
                message: result?.message || "Login failed",
            };
        }

        if (result?.success) {
            const decryptedAccessToken = await decrypt(
                result?.data?.accessToken,
            );
            const decryptedRefreshToken = await decrypt(
                result?.data?.refreshToken,
            );

            const accessTokenExpire = decryptedAccessToken?.exp
                ? new Date(decryptedAccessToken.exp * 1000)
                : new Date(Date.now() + 24 * 60 * 60 * 1000);
            const refreshTokenExpire = decryptedRefreshToken?.exp
                ? new Date(decryptedRefreshToken.exp * 1000)
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

            await SetAccessToken(result?.data?.accessToken, accessTokenExpire);
            if (result?.data?.refreshToken) {
                await SetRefreshToken(
                    result?.data?.refreshToken,
                    refreshTokenExpire,
                );
            }

            if (result?.data?.authentication) {
                if (
                    result.data.userData?.user_type === "super_admin" ||
                    result.data.authentication?.roleCode === "super_admin"
                ) {
                    cookies().delete("permissions");
                } else {
                    const cleanedPermissions = buildCleanPermissions(
                        result.data.authentication,
                    );
                    await SetPermissions(
                        cleanedPermissions,
                        refreshTokenExpire,
                    );
                }
            } else if (result?.data?.userData?.authentication) {
                const cleanedPermissions = buildCleanPermissions(
                    result.data.userData.authentication,
                );
                await SetPermissions(
                    cleanedPermissions,
                    refreshTokenExpire,
                );
            }
        }
        // Return success response
        return {
            success: result?.success,
            data: result.data,
        };
    } catch (error) {
        console.log(error, "error");
        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function googleSignIn(code: string) {
    try {
        const res = await fetch(`${config.host}/api/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
            }),
        });

        const result = await res.json();

        if (!result?.success) {
            return {
                success: false,
                message: result?.message || "Login failed",
            };
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (result?.success)
            await SetAccessToken(result?.data?.accessToken, expiresAt);

        // Return success response
        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        // Handle any network or unexpected errors
        return {
            success: false,
            error,
        };
    }
}

export async function ChangePassword(formData: PasswordSetValues) {
    const validatedFields = passwordSetSchema.safeParse({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const sessionCookie = cookies().get("accessToken") || cookies().get("session");

        const res = await fetch(`${config.host}/api/v1/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionCookie?.value || ""}`,
            },
            body: JSON.stringify({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            }),
            credentials: "include",
        });

        const result = await res.json();
        cookies().delete("is_change_password");

        if (!result?.success) {
            return {
                success: false,
                message: result?.message || "Password Change failed",
            };
        }
        // Return success response
        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        return {
            success: false,
            error,
        };
    }
}

export async function signup(formData: SignupFormValues) {
    const validatedFields = loginSchema.safeParse({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const res = await fetch(`${config.host}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            }),
            credentials: "include",
        });

        const result = await res.json();

        if (!result?.success) {
            return {
                success: false,
                message: result?.message || "Signup failed",
            };
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (result?.success)
            await SetAccessToken(result?.data?.accessToken, expiresAt);
        // Return success response
        return {
            success: true,
            data: result.data,
        };
    } catch {
        return {
            success: false,
            errors: "Something went wrong. Please try again.",
        };
    }
}

export async function signout() {
    const sessionCookie = cookies().get("accessToken") || cookies().get("session");
    const refreshTokenCookie = cookies().get("refreshToken");
    if (!refreshTokenCookie?.value) {
        cookies().delete("accessToken");
        cookies().delete("refreshToken");
        cookies().delete("permissions");
        cookies().delete("session");
        redirect("/auth/signin");
        return { success: false, message: "No refresh token" };
    }

    try {
        await fetch(config.host + "/api/v1/auth/logout", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionCookie?.value}` || "",
            },
            body: JSON.stringify({
                refreshToken: refreshTokenCookie.value,
            }),
            method: "POST",
            cache: "no-store",
        });
    } catch (e) {
        console.error("Signout error:", e);
    }
    cookies().delete("accessToken");
    cookies().delete("refreshToken");
    cookies().delete("permissions");
    cookies().delete("session");
    redirect("/auth/signin");
}

export async function handleRefreshToken() {
    try {
        const refreshTokenCookie = cookies().get("refreshToken");

        if (!refreshTokenCookie?.value) {
            return { success: false, message: "No refresh token" };
        }

        const res = await fetch(`${config.host}/api/v1/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: refreshTokenCookie.value,
            }),
            credentials: "include",
        });

        const result = await res.json();

        if (!result?.success) {
            return {
                success: false,
                message: result?.message || "Refresh token failed",
            };
        }

        const decryptedAccessToken = await decrypt(result?.data?.accessToken);
        const decryptedRefreshToken = await decrypt(result?.data?.refreshToken);

        const accessTokenExpire = decryptedAccessToken?.exp
            ? new Date(decryptedAccessToken.exp * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        const refreshTokenExpire = decryptedRefreshToken?.exp
            ? new Date(decryptedRefreshToken.exp * 1000)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        await SetAccessToken(result?.data?.accessToken, accessTokenExpire);
        if (result?.data?.refreshToken) {
            await SetRefreshToken(
                result?.data?.refreshToken,
                refreshTokenExpire,
            );
        }

        if (result?.data?.authentication) {
            if (
                result.data.userData?.user_type === "super_admin" ||
                result.data.authentication?.roleCode === "super_admin"
            ) {
                cookies().delete("permissions");
            } else {
                const cleanedPermissions = buildCleanPermissions(
                    result.data.authentication,
                );
                await SetPermissions(cleanedPermissions, refreshTokenExpire);
            }
        } else if (result?.data?.userData?.authentication) {
            const cleanedPermissions = buildCleanPermissions(
                result.data.userData.authentication,
            );
            await SetPermissions(cleanedPermissions, refreshTokenExpire);
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        return { success: false, message: "Refresh token error" };
    }
}