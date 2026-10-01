"use client";

import AppHeader from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar";
import { useMobile } from "@/hooks/use-mobile";

import { Layout } from "antd";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const { Content } = Layout;

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />
      <Layout
        style={{
          backgroundColor: "#f4f6f8",
          marginLeft: collapsed ? "80px" : "280px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} pageTitle={getPageTitle()} />
        <Content
          style={{
            // margin: "18px",
            padding: 0,
            minHeight: 280,
            overflow: "hidden",
            background: "transparent",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
