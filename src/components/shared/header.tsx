"use client";

import { useMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { authApi } from "@/redux/features/auth/authApi";

import {
  DownOutlined,
  EditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Dropdown, Layout } from "antd";
import { useRouter } from "next/navigation";

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  pageTitle?: string;
}

export default function AppHeader({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
  pageTitle = "Dashboard",
}: HeaderProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const isMobile = useMobile();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || "User";
  const displayRole = user?.role || "User";

  async function handleLogout() {
    await logout();
    message.success("Logged out successfully");
  }

  const primaryColor = "#322FE3";

  const userMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: displayName,
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      key: "password",
      icon: <EditOutlined />,
      label: "Change Password",
      onClick: () => router.push("/dashboard/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "5",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="dashboard-header"
      style={{
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 999,
        height: "80px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Button
          type="link"
          aria-label={isMobile ? "Open sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={isMobile ? mobileOpen : !collapsed}
          icon={
            (isMobile ? !mobileOpen : collapsed) ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
          }
          onClick={() => {
            if (isMobile) {
              setMobileOpen?.(!mobileOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          style={{
            fontSize: "16px",
            width: 64,
            height: 80,
            color: "rgba(0, 0, 0, 0.65)",
          }}
        />
        <h1 className="mt-2 hidden text-xl font-semibold text-gray-800 md:block">{pageTitle}</h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
        }}
      >
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <button
            type="button"
            aria-label="Open user menu"
            style={{ padding: "0 5px" }}
            className="flex h-9 min-w-0 cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50"
          >
            <Avatar
              icon={<UserOutlined />}
              size={32}
              style={{
                marginRight: !isMobile ? "8px" : 0,
                border: `2px solid ${primaryColor}`,
              }}
            />
            {!isMobile && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: "4px",
                    lineHeight: 1.2,
                  }}
                >
                  <span
                    className="max-w-48 truncate"
                    style={{
                      color: "rgba(0, 0, 0, 0.85)",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    {displayName}
                  </span>
                  <span
                    style={{
                      color: "rgba(0, 0, 0, 0.5)",
                      fontSize: "12px",
                    }}
                  >
                    {displayRole}
                  </span>
                </div>
                <DownOutlined
                  style={{
                    fontSize: "10px",
                    color: "rgba(0, 0, 0, 0.5)",
                  }}
                />
              </>
            )}
          </button>
        </Dropdown>
      </div>
    </Header>
  );
}
