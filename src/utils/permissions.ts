// src/utils/permissions.ts
// Note: encodePermissions and decodePermissions are defined in this same file below.

export const getPermissionsCookie = (): Record<string, boolean> => {
    if (typeof document === "undefined") return {};
    const value = `; ${document.cookie}`;
    const parts = value.split(`; permissions=`);
    if (parts.length === 2) {
        try {
            const cookieStr = parts.pop()?.split(";").shift();
            if (!cookieStr) return {};
            // Decode compact numeric-index format (e.g. "0,5,12,...") into permission strings
            const decoded = decodePermissions(decodeURIComponent(cookieStr));
            const permMap: Record<string, boolean> = {};
            for (const code of decoded) {
                permMap[code] = true;
            }
            return permMap;
        } catch (e) {
            console.error("Cookie parse error:", e);
            return {};
        }
    }
    return {};
};

/**
 * Check if the user has access based on the permission(s) and permissions map.
 */
export const hasPermission = (
    permission: string | string[],
    userPermissions: Record<string, boolean> = {},
    isSuperAdmin: boolean = false,
    mode: "all" | "any" = "all",
): boolean => {
    if (isSuperAdmin) return true;
    if (!permission) return true;

    const check = (perm: string) => userPermissions[perm] === true;

    if (Array.isArray(permission)) {
        if (permission.length === 0) return true;
        return mode === "all" ? permission.every(check) : permission.some(check);
    }

    return check(permission);
};

/**
 * Ordered list of all known permissions.
 * The array INDEX is what gets stored in the cookie instead of the full string.
 * ?? NEVER reorder or remove items - only append new permissions to the end.
 *    Changing indices will invalidate existing cookies for logged-in users.
 */
export const PERMISSION_LIST: string[] = [
    // --- Administration & Users ---
    "administration.read_all_admin",
    "administration.create",
    "administration.update",
    "administration.delete",
    "administration.read_all_b2c",
    "administration.update_b2c",
    "user.read_all_admin",
    "user.create_admin",
    "user.update_admin",
    "user.delete_admin",
    "user.read_all_b2c",
    "user.update_b2c",
    "audit_log.read",

    // --- Authorization (Roles, Permissions, Modules) ---
    "roles.read_all",
    "roles.create",
    "roles.update",
    "roles.delete",
    "role.read_all",
    "role.create",
    "role.update",
    "role.update_status",
    "role.delete",
    "permissions.read_all",
    "permissions.create",
    "permissions.update",
    "permissions.delete",
    "permission.read_all",
    "permission.create",
    "permission.update",
    "permission.update_status",
    "permission.delete",
    "modules.read_all",
    "modules.create",
    "modules.update",
    "modules.delete",
    "modules.update_status",

    // --- Dashboard ---
    "dashboard.view",
    "dashboard.read_stats",
    "dashboard.read_chart",
    "dashboard.read_analytics_chart",

    // --- Bookings ---
    "bookings.read",
    "bookings.read_all",
    "bookings.update",
    "bookings.update_status",
    "bookings.cancel",
    "bookings.delete",

    // --- Tours ---
    "tour.read",
    "tour.read_all",
    "tour.create",
    "tour.update",
    "tour.update_status",
    "tour.delete",
    "tour.tour_bookings",
    "tour.tour_availability",
    "tour.tour_attributes",
    "tour.tour_enquiry",
    "tour_booking.read_all",
    "tour_availability.manage",
    "tour_attributes.manage",
    "tour_enquiry.read_all",
    "tour_enquiry.update_status",
    "tour_enquiry.delete",

    // --- Hajj ---
    "hajj.read_all",
    "hajj.create",
    "hajj.update",
    "hajj.update_status",
    "hajj.delete",
    "hajj.hajj_enquiries",
    "hajj.manage_pre-registration_list",
    "hajj_pre_registration.read_all",
    "hajj_pre_registration.update_status",
    "hajj_pre_registration.delete",
    "hajj_enquiry.read_all",
    "hajj_enquiry.update_status",
    "hajj_attributes.manage",

    // --- Umrah ---
    "umrah.read_all",
    "umrah.create",
    "umrah.update",
    "umrah.update_status",
    "umrah.delete",
    "umrah.umrah_attributes",
    "umrah.umrah_enquiries",
    "umrah_enquiry.read_all",
    "umrah_enquiry.update_status",
    "umrah_attributes.manage",

    // --- Hotels ---
    "hotel.read",
    "hotel.read_all",
    "hotel.create",
    "hotel.update",
    "hotel.update_status",
    "hotel.delete",
    "hotel.hotel_attributes",
    "hotel.hotel_highlights",
    "hotel.room_availability",
    "hotel.hotel_rooms",
    "hotel_room.manage",
    "hotel_room.availability",
    "hotel_highlights.manage",
    "hotel_attributes.manage",

    // --- Visa ---
    "visa.read_all",
    "visa.create",
    "visa.update",
    "visa.update_status",
    "visa.delete",
    "visa.visa_enquiry",
    "visa.visa_appointments",
    "visa.visa_attributes",
    "visa.visa_top_country",
    "visa_enquiry.read_all",
    "visa_enquiry.update_status",
    "visa_appointments.read_all",
    "visa_attributes.manage",
    "visa_top_country.manage",

    // --- Blog ---
    "blog.read",
    "blog.read_all",
    "blog.create",
    "blog.update",
    "blog.update_status",
    "blog.delete",
    "blog.blog_comments",
    "blog.blog_topics",
    "blog.blog_tags",
    "blog_topics.manage",
    "blog_tags.manage",
    "blog_comments.read_all",
    "blog_comments.delete",

    // --- Categories, Zone & Country ---
    "category.read_all",
    "category.create",
    "category.update",
    "category.update_position",
    "category.delete",
    "zone.read_all",
    "zone.create",
    "zone.update",
    "zone.delete",
    "country.read_all",
    "country.create",
    "country.update",
    "country.delete",
    "country.popular_country",
    "popular_country.manage",

    // --- Pages ---
    "pages.read",
    "pages.read_all",
    "pages.create",
    "pages.update",
    "pages.update_status",
    "pages.delete",

    // --- Team & Management ---
    "team.read_all",
    "team.create",
    "team.update",
    "team.delete",
    "team.team_members",
    "team.management_staff",
    "team.departments",
    "team.designation",
    "team.equipment",
    "team.guide_designation",
    "guide.read_all",
    "guide.create",
    "guide.update",
    "guide.delete",
    "guide_designation.manage",
    "management.read_all",
    "management.manage",
    "department.read_all",
    "department.create",
    "department.update",
    "department.delete",
    "designation.manage",
    "equipment.manage",

    // --- Offers, Advertisement, Notifications ---
    "offers.read_all",
    "offers.create",
    "offers.update",
    "offers.update_status",
    "offers.delete",
    "advertisement.read_all",
    "advertisement.create",
    "advertisement.update",
    "advertisement.update_status",
    "advertisement.delete",
    "advertisement.ads_category",
    "ads_category.manage",
    "notifications.read_all",
    "notifications.create",
    "notifications.delete",

    // --- Reviews, Gallery, FAQs, Contact ---
    "reviews.read_all",
    "reviews.update",
    "reviews.update_status",
    "reviews.delete",
    "manual_reviews.read_all",
    "manual_reviews.create",
    "manual_reviews.update",
    "manual_reviews.delete",
    "gallery.read_all",
    "gallery.create",
    "gallery.update",
    "gallery.delete",
    "faqs.read_all",
    "faqs.create",
    "faqs.update",
    "faqs.update_status",
    "faqs.delete",
    "contact.read",
    "contact.read_all",
    "contact.update",
    "contact.update_status",
    "contact.delete",

    // --- Payment, Reports, Special Fare ---
    "payment_coupon.read_all",
    "payment_coupon.create",
    "payment_coupon.update",
    "payment_coupon.delete",
    "payment_gateway.manage",
    "sales_report.view",
    "sales_report.export",
    "transactions.read_all",
    "group_ticket_request.read_all",
    "group_ticket_request.manage",
];


/**
 * Reverse lookup: permission string -> numeric index (built once at module load).
 */
export const PERMISSION_INDEX: Record<string, number> = Object.fromEntries(
    PERMISSION_LIST.map((perm, i) => [perm, i]),
);

/**
 * Encode an array of permission strings into a compact comma-separated
 * string of numeric indices.
 * Unknown permissions (not in the map) are silently skipped.
 */
export function encodePermissions(permissions: string[]): string {
    return permissions
        .map((p) => PERMISSION_INDEX[p])
        .filter((idx) => idx !== undefined)
        .join(",");
}

/**
 * Decode a compact comma-separated index string back to permission strings.
 */
export function decodePermissions(encoded: string): string[] {
    if (!encoded) return [];
    return encoded
        .split(",")
        .map(Number)
        .filter((i) => i >= 0 && i < PERMISSION_LIST.length)
        .map((i) => PERMISSION_LIST[i]);
}