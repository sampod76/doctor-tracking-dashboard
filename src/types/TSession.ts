export type TSession  = {
    isAuth: boolean;
    user: SessionUser | null
    is_main_account: boolean
    user_type: "superAdmin" | "super_admin" | "admin" | "moderator" | "writer" | "b2b" | "b2c" | "guest"
    roleCode?: string
}

export type SessionUser = {
    userId: string;
    roleBaseUserId: string;
    userUniqueId: string;
    email: string;
}