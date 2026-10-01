"use client";

import DashboardCard from "@/components/dashboard/dashboard-card";

/**
 * Boilerplate dashboard landing page.
 *
 * The previous version of this page rendered many travel/news
 * business widgets backed by deleted APIs. It is intentionally
 * kept as a minimal placeholder so the new project can build
 * its own dashboard on top of the reusable shell.
 */
export default function DashboardPage() {
  return (
    <div style={{ padding: "24px" }} className="min-h-screen bg-transparent">
      <div className="mb-2 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Welcome back. This is a neutral placeholder boilerplate.</p>
        </div>
      </div>

      <div className="space-y-6">
        <DashboardCard
          stats={[
            { title: "Sample Stat", value: "0" },
            { title: "Sample Stat", value: "0" },
            { title: "Sample Stat", value: "0" },
          ]}
        />
      </div>
    </div>
  );
}
