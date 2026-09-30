"use client";

import { useSession } from "@/provider/session-provider";
import { getPermissionsCookie } from "@/utils/permissions";
import { Spin } from "antd";
import { ReactNode, useEffect, useState } from "react";

interface PermissionGuardProps {
    permission?: string | string[]; // Can be a single permission or an array of permissions
    mode?: "all" | "any"; // If true, the user must have ALL the specified permissions
    children: ReactNode;
    fallback?: ReactNode; // Render this if the user doesn't have permission (e.g. null, or a disabled button)
}

export default function PermissionGuard({
    permission,
    mode = "all",
    children,
    fallback = null,
}: PermissionGuardProps) {
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const { session } = useSession();

    const isSuperAdmin =
        session?.roleCode === "super_admin" ||
        session?.user_type === "super_admin" ||
        session?.user_type === "superAdmin";

    useEffect(() => {
        setIsMounted(true);
        if (!permission || isSuperAdmin) {
            setHasAccess(true);
            return;
        }

        const userPermissions = getPermissionsCookie();
        const checkPermission = (perm: string) =>
            userPermissions[perm] === true;

        if (Array.isArray(permission)) {
            if (permission.length === 0) {
                setHasAccess(true);
            } else if (mode === "all") {
                setHasAccess(permission.every(checkPermission));
            } else {
                setHasAccess(permission.some(checkPermission));
            }
        } else {
            setHasAccess(checkPermission(permission));
        }
    }, [permission, mode, isSuperAdmin]);

    if (isSuperAdmin) {
        return <>{children}</>;
    }

    // Prevent hydration mismatch since permissions are read from cookies on client side
    if (!isMounted) {
        return (
            <Spin
                size="small"
                spinning={isMounted}
                tip="Loading permissions..."
            />
        );
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

