"use client";
import { Empty, Tooltip as AntTooltip } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardDemoTrend } from "@/constants/dashboard-demo-data";
import type { TDoctor } from "@/types/doctor";
const axis = { fontSize: 11, fill: "#64748b" };
export function PatientOverviewChart({ months }: { months: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart
        data={dashboardDemoTrend.slice(-months)}
        margin={{ top: 10, right: 12, left: -25, bottom: 0 }}
        accessibilityLayer
      >
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="newPatients"
          name="New patients"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="#3b82f6"
          fillOpacity={0.12}
          dot={{ r: 3 }}
        />
        <Area
          type="monotone"
          dataKey="followUps"
          name="Follow-ups"
          stroke="#10b981"
          strokeWidth={2}
          fill="#10b981"
          fillOpacity={0.08}
          dot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function PatientsPerDoctorChart({ doctors }: { doctors: TDoctor[] }) {
  if (!doctors.length)
    return (
      <Empty description="No analytics data available." image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart
        data={doctors}
        margin={{ top: 15, right: 8, left: -25, bottom: 0 }}
        accessibilityLayer
      >
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis
          dataKey="name"
          tick={({ x, y, payload }) => {
            const doctor = doctors[payload.index];
            const name = doctor?.name ?? String(payload.value);
            const registrationNo = doctor?.medicalRegistrationNo?.trim();
            return (
              <AntTooltip
                title={
                  <div>
                    <div>{name}</div>
                    {registrationNo && <div>Med. Reg. No: {registrationNo}</div>}
                  </div>
                }
              >
                <text x={x} y={Number(y) + 12} textAnchor="middle" style={axis}>
                  {name.length > 13 ? name.slice(0, 12) + "…" : name}
                </text>
              </AntTooltip>
            );
          }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "#eff6ff" }}
          labelFormatter={(label, payload) => {
            const doctor = doctors.find((item) => item._id === payload[0]?.payload?._id);
            const registrationNo = doctor?.medicalRegistrationNo?.trim();
            return (
              <span>
                {label}
                {registrationNo && (
                  <span className="block text-xs">Med. Reg. No: {registrationNo}</span>
                )}
              </span>
            );
          }}
        />
        <Bar
          dataKey="patientsCount"
          name="Patients"
          fill="#4f8cff"
          radius={[4, 4, 0, 0]}
          maxBarSize={42}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function TreatmentStatusChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total)
    return (
      <Empty description="No analytics data available." image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={57}
              outerRadius={80}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</span>
          <span className="text-xs text-slate-500">Patients</span>
        </div>
      </div>
      <ul className="w-full space-y-3 text-xs">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-slate-600">{item.name}</span>
            <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
