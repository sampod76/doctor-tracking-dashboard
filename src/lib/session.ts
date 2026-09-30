"use server";

import { TSession } from "@/types";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import "server-only";

export interface DecryptedSession {
    roleCode: string;
    userId: string | null;
    is_main_account: boolean;
    user_type: "super_admin" | "admin" | "moderator" | "writer" | "guest" | "superAdmin" | "b2b" | "b2c";
    roleBaseUserId: string;
    userUniqueId: string;
    email: string;
    iat: number;
    exp: number;
}

export async function decrypt(session: string | undefined = "") {
    try {
        if (!session) {
            throw new Error("No session token provided");
        }
        const payload = jwtDecode<DecryptedSession>(session);
        
        if (payload.exp * 1000 < Date.now()) {
            throw new Error("Session token expired");
        }
        return payload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<TSession> {
    const cookie = cookies().get("accessToken")?.value || cookies().get("session")?.value;
    if (cookie) {
        const session = await decrypt(cookie);

        if (session?.userId) {
            return {
                isAuth: true,
                is_main_account: session.is_main_account,
                user: {
                    userId: session.userId,
                    roleBaseUserId: session.roleBaseUserId,
                    userUniqueId: session.userUniqueId,
                    email: session.email,
                },
                user_type: session.user_type,
                roleCode: session.roleCode
            };
        }
    }

    return { isAuth: false, is_main_account : false,  user: null, user_type: "guest", roleCode : "" };
}
