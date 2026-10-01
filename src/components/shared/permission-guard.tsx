"use client";
import { useAppSelector } from "@/redux/hooks";
import type { ReactNode } from "react";
interface PermissionGuardProps {
  permission?: string | string[];
  mode?: "all" | "any";
  children: ReactNode;
  fallback?: ReactNode;
}
// The current backend exposes roles, but no granular permissions. Fail closed
// for permission requirements instead of trusting obsolete permission cookies.
export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const token = useAppSelector((state) => state.auth.accessToken);
  const requiresPermission = Array.isArray(permission)
    ? permission.length > 0
    : Boolean(permission);
  return <>{token && !requiresPermission ? children : fallback}</>;
}
