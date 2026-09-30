import { ReactNode } from "react";

/**
 * Example reusable dashboard / stat card component.
 *
 * This is a small, generic example kept in the boilerplate so the
 * new project has a starting pattern to follow when building its
 * own dashboard widgets. Replace or extend as the new domain grows.
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  bgColor?: string;
}

const StatCard = ({ title, value, icon, bgColor = "bg-[#7E8CE0]" }: StatCardProps) => (
  <div
    className={`${bgColor} rounded-sm p-5 text-white flex justify-between items-center transition-all duration-300`}
  >
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
      <p className="text-xs font-medium opacity-90 uppercase tracking-wider mt-1">{title}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-3xl backdrop-blur-sm">{icon}</div>
  </div>
);

interface IDashboardCardProps {
  stats?: StatCardProps[];
  isLoading?: boolean;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-sm p-5 shadow-sm flex justify-between items-center animate-pulse border border-gray-100">
    <div className="space-y-3 w-full">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="bg-gray-200 p-3 rounded-xl w-12 h-12"></div>
  </div>
);

export default function DashboardCard({
  stats = [
    { title: "Sample Stat", value: "0" },
    { title: "Sample Stat", value: "0" },
    { title: "Sample Stat", value: "0" },
  ],
  isLoading = false,
}: IDashboardCardProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}