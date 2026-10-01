"use client";

import useAuth from "@/hooks/useAuth";

import { App, Button, Result } from "antd";
import Link from "next/link";

export default function ForbiddenPage() {
  const { message } = App.useApp();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    message.success("Logged out successfully");
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <div className="flex items-center justify-center gap-4">
            <Link href={"/dashboard"}>
              <Button type="primary">Back Home</Button>
            </Link>
            <Button onClick={handleLogout} type="dashed">
              Logout
            </Button>
          </div>
        }
      />
    </div>
  );
}
