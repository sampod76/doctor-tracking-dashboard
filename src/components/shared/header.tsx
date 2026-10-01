"use client";

import { useMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";

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
  console.log("🚀 ~ AppHeader ~ user:", user);

  async function handleLogout() {
    await logout();
    message.success("Logged out successfully");
  }

  const primaryColor = "#322FE3";

  const userMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: (
        <span onClick={() => router.push("/dashboard/profile")}>
          {user?.name || user?.email || "Profile"}
        </span>
      ),
    },
    {
      key: "password",
      icon: <EditOutlined />,
      label: <span onClick={() => router.push("/dashboard/change-password")}>Change Password</span>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "5",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Sign Out</span>,
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
        borderBottom: `1px solid rgba(0, 0, 0, 0.05)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Sidebar Toggle */}
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
        <h1 className="hidden text-xl font-semibold text-gray-800 md:block">{pageTitle}</h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
        }}
      >
        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <div
            style={{ padding: "0 5px" }}
            className="flex h-9 cursor-pointer justify-between rounded-3xl border border-gray-200 bg-gray-200"
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
                    style={{
                      color: "rgba(0, 0, 0, 0.85)",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    {user?.name || user?.email || "User"}
                  </span>
                  <span
                    style={{
                      color: "rgba(0, 0, 0, 0.5)",
                      fontSize: "12px",
                    }}
                  >
                    {user?.role || "guest"}
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
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
