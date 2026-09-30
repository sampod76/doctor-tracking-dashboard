import { encodePermissions } from "@/utils/permissions";
import { cookies } from "next/headers";

export async function SetAccessToken(token: string, expiresAt: Date) {
    cookies().set("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires: expiresAt,
    });
}

export async function SetRefreshToken(token: string, expiresAt: Date) {
    cookies().set("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires: expiresAt,
    });
}

export async function SetPermissions(permissions: string[], expiresAt: Date) {
    // Encode to compact numeric indices (e.g. "0,5,12,...") to stay within the 4096-byte cookie limit
    const encoded = encodePermissions(permissions);
    cookies().set("permissions", encoded, {
        httpOnly: false, // Client should also access it
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires: expiresAt,
    });
}
