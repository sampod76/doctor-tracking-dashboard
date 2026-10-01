/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { sidebarData } from "@/constants";
import { SidebarItem as ISidebarItem } from "@/types";
import { useAppSelector } from "@/redux/hooks";
import { Layout, Menu, MenuProps } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const { Sider } = Layout;

export const SIDEBAR_WIDTH = 220;
export const COLLAPSED_SIDEBAR_WIDTH = 80;

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  onMenuSelect?: () => void;
}

interface MenuItem {
  key: string;
  url?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  permission?: string;
  allowedRoles?: string[];
}

export default function Sidebar({ collapsed, isMobile = false, onMenuSelect }: SidebarProps) {
  const pathname = usePathname();

  const user = useAppSelector((state) => state.auth.user);

  const convertToMenuItems = (items: ISidebarItem[] = []): MenuItem[] => {
    return items.map((item) => {
      const menuItem: MenuItem = {
        key: item.key,
        url: item.url,
        icon: item.icon ? <item.icon /> : undefined,
        label: item.url ? (
          <Link href={item.url.startsWith("/") ? item.url : `/${item.url}`}>{item.title}</Link>
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

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] =>
    items.flatMap((item) => {
      // Role values come directly from the backend; no client permission cookie exists.
      if (item.allowedRoles?.length && (!user || !item.allowedRoles.includes(user.role))) return [];
      if (item.children) {
        const children = filterMenuByRole(item.children);
        return children.length ? [{ ...item, children }] : [];
      }
      return [item];
    });
  // Keep role/permission metadata internal; only supported properties reach Ant Design.
  const toAntdMenuItems = (items: MenuItem[]): MenuProps["items"] =>
    items.map(({ key, label, icon, children }) => ({
      key,
      label,
      icon,
      ...(children ? { children: toAntdMenuItems(children) } : {}),
    }));

  const filteredSidebarGroups = sidebarData
    .map((group) => ({
      ...group,
      filteredItems: filterMenuByRole(convertToMenuItems(group.items)),
    }))
    .filter((group) => group.filteredItems.length);
  const allFilteredItems = filteredSidebarGroups.flatMap((group) => group.filteredItems);

  const getRouteItems = (items: MenuItem[]): MenuItem[] =>
    items.flatMap((item) => [...(item.url ? [item] : []), ...getRouteItems(item.children ?? [])]);

  const selectedItem = getRouteItems(allFilteredItems)
    .filter(
      (item) =>
        pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`)),
    )
    .sort((a, b) => b.url!.length - a.url!.length)[0];

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
    const currentOpenKey = openKeys.find((key) => !stateOpenKeys.includes(key));
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  return (
    <Sider
      className="dashboard-sidebar"
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={isMobile ? 0 : COLLAPSED_SIDEBAR_WIDTH}
      style={{
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: isMobile && !collapsed ? 1001 : 1000,
        background: "var(--color-bg-container, #ffffff)",
        boxShadow: isMobile && collapsed ? "none" : "2px 0 10px rgba(0, 0, 0, 0.06)",
        borderRight: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      width={isMobile ? "min(200px, calc(100vw - 24px))" : SIDEBAR_WIDTH}
      theme="light"
    >
      <Link
        className="logo flex h-20 shrink-0 items-center justify-center py-4"
        style={{
          background: "var(--color-bg-container, #ffffff)",
          color: "var(--color-text-base)",
          transition: "all 0.3s ease",
          position: "relative",
          zIndex: 2,
        }}
        href="/dashboard"
        aria-label="Dashboard home"
        onClick={onMenuSelect}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
          <Image
            src="/auth-logo.png"
            alt="Logo"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
          />
        </div>
      </Link>

      <div
        style={{
          padding: "5px 0",
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
        }}
        className="custom-sidebar-scroll"
      >
        {filteredSidebarGroups.map((group, index) => (
          <div key={group.key || index} style={{ marginBottom: 12 }}>
            <Menu
              mode="inline"
              defaultOpenKeys={[
                pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/dashboard",
              ]}
              selectedKeys={selectedItem ? [selectedItem.key] : []}
              style={{
                borderInlineEnd: 0,
                background: "var(--color-bg-container, #ffffff)",
              }}
              openKeys={stateOpenKeys}
              onOpenChange={onOpenChange}
              onClick={onMenuSelect}
              items={toAntdMenuItems(group.filteredItems)}
              theme="light"
              className="custom-sidebar-menu"
            />
          </div>
        ))}
      </div>
    </Sider>
  );
}
