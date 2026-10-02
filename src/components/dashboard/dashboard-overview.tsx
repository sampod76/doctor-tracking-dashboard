"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Alert, Avatar, Button, DatePicker, Skeleton, Table, Tag, Tooltip } from "antd";
import {
  MedicineBoxOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import { useGetDoctorsQuery } from "@/redux/features/doctor/doctorApi";
import { useGetPatientsQuery } from "@/redux/features/patient/patientApi";
import { TREATMENT_STATUS, type TPatient } from "@/types/patient";
import type { TDoctor } from "@/types/doctor";
import { apiErrorMessage } from "@/utils/api-error";
import {
  formatDate,
  formatEnumLabel,
  renderDoctorRelationTooltip,
} from "@/components/patient/patient-table-columns";
import {
  PatientOverviewChart,
  PatientsPerDoctorChart,
  TreatmentStatusChart,
} from "./dashboard-charts";

const recentParams = { page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" } as const;
const panelClass = "min-w-0 rounded-2xl border border-white bg-white/95 p-5 shadow-sm";

function Panel({
  title,
  detail,
  action,
  children,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={panelClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function QueryError({ error, retry }: { error: unknown; retry: () => unknown }) {
  return (
    <Alert
      type="error"
      showIcon
      message={apiErrorMessage(error, "Unable to load dashboard data.")}
      action={
        <Button size="small" onClick={() => retry()}>
          Retry
        </Button>
      }
    />
  );
}
function Person({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2">
      <Avatar size={28} className="shrink-0 bg-blue-50 text-blue-600">
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <span className="font-medium text-slate-700">{name}</span>
    </span>
  );
}

export default function DashboardOverview() {
  const user = useAppSelector((state) => state.auth.user);
  const [followUpDay, setFollowUpDay] = useState(() => dayjs());
  const [months, setMonths] = useState(6);
  const doctors = useGetDoctorsQuery(recentParams);
  const patients = useGetPatientsQuery(recentParams);
  const activeDoctors = useGetDoctorsQuery({ page: 1, limit: 1, isActive: true });

  const followUps = useGetPatientsQuery({
    page: 1,
    limit: 1,
    followUpDate: followUpDay.format("YYYY-MM-DD"),
  });

  const active = useGetPatientsQuery({
    page: 1,
    limit: 1,
    treatmentStatus: TREATMENT_STATUS.ACTIVE,
  });
  const observation = useGetPatientsQuery({
    page: 1,
    limit: 1,
    treatmentStatus: TREATMENT_STATUS.UNDER_OBSERVATION,
  });
  const recovered = useGetPatientsQuery({
    page: 1,
    limit: 1,
    treatmentStatus: TREATMENT_STATUS.RECOVERED,
  });
  const statusQueries = [active, observation, recovered];
  const stats = [
    {
      title: "Total Doctors",
      query: doctors,
      icon: <MedicineBoxOutlined />,
      accent: "bg-sky-100 text-sky-500",
      detail: "All registered doctors",
    },
    {
      title: "Total Patients",
      query: patients,
      icon: <TeamOutlined />,
      accent: "bg-emerald-100 text-emerald-500",
      detail: "All registered patients",
    },
    {
      title: "Follow-ups",
      query: followUps,
      icon: <CalendarOutlined />,
      accent: "bg-violet-100 text-violet-500",
      detail: `Scheduled ${followUpDay.format("DD MMM YYYY")}`,
    },
    {
      title: "Active Doctors",
      query: activeDoctors,
      icon: <CheckCircleOutlined />,
      accent: "bg-amber-100 text-amber-500",
      detail: "Currently active accounts",
    },
  ];
  const doctorRows = doctors.error ? [] : (doctors.data?.data ?? []);
  const patientRows = patients.error ? [] : (patients.data?.data ?? []);
  return (
    <div className="relative min-h-full">
      <div className="min-h-full space-y-5 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              {user?.name ? `Welcome back, ${user.name}!` : "Welcome back!"} Here&apos;s an overview
              of your doctor and patient management system.
            </p>
          </div>
          <div className="shrink-0">
            <label
              htmlFor="dashboard-follow-up-date"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              Follow-up date
            </label>
            <DatePicker
              id="dashboard-follow-up-date"
              value={followUpDay}
              allowClear={false}
              onChange={(date) => {
                if (date) setFollowUpDay(date);
              }}
              className="w-full md:w-44"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, query, icon, accent, detail }) => (
            <section key={title} className={`${panelClass} flex items-center gap-4`}>
              <span
                className={`${accent} flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl`}
              >
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm text-slate-600">{title}</h2>
                {query.isFetching ? (
                  <Skeleton.Input active size="small" className="my-2" />
                ) : (
                  <p className="my-1 text-3xl font-bold text-slate-900">
                    {query.error ? "—" : (query.currentData?.meta?.total?.toLocaleString() ?? "—")}
                  </p>
                )}
                <p className="text-xs text-slate-500">{detail}</p>
                {query.error && (
                  <Button size="small" type="link" onClick={() => query.refetch()}>
                    Retry
                  </Button>
                )}
              </div>
            </section>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Panel
            title="Patients Overview"
            detail="Demo analytics · illustrative monthly counts"
            action={
              <select
                aria-label="Demo trend period"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-600"
              >
                <option value={6}>6 demo months</option>
                <option value={3}>3 demo months</option>
              </select>
            }
          >
            <div className="h-64 min-w-0">
              <PatientOverviewChart months={months} />
            </div>
          </Panel>
          <Panel
            title="Patients per Doctor"
            detail="Live counts · five most recently added doctors"
          >
            <div className="h-64 min-w-0">
              {doctors.error ? (
                <QueryError error={doctors.error} retry={doctors.refetch} />
              ) : doctors.isFetching ? (
                <Skeleton active />
              ) : (
                <PatientsPerDoctorChart doctors={doctorRows} />
              )}
            </div>
          </Panel>
          <Panel title="Treatment Status" detail="Live patient totals · all time">
            <div className="h-80 min-w-0 sm:h-64 xl:h-80 2xl:h-64">
              {statusQueries.some((query) => query.error) ? (
                <QueryError
                  error={statusQueries.find((query) => query.error)?.error}
                  retry={() =>
                    statusQueries.filter((query) => query.error).forEach((query) => query.refetch())
                  }
                />
              ) : statusQueries.some((query) => query.isFetching) ? (
                <Skeleton active />
              ) : (
                <TreatmentStatusChart
                  data={[
                    { name: "Active", value: active.data?.meta.total ?? 0, color: "#3b82f6" },
                    {
                      name: "Under observation",
                      value: observation.data?.meta.total ?? 0,
                      color: "#fbbf24",
                    },
                    { name: "Recovered", value: recovered.data?.meta.total ?? 0, color: "#10b981" },
                  ]}
                />
              )}
            </div>
          </Panel>
        </div>
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          <Panel
            title="Recent Doctors"
            action={
              <Link
                href="/dashboard/doctors"
                className="shrink-0 text-xs font-medium text-blue-600"
              >
                View All →
              </Link>
            }
          >
            {doctors.error ? (
              <QueryError error={doctors.error} retry={doctors.refetch} />
            ) : (
              <Table<TDoctor>
                size="small"
                rowKey="_id"
                pagination={false}
                loading={doctors.isFetching}
                dataSource={doctorRows}
                scroll={{ x: 620 }}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "name",
                    width: 180,
                    render: (name: string, doctor) => (
                      <Link href={`/dashboard/doctors/${doctor._id}`}>
                        <Tooltip
                          title={
                            doctor.medicalRegistrationNo?.trim()
                              ? "Med. Reg. No: " + doctor.medicalRegistrationNo.trim()
                              : undefined
                          }
                        >
                          <span>
                            <Person name={name} />
                          </span>
                        </Tooltip>
                      </Link>
                    ),
                  },
                  { title: "Specialization", dataIndex: "specialization", render: formatEnumLabel },
                  { title: "Hospital", dataIndex: "hospital" },
                  { title: "Patients", dataIndex: "patientsCount", width: 80 },
                  {
                    title: "Status",
                    dataIndex: "isActive",
                    width: 90,
                    render: (value: boolean) => (
                      <Tag color={value ? "green" : "red"}>{value ? "Active" : "Inactive"}</Tag>
                    ),
                  },
                ]}
              />
            )}
          </Panel>
          <Panel
            title="Recent Patients"
            action={
              <Link
                href="/dashboard/patients"
                className="shrink-0 text-xs font-medium text-blue-600"
              >
                View All →
              </Link>
            }
          >
            {patients.error ? (
              <QueryError error={patients.error} retry={patients.refetch} />
            ) : (
              <Table<TPatient>
                size="small"
                rowKey="_id"
                pagination={false}
                loading={patients.isFetching}
                dataSource={patientRows}
                scroll={{ x: 600 }}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "name",
                    width: 180,
                    render: (name: string) => <Person name={name} />,
                  },
                  { title: "Age", dataIndex: "age", width: 60 },

                  {
                    title: "Doctor",
                    dataIndex: "doctorId",
                    width: 170,
                    render: (id: string, patient) => {
                      const doctor =
                        patient.doctor?.[0] ?? doctorRows.find((item) => item._id === id);
                      return (
                        <Link href={`/dashboard/doctors/${id}`} title={id}>
                          {doctor ? (
                            <Tooltip title={renderDoctorRelationTooltip(doctor)}>
                              <span>{doctor.name || "—"}</span>
                            </Tooltip>
                          ) : (
                            "View doctor"
                          )}
                        </Link>
                      );
                    },
                  },
                  {
                    title: "Treatment Status",
                    dataIndex: "treatmentStatus",
                    render: (status: TREATMENT_STATUS) => (
                      <Tag
                        color={
                          status === TREATMENT_STATUS.RECOVERED
                            ? "green"
                            : status === TREATMENT_STATUS.ACTIVE
                              ? "cyan"
                              : "orange"
                        }
                      >
                        {formatEnumLabel(status)}
                      </Tag>
                    ),
                  },
                  { title: "Follow-up", dataIndex: "followUpDate", width: 110, render: formatDate },
                ]}
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
