/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { sidebarData } from "@/constants";
import { SidebarItem as ISidebarItem } from "@/types";
import { useAppSelector } from "@/redux/hooks";
import { Layout, Menu, MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  permission?: string;
  allowedRoles?: string[];
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  const user = useAppSelector((state) => state.auth.user);

  const convertToMenuItems = (items: ISidebarItem[] = []): MenuItem[] => {
    return items.map((item) => {
      const menuItem: MenuItem = {
        key: item.key,
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
  const filteredSidebarGroups = sidebarData
    .map((group) => ({
      ...group,
      filteredItems: filterMenuByRole(convertToMenuItems(group.items)),
    }))
    .filter((group) => group.filteredItems.length);
  const allFilteredItems = filteredSidebarGroups.flatMap((group) => group.filteredItems);

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
          <h1
            style={{
              color: "white",
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Admin Dashboard
          </h1>
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
              defaultOpenKeys={[
                pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/dashboard",
              ]}
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
