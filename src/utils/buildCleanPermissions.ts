export interface AuthenticationSnapshot {
    assignedRoles?: unknown[];
    permissions?: string[];
    deniedPermissions?: string[];
    roleId?: string;
    roleCode?: string;
}

export const buildCleanPermissions = (authentication: AuthenticationSnapshot): string[] => {
    const permissions = new Set<string>(authentication.permissions || []);

    // Remove denied permissions
    for (const deniedPerm of authentication.deniedPermissions || []) {
        permissions.delete(deniedPerm);
    }

    return Array.from(permissions);
};
