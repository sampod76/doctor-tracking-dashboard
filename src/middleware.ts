import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildCleanPermissions } from "./utils/buildCleanPermissions";
import { decodePermissions, encodePermissions } from "./utils/permissions";

const routePermissions: { pattern: string; permission: string }[] = [
    // --- Booked / Bookings ---
    { pattern: "/dashboard/booked", permission: "bookings.read_all" },
    { pattern: "/dashboard/booked/*", permission: "bookings.read_all" },

    // --- Pages (CMS) ---
    { pattern: "/dashboard/pages/create", permission: "pages.create" },
    { pattern: "/dashboard/pages/edit/*", permission: "pages.update" },
    { pattern: "/dashboard/pages", permission: "pages.read_all" },
    { pattern: "/dashboard/pages/*", permission: "pages.read_all" },

];

// Types
interface DecryptedSession {
    roleCode: string;
    userId: string | null;
    is_main_account: boolean;
    user_type: "super_admin" | "superAdmin" | "admin" | "moderator" | "writer" | "guest" | "b2b" | "b2c";
    roleBaseUserId: string;
    userUniqueId: string;
    email: string;
    iat: number;
    exp: number;
}

// Helpers
function decryptLocal(token: string | undefined): DecryptedSession | null {
    if (!token) return null;
    try {
        const payload = jwtDecode<DecryptedSession>(token);
        if (payload.exp * 1000 < Date.now()) return null; // expired
        return payload;
    } catch {
        return null;
    }
}

/**
 * Get the required permission for a given pathname.
 * Exact matches are checked first before wildcard patterns.
 */
function getRequiredPermission(pathname: string): string | null {
    // 1. Check exact matches first
    for (const route of routePermissions) {
        if (!route.pattern.endsWith("/*") && pathname === route.pattern) {
            return route.permission;
        }
    }

    // 2. Check wildcard matches
    for (const route of routePermissions) {
        if (route.pattern.endsWith("/*")) {
            const baseRoute = route.pattern.slice(0, -2);
            if (pathname === baseRoute || pathname.startsWith(baseRoute + "/")) {
                return route.permission;
            }
        }
    }

    return null;
}

function getPermissionsFromCookie(req: NextRequest): Set<string> {
    const permCookie = req.cookies.get("permissions")?.value;
    if (!permCookie) return new Set();
    try {
        return new Set(decodePermissions(permCookie));
    } catch {
    }
    return new Set();
}

const IS_PROD = process.env.NODE_ENV === "production";

function buildCookieOptions(expires: Date) {
    return {
        httpOnly: true,
        secure: IS_PROD,
        path: "/" as const,
        sameSite: (IS_PROD ? "strict" : "lax") as "strict" | "lax",
        expires,
    };
}

const API_HOST =
    process.env.NODE_ENV === "production"
        ? process.env.BASE_URL_PROD || process.env.NEXT_PUBLIC_BASE_URL_PROD
        : process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

async function tryRefreshInMiddleware(
    refreshToken: string,
    req: NextRequest,
    destination: string,
): Promise<NextResponse | null> {
    try {
        const res = await fetch(`${API_HOST}/api/v1/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
            cache: "no-store",
        });

        const data = await res.json();

        if (!data?.success || !data?.data?.accessToken) {
            return null;
        }

        const newAccessToken: string = data.data.accessToken;
        const newRefreshToken: string | undefined = data.data.refreshToken;

        const newSession = decryptLocal(newAccessToken);
        if (!newSession?.userId) return null;

        const accessExpire = newSession.exp
            ? new Date(newSession.exp * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Continue to the originally requested page
        const response = NextResponse.next();

        response.cookies.set(
            "accessToken",
            newAccessToken,
            buildCookieOptions(accessExpire),
        );

        if (newRefreshToken) {
            const newRefreshSession = decryptLocal(newRefreshToken);
            const refreshExpire = newRefreshSession?.exp
                ? new Date(newRefreshSession.exp * 1000)
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            response.cookies.set(
                "refreshToken",
                newRefreshToken,
                buildCookieOptions(refreshExpire),
            );
        }

        // Update permissions cookie
        if (data.data.authentication) {
            const refreshExpire = newRefreshToken
                ? (() => {
                      const s = decryptLocal(newRefreshToken);
                      return s?.exp
                          ? new Date(s.exp * 1000)
                          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                  })()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

            const isSuperAdmin =
                newSession.user_type === "super_admin" ||
                newSession.user_type === "superAdmin" ||
                newSession.roleCode === "super_admin";

            if (isSuperAdmin) {
                response.cookies.delete("permissions");
            } else {
                const cleaned = buildCleanPermissions(data.data.authentication);
                const encoded = encodePermissions(cleaned);
                response.cookies.set("permissions", encoded, {
                    httpOnly: false, // client needs access
                    secure: IS_PROD,
                    path: "/",
                    sameSite: IS_PROD ? "strict" : "lax",
                    expires: refreshExpire,
                });
            }
        }

        console.log(
            `[Middleware] Token refreshed for ${newSession.email} -> continuing to ${destination}`,
        );
        return response;
    } catch (err) {
        console.error("[Middleware] Refresh fetch error:", err);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 1. Try access token first
    const accessTokenCookie = req.cookies.get("accessToken")?.value;
    const session = decryptLocal(accessTokenCookie);

    // 2. If access token is invalid/expired, try refresh token
    if (!session?.userId && !pathname.startsWith("/auth")) {
        const refreshToken = req.cookies.get("refreshToken")?.value;

        if (refreshToken) {
            const refreshed = await tryRefreshInMiddleware(
                refreshToken,
                req,
                pathname,
            );
            if (refreshed) {
                // Permission check on the refreshed session
                const newAccessToken = refreshed.cookies.get("accessToken")?.value;
                const newSession = decryptLocal(newAccessToken);
                const isSuperAdmin =
                    newSession?.roleCode === "super_admin" ||
                    newSession?.user_type === "super_admin" ||
                    newSession?.user_type === "superAdmin";

                if (isSuperAdmin) {
                    return refreshed;
                }

                const requiredPermission = getRequiredPermission(pathname);

                if (requiredPermission) {
                    const newPermCookie = refreshed.cookies.get("permissions")?.value;
                    const perms = newPermCookie
                        ? new Set(decodePermissions(newPermCookie))
                        : new Set<string>();

                    if (!perms.has(requiredPermission)) {
                        return NextResponse.redirect(new URL("/403", req.url));
                    }
                }

                return refreshed;
            }
        }

        // No refresh token or refresh failed -> send to login
        const loginUrl = new URL(`/auth/signin?redirect=${pathname}`, req.url);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete("accessToken");
        res.cookies.delete("refreshToken");
        res.cookies.delete("permissions");
        return res;
    }

    // 3. Logged-in user hitting /auth/* -> redirect home
    if (session?.userId && pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 4. Auth page without session (normal) -> allow
    if (!session?.userId && pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    // 5. Permission-based access check
    const isSuperAdmin =
        session?.roleCode === "super_admin" ||
        session?.user_type === "super_admin" ||
        session?.user_type === "superAdmin";

    // Super Admin completely bypasses all route permission checks!
    if (isSuperAdmin) {
        return NextResponse.next();
    }

    const requiredPermission = getRequiredPermission(pathname);
    if (requiredPermission) {
        const userPermissions = getPermissionsFromCookie(req);
        if (!userPermissions.has(requiredPermission)) {
            return NextResponse.redirect(new URL("/403", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
