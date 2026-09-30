"use client";

import { useSession } from "@/provider/session-provider";
import { signout } from "@/service/auth";
import { Button, message, Result } from "antd";
import Link from "next/link";

export default function ForbiddenPage() {
  const { setIsLoading } = useSession();

  async function handleLogout() {
    setIsLoading(true);
    localStorage.clear();
    await signout();
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
          <div className="flex justify-center items-center gap-4">
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
