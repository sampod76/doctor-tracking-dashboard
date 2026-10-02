"use client";

import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { apiErrorMessage } from "@/utils/api-error";
import { UserOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Descriptions, Skeleton, Tag } from "antd";

export default function ProfilePage() {
  const token = useAppSelector((state) => state.auth.accessToken);
  const { data, error, isLoading, isFetching, refetch } = useGetProfileQuery(undefined, {
    skip: !token,
  });
  const user = data?.data?.user;
  const name = user?.profile?.name.trim() || user?.email || "User";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 sm:p-6">
      <Card
        title="Profile"
        className="mx-auto w-full max-w-2xl rounded-lg shadow-md shadow-blue-200"
      >
        {isLoading || (isFetching && !data) || !token ? (
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        ) : error || !data?.success || !user ? (
          <Alert
            type="error"
            showIcon
            message={apiErrorMessage(error, "Unable to load your profile.")}
            action={
              <Button loading={isFetching} onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-6 flex min-w-0 items-center gap-4">
              <Avatar
                size={64}
                className="shrink-0 bg-indigo-600"
                icon={!initials ? <UserOutlined /> : undefined}
              >
                {initials || undefined}
              </Avatar>
              <div className="min-w-0">
                <h2 className="mb-1 break-words text-xl font-semibold text-gray-800">{name}</h2>
                <Tag color="blue">{user.role}</Tag>
              </div>
            </div>
            <Descriptions
              column={1}
              className="[&_.ant-descriptions-item-content]:break-all"
              items={[
                { key: "email", label: "Email", children: user.email },
                { key: "phone", label: "Phone", children: user.profile?.phone || "Not provided" },
                {
                  key: "status",
                  label: "Account Status",
                  children: (
                    <Tag color={user.isActive ? "green" : "red"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Tag>
                  ),
                },
              ]}
            />
          </>
        )}
      </Card>
    </div>
  );
}
