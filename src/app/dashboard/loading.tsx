"use client";
import { Skeleton } from "antd";
export default function Loading() {
  return (
    <div role="status" aria-label="Loading dashboard content" className="space-y-6 p-4 sm:p-6">
      <span className="sr-only">Loading dashboard content...</span>
      <div aria-hidden="true" className="space-y-6">
        <Skeleton.Input style={{ width: 200, maxWidth: "100%" }} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-sky-100 bg-white p-5">
              <Skeleton title paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white p-6">
          <Skeleton title paragraph={{ rows: 5 }} />
        </div>
      </div>
    </div>
  );
}
