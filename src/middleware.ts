import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildCleanPermissions } from "./utils/buildCleanPermissions";
import { decodePermissions, encodePermissions } from "./utils/permissions";

// Route -> Permission Mapping
// Each route pattern maps to the permission code required to access it.
// Wildcard routes (/*) match all sub-paths.
// Specific routes take precedence over wildcard routes.
const routePermissions: { pattern: string; permission: string }[] = [
    // --- Booked / Bookings ---
    { pattern: "/dashboard/booked", permission: "bookings.read_all" },
    { pattern: "/dashboard/booked/*", permission: "bookings.read_all" },

    // --- Pages (CMS) ---
    { pattern: "/dashboard/pages/create", permission: "pages.create" },
    { pattern: "/dashboard/pages/edit/*", permission: "pages.update" },
    { pattern: "/dashboard/pages", permission: "pages.read_all" },
    { pattern: "/dashboard/pages/*", permission: "pages.read_all" },

    // --- Location / Country / Zone / Category ---
    { pattern: "/dashboard/country", permission: "country.read_all" },
    { pattern: "/dashboard/country/*", permission: "country.read_all" },
    { pattern: "/dashboard/popular-country", permission: "country.popular_country" },
    { pattern: "/dashboard/popular-country/*", permission: "country.popular_country" },
    { pattern: "/dashboard/zone", permission: "zone.read_all" },
    { pattern: "/dashboard/zone/*", permission: "zone.read_all" },
    { pattern: "/dashboard/category/list", permission: "category.read_all" },
    { pattern: "/dashboard/category/location-category", permission: "category.read_all" },
    { pattern: "/dashboard/category/label-value", permission: "category.read_all" },
    { pattern: "/dashboard/category/*", permission: "category.read_all" },

    // --- Blog ---
    { pattern: "/dashboard/blog/list", permission: "blog.read_all" },
    { pattern: "/dashboard/blog/create", permission: "blog.create" },
    { pattern: "/dashboard/blog/blog-edit", permission: "blog.update" },
    { pattern: "/dashboard/blog/tags", permission: "blog.blog_tags" },
    { pattern: "/dashboard/blog/topics", permission: "blog.blog_topics" },
    { pattern: "/dashboard/blog/comments", permission: "blog.blog_comments" },
    { pattern: "/dashboard/blog/*", permission: "blog.read_all" },

    // --- Hotel ---
    { pattern: "/dashboard/hotel/list", permission: "hotel.read_all" },
    { pattern: "/dashboard/hotel/create", permission: "hotel.create" },
    { pattern: "/dashboard/hotel/edit/*", permission: "hotel.update" },
    { pattern: "/dashboard/hotel/highlights", permission: "hotel.hotel_highlights" },
    { pattern: "/dashboard/hotel/hotelAttributes", permission: "hotel.hotel_attributes" },
    { pattern: "/dashboard/hotel/hotelAttributes/*", permission: "hotel.hotel_attributes" },
    { pattern: "/dashboard/hotel/room-attributes", permission: "hotel.hotel_attributes" },
    { pattern: "/dashboard/hotel/room-attributes/*", permission: "hotel.hotel_attributes" },
    { pattern: "/dashboard/hotel/room/*", permission: "hotel.hotel_rooms" },
    { pattern: "/dashboard/hotel/*", permission: "hotel.read_all" },

    // --- Tour ---
    { pattern: "/dashboard/tour/list", permission: "tour.read_all" },
    { pattern: "/dashboard/tour/create", permission: "tour.create" },
    { pattern: "/dashboard/tour/tour-edit", permission: "tour.update" },
    { pattern: "/dashboard/tour/edit/*", permission: "tour.update" },
    { pattern: "/dashboard/tour/enquiry", permission: "tour.tour_enquiry" },
    { pattern: "/dashboard/tour/enquiry/*", permission: "tour.tour_enquiry" },
    { pattern: "/dashboard/tour/tourAttributes", permission: "tour.tour_attributes" },
    { pattern: "/dashboard/tour/tourAttributes/*", permission: "tour.tour_attributes" },
    { pattern: "/dashboard/tour/availablity", permission: "tour.tour_availability" },
    { pattern: "/dashboard/tour/booking", permission: "tour.tour_bookings" },
    { pattern: "/dashboard/tour/booking/*", permission: "tour.tour_bookings" },
    { pattern: "/dashboard/tour/recovery", permission: "tour.tour_availability" },
    { pattern: "/dashboard/tour/*", permission: "tour.read_all" },

    // --- Hajj ---
    { pattern: "/dashboard/hajj/all-hajj", permission: "hajj.read_all" },
    { pattern: "/dashboard/hajj/add-new-hajj", permission: "hajj.create" },
    { pattern: "/dashboard/hajj/edit", permission: "hajj.update" },
    { pattern: "/dashboard/hajj/availablity", permission: "hajj.read_all" },
    { pattern: "/dashboard/hajj/pre-registationlist", permission: "hajj.manage_pre-registration_list" },
    { pattern: "/dashboard/hajj/enquiry", permission: "hajj.hajj_enquiries" },
    { pattern: "/dashboard/hajj/enquiry/*", permission: "hajj.hajj_enquiries" },
    { pattern: "/dashboard/hajj/attributes", permission: "hajj.read_all" },
    { pattern: "/dashboard/hajj/attributes/*", permission: "hajj.read_all" },
    { pattern: "/dashboard/hajj/*", permission: "hajj.read_all" },

    // --- Umrah ---
    { pattern: "/dashboard/umrah/list", permission: "umrah.read_all" },
    { pattern: "/dashboard/umrah/create", permission: "umrah.create" },
    { pattern: "/dashboard/umrah/edit", permission: "umrah.update" },
    { pattern: "/dashboard/umrah/availablity", permission: "umrah.read_all" },
    { pattern: "/dashboard/umrah/enquiry", permission: "umrah.umrah_enquiries" },
    { pattern: "/dashboard/umrah/enquiry/*", permission: "umrah.umrah_enquiries" },
    { pattern: "/dashboard/umrah/attributes", permission: "umrah.umrah_attributes" },
    { pattern: "/dashboard/umrah/attributes/*", permission: "umrah.umrah_attributes" },
    { pattern: "/dashboard/umrah/*", permission: "umrah.read_all" },

    // --- Visa ---
    { pattern: "/dashboard/visa/all-visa", permission: "visa.read_all" },
    { pattern: "/dashboard/visa/add-new-visa", permission: "visa.create" },
    { pattern: "/dashboard/visa/edit", permission: "visa.update" },
    { pattern: "/dashboard/visa/enquiry", permission: "visa.visa_enquiry" },
    { pattern: "/dashboard/visa/enquiry/*", permission: "visa.visa_enquiry" },
    { pattern: "/dashboard/visa/attributes", permission: "visa.visa_attributes" },
    { pattern: "/dashboard/visa/attributes/*", permission: "visa.visa_attributes" },
    { pattern: "/dashboard/visa/availability", permission: "visa.read_all" },
    { pattern: "/dashboard/visa/top-country-list", permission: "visa.visa_top_country" },
    { pattern: "/dashboard/visa/appointments", permission: "visa.visa_appointments" },
    { pattern: "/dashboard/visa/appointments/*", permission: "visa.visa_appointments" },
    { pattern: "/dashboard/visa/visa-type", permission: "visa.visa_attributes" },
    { pattern: "/dashboard/visa/recovery", permission: "visa.read_all" },
    { pattern: "/dashboard/visa/*", permission: "visa.read_all" },

    // --- Offers / Promotion ---
    { pattern: "/dashboard/offers/list", permission: "offers.read_all" },
    { pattern: "/dashboard/offers/create", permission: "offers.create" },
    { pattern: "/dashboard/offers/edit", permission: "offers.update" },
    { pattern: "/dashboard/offers/*", permission: "offers.read_all" },

    // --- Team & Guide & Staff ---
    { pattern: "/dashboard/guide/list", permission: "team.read_all" },
    { pattern: "/dashboard/guide/guide-designation", permission: "team.guide_designation" },
    { pattern: "/dashboard/guide/create", permission: "team.create" },
    { pattern: "/dashboard/guide/guide-edit", permission: "team.update" },
    { pattern: "/dashboard/guide/*", permission: "team.read_all" },
    { pattern: "/dashboard/management/list", permission: "team.management_staff" },
    { pattern: "/dashboard/management/*", permission: "team.management_staff" },
    { pattern: "/dashboard/team/list", permission: "team.team_members" },
    { pattern: "/dashboard/team/create", permission: "team.create" },
    { pattern: "/dashboard/team/edit", permission: "team.update" },
    { pattern: "/dashboard/team/*", permission: "team.team_members" },
    { pattern: "/dashboard/department", permission: "team.departments" },
    { pattern: "/dashboard/department/*", permission: "team.departments" },
    { pattern: "/dashboard/desingnation", permission: "team.designation" },
    { pattern: "/dashboard/desingnation/*", permission: "team.designation" },
    { pattern: "/dashboard/equipment", permission: "team.equipment" },
    { pattern: "/dashboard/equipment/create", permission: "team.equipment" },
    { pattern: "/dashboard/equipment/edit/*", permission: "team.equipment" },
    { pattern: "/dashboard/equipment/view", permission: "team.equipment" },
    { pattern: "/dashboard/equipment/*", permission: "team.equipment" },

    // --- Faqs ---
    { pattern: "/dashboard/faqs/list", permission: "faqs.read_all" },
    { pattern: "/dashboard/faqs/create", permission: "faqs.create" },
    { pattern: "/dashboard/faqs/faqs-edit", permission: "faqs.update" },
    { pattern: "/dashboard/faqs/*", permission: "faqs.read_all" },

    // --- Gallery ---
    { pattern: "/dashboard/gallery/create", permission: "gallery.create" },
    { pattern: "/dashboard/gallery/edit/*", permission: "gallery.update" },
    { pattern: "/dashboard/gallery", permission: "gallery.read_all" },
    { pattern: "/dashboard/gallery/*", permission: "gallery.read_all" },

    // --- Reviews ---
    { pattern: "/dashboard/reviews", permission: "reviews.read_all" },
    { pattern: "/dashboard/reviews/*", permission: "reviews.read_all" },
    { pattern: "/dashboard/manual-review", permission: "manual_reviews.read_all" },
    { pattern: "/dashboard/manual-review/list", permission: "manual_reviews.read_all" },
    { pattern: "/dashboard/manual-review/*", permission: "manual_reviews.read_all" },

    // --- Contact Us ---
    { pattern: "/dashboard/contact", permission: "contact.read_all" },
    { pattern: "/dashboard/contact/*", permission: "contact.read_all" },

    // --- Advertisement ---
    { pattern: "/dashboard/advertisement/category", permission: "advertisement.ads_category" },
    { pattern: "/dashboard/advertisement", permission: "advertisement.read_all" },
    { pattern: "/dashboard/advertisement/*", permission: "advertisement.read_all" },

    // --- Notifications ---
    { pattern: "/dashboard/notifications", permission: "notifications.read_all" },
    { pattern: "/dashboard/notifications/*", permission: "notifications.read_all" },

    // --- Authorization ---
    { pattern: "/dashboard/authoriztion/modules/create", permission: "modules.create" },
    { pattern: "/dashboard/authoriztion/modules/edit/*", permission: "modules.update" },
    { pattern: "/dashboard/authoriztion/modules", permission: "modules.read_all" },
    { pattern: "/dashboard/authoriztion/roles/create", permission: "roles.create" },
    { pattern: "/dashboard/authoriztion/roles/edit/*", permission: "roles.update" },
    { pattern: "/dashboard/authoriztion/roles", permission: "roles.read_all" },
    { pattern: "/dashboard/authoriztion/permissions", permission: "permissions.read_all" },
    { pattern: "/dashboard/authoriztion/*", permission: "modules.read_all" },

    // --- Administration ---
    { pattern: "/dashboard/administration/admins", permission: "administration.read_all_admin" },
    { pattern: "/dashboard/administration/b2cusers", permission: "administration.read_all_b2c" },
    { pattern: "/dashboard/administration/*", permission: "administration.read_all_admin" },
    { pattern: "/dashboard/audit-logs", permission: "audit_log.read" },
    { pattern: "/dashboard/audit-logs/*", permission: "audit_log.read" },

    // --- Payment, Reports, Special Fare ---
    { pattern: "/dashboard/payment/coupon", permission: "payment_coupon.read_all" },
    { pattern: "/dashboard/payment/gateway", permission: "payment_gateway.manage" },
    { pattern: "/dashboard/reports/sales-reports", permission: "sales_report.view" },
    { pattern: "/dashboard/reports/transactions-history", permission: "transactions.read_all" },
    { pattern: "/dashboard/special-fare/group-ticket-request", permission: "group_ticket_request.read_all" },
    { pattern: "/dashboard/special-fare/group-booking-request", permission: "group_ticket_request.manage" },
    { pattern: "/dashboard/special-fare/*", permission: "group_ticket_request.read_all" },
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
