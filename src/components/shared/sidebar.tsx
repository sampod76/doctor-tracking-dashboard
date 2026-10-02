"use client";

import { sidebarData } from "@/constants";
import { useAppSelector } from "@/redux/hooks";
import type { SidebarItem as ISidebarItem } from "@/types";

import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const { Sider } = Layout;

export const SIDEBAR_WIDTH = 220;
export const COLLAPSED_SIDEBAR_WIDTH = 80;

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  onMenuSelect?: () => void;
}

interface SidebarMenuItem {
  key: string;
  url?: string;
  icon?: ReactNode;
  label: ReactNode;
  children?: SidebarMenuItem[];
}

const buildMenuItems = (items: ISidebarItem[] = [], userRole?: string): SidebarMenuItem[] => {
  return items.flatMap((item) => {
    if (item.allowedRoles?.length && (!userRole || !item.allowedRoles.includes(userRole))) {
      return [];
    }
    const children = item.items?.length ? buildMenuItems(item.items, userRole) : undefined;
    if (item.items?.length && !children?.length) {
      return [];
    }

    return [
      {
        key: item.key,
        url: item.url,
        icon: item.icon ? <item.icon /> : undefined,
        label: item.url ? <Link href={normalizeUrl(item.url)}>{item.title}</Link> : item.title,
        ...(children?.length ? { children } : {}),
      },
    ];
  });
};

const normalizeUrl = (url: string) => {
  return url.startsWith("/") ? url : `/${url}`;
};

const flattenMenuItems = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  return items.flatMap((item) => [item, ...(item.children ? flattenMenuItems(item.children) : [])]);
};

const getSelectedMenuItem = (items: SidebarMenuItem[], pathname: string) => {
  return flattenMenuItems(items)
    .filter((item) => {
      if (!item.url) return false;

      const url = normalizeUrl(item.url);

      if (pathname === url) {
        return true;
      }

      if (url === "/dashboard") {
        return false;
      }

      return pathname.startsWith(`${url}/`);
    })
    .sort((a, b) => {
      const aLength = a.url?.length ?? 0;
      const bLength = b.url?.length ?? 0;

      return bLength - aLength;
    })[0];
};

const getParentKeys = (
  items: SidebarMenuItem[],
  selectedKey?: string,
  parents: string[] = [],
): string[] => {
  if (!selectedKey) return [];

  for (const item of items) {
    if (item.key === selectedKey) {
      return parents;
    }

    if (item.children?.length) {
      const result = getParentKeys(item.children, selectedKey, [...parents, item.key]);

      if (result.length) {
        return result;
      }
    }
  }

  return [];
};

const toAntdMenuItems = (items: SidebarMenuItem[]): MenuProps["items"] => {
  return items.map(({ key, label, icon, children }) => ({
    key,
    label,
    icon,
    ...(children?.length
      ? {
          children: toAntdMenuItems(children),
        }
      : {}),
  }));
};

export default function Sidebar({ collapsed, isMobile = false, onMenuSelect }: SidebarProps) {
  const pathname = usePathname();

  const user = useAppSelector((state) => state.auth.user);

  const sidebarGroups = sidebarData
    .map((group) => ({
      ...group,
      menuItems: buildMenuItems(group.items, user?.role),
    }))
    .filter((group) => group.menuItems.length > 0);

  const allMenuItems = sidebarGroups.flatMap((group) => group.menuItems);

  const selectedItem = getSelectedMenuItem(allMenuItems, pathname);

  const defaultOpenKeys = getParentKeys(allMenuItems, selectedItem?.key);

  return (
    <Sider
      className="dashboard-sidebar"
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={isMobile ? 0 : COLLAPSED_SIDEBAR_WIDTH}
      width={isMobile ? "min(200px, calc(100vw - 24px))" : SIDEBAR_WIDTH}
      theme="light"
      style={{
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: isMobile && !collapsed ? 1001 : 1000,
        background: "var(--color-bg-container, #ffffff)",
        borderRight: isMobile && collapsed ? "none" : "1px solid rgba(226, 232, 240, 0.7)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Link
        href="/dashboard"
        aria-label="Dashboard home"
        onClick={onMenuSelect}
        className="logo flex h-20 shrink-0 items-center justify-center py-4"
        style={{
          background: "var(--color-bg-container, #ffffff)",
          color: "var(--color-text-base)",
          transition: "all 0.3s ease",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
          <Image
            src="/auth-logo.png"
            alt="Logo"
            width={34}
            height={34}
            priority
            className="h-[34px] w-[34px] object-contain"
          />
        </div>
      </Link>

      <div
        className="custom-sidebar-scroll"
        style={{
          padding: "5px 0",
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
        }}
      >
        {sidebarGroups.map((group, index) => (
          <div key={group.key || index} style={{ marginBottom: 12 }}>
            <Menu
              mode="inline"
              theme="light"
              selectedKeys={selectedItem ? [selectedItem.key] : []}
              defaultOpenKeys={defaultOpenKeys}
              onClick={onMenuSelect}
              items={toAntdMenuItems(group.menuItems)}
              className="custom-sidebar-menu"
              style={{
                borderInlineEnd: 0,
                background: "var(--color-bg-container, #ffffff)",
              }}
            />
          </div>
        ))}
      </div>
    </Sider>
  );
}
