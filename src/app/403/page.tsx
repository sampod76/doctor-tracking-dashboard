"use client";

import useAuth from "@/hooks/useAuth";
import RouteState from "@/components/shared/route-state";

import { App, Button } from "antd";

export default function ForbiddenPage() {
  const { message } = App.useApp();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    message.success("Logged out successfully");
  }

  return (
    <RouteState
      statusCode="403"
      title="Access Denied"
      description="You don't have permission to access this page. Return to your dashboard or sign out to use another account."
      homeHref="/dashboard"
      homeLabel="Go to Dashboard"
    >
      <Button onClick={handleLogout} type="dashed" size="large">
        Logout
      </Button>
    </RouteState>
  );
}
