"use client";
import { useAppSelector } from "@/redux/hooks";
import { Card, Descriptions } from "antd";
export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <Card title="Profile" className="m-6">
      <Descriptions
        column={1}
        items={[
          { key: "name", label: "Name", children: user?.name },
          { key: "email", label: "Email", children: user?.email },
          { key: "role", label: "Role", children: user?.role },
        ]}
      />
    </Card>
  );
}
