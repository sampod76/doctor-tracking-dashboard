import {
  BankOutlined,
  CalendarOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Tag } from "antd";
import type { ReactNode } from "react";
import type { DoctorDetails } from "@/types/doctor";
import { specializationLabel } from "./doctor-table-columns";

function ProfileInfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-1 text-orange-500">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mb-0 mt-1 break-words text-sm text-slate-800">{value || "�"}</dd>
      </div>
    </div>
  );
}

export default function DoctorProfileCard({ doctor }: { doctor: DoctorDetails }) {
  const initials = doctor.name
    .replace(/^dr\.?\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const created = new Date(doctor.createdAt);
  const since = Number.isNaN(created.getTime())
    ? "�"
    : created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-t-4 border-slate-100 border-t-orange-500 bg-orange-50/40 px-6 py-7 text-center">
        <Avatar size={80} style={{ backgroundColor: "#ffedd5", color: "#c2410c", fontWeight: 600 }}>
          {initials}
        </Avatar>
        <h2 className="mb-1 mt-4 break-words text-xl font-semibold text-slate-900">
          {doctor.name}
        </h2>
        <p className="mb-2 text-sm font-medium text-orange-600">
          {specializationLabel(doctor.specialization)}
        </p>
        <p className="mb-4 break-words text-sm text-slate-500">
          <BankOutlined /> {doctor.hospital || "�"}
        </p>
        <Tag color={doctor.isActive ? "green" : "red"}>
          {doctor.isActive ? "Active" : "Inactive"}
        </Tag>
      </div>
      <dl className="m-0 space-y-5 p-6">
        <ProfileInfoItem icon={<MailOutlined />} label="Email" value={doctor.email} />
        <ProfileInfoItem icon={<PhoneOutlined />} label="Phone" value={doctor.phone} />
        <ProfileInfoItem icon={<BankOutlined />} label="Hospital" value={doctor.hospital} />
        <ProfileInfoItem
          icon={<MedicineBoxOutlined />}
          label="Specialization"
          value={specializationLabel(doctor.specialization)}
        />
      </dl>
      <div className="space-y-4 border-t border-slate-100 p-6">
        {typeof doctor.patientsCount === "number" && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-4 py-3">
            <span className="text-sm text-slate-600">
              <TeamOutlined className="mr-2 text-orange-500" />
              Total Patients
            </span>
            <span className="text-2xl font-semibold text-orange-600">
              {doctor.patientsCount ?? "�"}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-3 text-xs text-slate-500">
          <span>
            <CalendarOutlined className="mr-2" />
            Doctor since
          </span>
          <span>{since}</span>
        </div>
      </div>
    </article>
  );
}
