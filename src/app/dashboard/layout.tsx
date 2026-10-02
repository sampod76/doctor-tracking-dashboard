"use client";
import DashLayout from "@/components/shared/dashboard-layout";
import Loader from "@/components/shared/loader";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { apiErrorMessage } from "@/utils/api-error";
import { Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.accessToken);
  const router = useRouter();
  const { data, error, isFetching, refetch } = useGetProfileQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });
  useEffect(() => {
    if (!token) router.replace("/signin");
  }, [token, router]);
  if (!token || (isFetching && !data)) return <Loader />;
  if (error || !data?.success)
    return (
      <Alert
        type="error"
        message={apiErrorMessage(error, "Unable to validate your session.")}
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  return (
    <DashLayout>
      <div className="min-h-[calc(100vh-80px)] bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="flow-root min-h-[inherit] bg-white/60">{children}</div>
      </div>
    </DashLayout>
  );
}
