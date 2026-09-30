/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { sidebarData } from "@/constants";
import { SidebarData, SidebarItem as ISidebarItem, TSession } from "@/types";
import { getPermissionsCookie } from "@/utils/permissions";
import { Layout, Menu, MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
    session: TSession | null;
}

interface MenuItem {
    key: string;
    icon?: React.ReactNode;
    label: React.ReactNode;
    children?: MenuItem[];
    permission?: string;
    allowedRoles?: string[];
}

export default function Sidebar({ collapsed, session }: SidebarProps) {
    const pathname = usePathname();

    const isSuperAdmin =
        session?.roleCode === "super_admin" ||
        session?.user_type === "super_admin" ||
        session?.user_type === "superAdmin";

    const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>(() => {
        if (typeof document !== "undefined") {
            return getPermissionsCookie();
        }
        return {};
    });

    useEffect(() => {
        setUserPermissions(getPermissionsCookie());
    }, [pathname]);

    const convertToMenuItems = (
        items: ISidebarItem[] = []
    ): MenuItem[] => {
        return items.map((item) => {
            const menuItem: MenuItem = {
                key: item.key,
                icon: item.icon ? <item.icon /> : undefined,
                label: item.url ? (
                    <Link
                        href={
                            item.url.startsWith("/") ? item.url : `/${item.url}`
                        }
                    >
                        {item.title}
                    </Link>
                ) : (
                    item.title
                ),
                permission: item.permission,
                allowedRoles: item.allowedRoles,
            };

            if (item.items && item.items.length > 0) {
                menuItem.children = convertToMenuItems(item.items);
            }

            return menuItem;
        });
    };

    const filterMenuByPermission = (
        items: MenuItem[],
        permissions: Record<string, boolean>
    ): MenuItem[] => {
        // Super Admin bypass: Show everything unconditionally!
        if (isSuperAdmin) {
            return items;
        }

        return items
            .map((item) => {
                // Role check if specified
                if (
                    item.allowedRoles &&
                    item.allowedRoles.length > 0 &&
                    session?.user_type &&
                    !item.allowedRoles.includes(session.user_type)
                ) {
                    return null;
                }

                // If item has children, filter children first
                if (item.children && item.children.length > 0) {
                    const filteredChildren = filterMenuByPermission(
                        item.children,
                        permissions
                    );

                    // If all children were filtered out
                    if (filteredChildren.length === 0) {
                        return null;
                    }

                    // If parent has a permission requirement of its own
                    if (
                        item.permission &&
                        permissions[item.permission] !== true
                    ) {
                        return null;
                    }

                    return { ...item, children: filteredChildren };
                }

                // Leaf item permission check
                if (item.permission) {
                    return permissions[item.permission] === true ? item : null;
                }

                // No permission specified - allow
                return item;
            })
            .filter(Boolean) as MenuItem[];
    };

    // Filter each group's items
    const filteredSidebarGroups = useMemo(() => {
        return sidebarData
            .map((group) => {
                const converted = convertToMenuItems(group.items);
                const filtered = filterMenuByPermission(converted, userPermissions);
                return {
                    ...group,
                    filteredItems: filtered,
                };
            })
            .filter((group) => group.filteredItems.length > 0);
    }, [userPermissions, isSuperAdmin, session?.user_type]);

    const allFilteredItems = useMemo(() => {
        return filteredSidebarGroups.flatMap((g) => g.filteredItems);
    }, [filteredSidebarGroups]);

    const getLevelKeys = (items: MenuItem[]) => {
        const key: Record<string, number> = {};
        const func = (items2: MenuItem[], level = 1) => {
            items2.forEach((item) => {
                if (item.key) key[item.key] = level;
                if (item.children) func(item.children, level + 1);
            });
        };
        func(items);
        return key;
    };

    const levelKeys = getLevelKeys(allFilteredItems);
    const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([
        pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/dashboard",
    ]);

    const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
        const currentOpenKey = openKeys.find(
            (key) => !stateOpenKeys.includes(key)
        );
        if (currentOpenKey !== undefined) {
            const repeatIndex = openKeys
                .filter((key) => key !== currentOpenKey)
                .findIndex(
                    (key) => levelKeys[key] === levelKeys[currentOpenKey]
                );

            setStateOpenKeys(
                openKeys
                    .filter((_, index) => index !== repeatIndex)
                    .filter(
                        (key) => levelKeys[key] <= levelKeys[currentOpenKey]
                    )
            );
        } else {
            setStateOpenKeys(openKeys);
        }
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
                overflow: "hidden",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
                background: "var(--sidebar-bg, #0f172a)",
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            width={280}
            theme={"dark"}
        >
            <Link
                className="logo"
                style={{
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    background: "var(--sidebar-bg, #0f172a)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                    transition: "all 0.3s ease",
                    position: "relative",
                    zIndex: 2,
                }}
                href="/dashboard"
            >
                {collapsed ? (
                    <h1 style={{ color: "white", margin: 0, fontSize: "20px", fontWeight: "bold" }}>AD</h1>
                ) : (
                    <h1 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>Admin Dashboard</h1>
                )}
            </Link>

            <div
                style={{
                    padding: "12px 0",
                    height: "calc(100vh - 80px)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
                }}
                className="custom-sidebar-scroll"
            >
                {filteredSidebarGroups.map((group, index) => (
                    <div key={group.key || index} style={{ marginBottom: 12 }}>
                        <Menu
                            mode="inline"
                            defaultOpenKeys={[pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/dashboard"]}
                            selectedKeys={[pathname]}
                            style={{
                                borderRight: 0,
                                background: "transparent",
                            }}
                            openKeys={stateOpenKeys}
                            onOpenChange={onOpenChange}
                            items={group.filteredItems as MenuProps["items"]}
                            theme={"dark"}
                            className="custom-sidebar-menu"
                        />
                    </div>
                ))}
            </div>
        </Sider>
    );
}