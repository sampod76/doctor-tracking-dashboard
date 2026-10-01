"use client";

import AppHeader from "@/components/shared/header";
import Sidebar, { COLLAPSED_SIDEBAR_WIDTH, SIDEBAR_WIDTH } from "@/components/shared/sidebar";
import { useMobile } from "@/hooks/use-mobile";

import { Layout } from "antd";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const { Content } = Layout;

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMobile();
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 1 && path[0] === "dashboard") {
      return "Dashboard";
    }

    const lastSegment = path[path.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setMobileOpen(false);
  }, [isMobile, pathname]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, mobileOpen]);

  return (
    <Layout className="dashboard-layout" style={{ minHeight: "100vh", overflowX: "clip" }}>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            zIndex: 1000,
            border: 0,
            padding: 0,
            cursor: "pointer",
          }}
        />
      )}
      <Sidebar
        collapsed={isMobile ? !mobileOpen : collapsed}
        isMobile={isMobile}
        onMenuSelect={() => setMobileOpen(false)}
      />
      <Layout
        className="dashboard-main"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH,
          minWidth: 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        <AppHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          pageTitle={getPageTitle()}
        />
        <Content
          className="dashboard-content"
          style={{
            // margin: "18px",
            padding: 0,
            minHeight: 280,
            overflow: "hidden",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
