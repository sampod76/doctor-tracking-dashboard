import DashLayout from "@/components/shared/dashboard-layout";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <DashLayout session={session}>
      {children}
    </DashLayout>
  );
}

