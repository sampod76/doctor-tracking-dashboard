# Doctor details implementation

## Final route structure

```text
src/app/dashboard/
  layout.tsx                 existing, unchanged
  doctors/
    page.tsx                 existing, unchanged by this task
    [id]/page.tsx            new detail content
```

No additional layout, sidebar, header, or alternate detail route was created. The URL ID is the source of truth. View routes to `/dashboard/doctors/${record._id}`; Edit remains unchanged.

## Reuse and behavior

Reuses PatientFilters (typed hideDoctorFilter mode), PatientFilterDrawer, PatientTable, patient columns/detail modal, shared DataTable, useDebounced, API error helper, RTK Query and existing enums. The general Patients page keeps its existing Doctor picker. Each patient query includes the route doctorId, including reset, pagination, sorting, search and date/gender/status changes. No full doctor object is passed through storage, query strings or React state.

Doctor and patients load independently. Patient errors have Retry; doctor errors have Retry and the page always has a Doctors link. A missing doctor gets a 404 message. Skeleton loading is limited to the profile.

Desktop uses a 340px profile and remaining-width patients at xl. Smaller screens stack; mobile filters open the existing drawer and the table keeps its own horizontal scroll. The profile sticks 96px below the viewport top, clearing the existing 80px header. A page-scoped overflow:clip override allows sticky positioning inside the existing dashboard content container. No dashboard layout source was edited.

No fake data or photos were added. The sibling backend was inspected: GET /doctors/:id wraps the detail record in data, but currently omits patientsCount. The profile shows that statistic only if returned; patient totals come from patient API metadata and are labeled as matching current filters. DoctorDetails therefore types only the fields consumed by this view, with an optional patientsCount.

## Queries

```http
GET /doctors/6abe56bb75b73e67a5efdc01
GET /patients?doctorId=6abe56bb75b73e67a5efdc01&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

The existing base query adds /api/v1 and authentication. Search adds searchTerm, while gender, treatmentStatus, followUpDate and lastVisitAt remain server filters. The doctor endpoint uses TResponse<DoctorDetails>, without transforming the existing wrapper.

## Verification

- TypeScript: passes.
- ESLint: no new errors or warnings; existing warnings in create-doctor-form.tsx and fileObjectToLink.ts remain.
- Tests: all 10 authentication, patient and doctor detail tests pass with BASE_URL=http://localhost:5000 and mocked fetch.
- New test verifies scoped query parameters, wrapped detail response and independent query cache behavior.
- Production build compiled and passed lint/type checks, then failed in page-data collection with a missing .next/server chunk (590.js). Full build success is unverified.
- Authenticated browser interactions and visual responsive behavior were not exercised.

## Created or modified files and complete code

### src/app/dashboard/doctors/[id]/page.tsx

```tsx
"use client";

import DoctorPatientsSection from "@/components/doctor/doctor-patients-section";
import DoctorProfileCard from "@/components/doctor/doctor-profile-card";
import { useGetDoctorByIdQuery } from "@/redux/features/doctor/doctorApi";
import { apiErrorMessage } from "@/utils/api-error";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Result, Skeleton } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentData: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDoctorByIdQuery(id);
  const notFound =
    (error && "status" in error && error.status === 404) ||
    response?.statusCode === 404 ||
    (!error && !isFetching && response?.success && !response.data);
  return (
    <div className="doctor-details-page min-w-0 p-2 sm:p-6">
      <style jsx global>{`
        .dashboard-content:has(.doctor-details-page) {
          overflow: clip !important;
        }
      `}</style>
      <header className="mb-6">
        <Link
          href="/dashboard/doctors"
          className="inline-flex items-center gap-2 text-sm text-orange-600"
        >
          <ArrowLeftOutlined /> Doctors
        </Link>
        <h1 className="mb-1 mt-3 text-2xl font-semibold text-slate-900">Doctor Profile</h1>
        <p className="m-0 text-sm text-slate-500">View doctor information and assigned patients</p>
      </header>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="min-w-0 self-start xl:sticky xl:top-24">
          {isLoading || (isFetching && !response) ? (
            <div
              aria-label="Loading doctor profile"
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <Skeleton.Avatar active size={80} />
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : notFound ? (
            <Result
              status="404"
              title="Doctor not found"
              subTitle="The doctor may have been removed or is unavailable."
              extra={<Link href="/dashboard/doctors">Back to Doctors</Link>}
            />
          ) : error || !response?.success ? (
            <Alert
              type="error"
              showIcon
              message={apiErrorMessage(
                error,
                response?.message || "Unable to load doctor profile.",
              )}
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : response.data ? (
            <DoctorProfileCard doctor={response.data} />
          ) : null}
        </div>
        <DoctorPatientsSection key={id} doctorId={id} />
      </div>
    </div>
  );
}

```

### src/components/doctor/doctor-profile-card.tsx

```tsx
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

```

### src/components/doctor/doctor-patients-section.tsx

```tsx
"use client";

import { FilterOutlined, TeamOutlined } from "@ant-design/icons";
import PatientFilters, {
  type PatientFilterValuesProps,
} from "@/components/patient/patient-filters";
import PatientFilterDrawer from "@/components/patient/patient-filter-drawer";
import PatientTable from "@/components/patient/patient-table";
import { useDebounced } from "@/hooks/use-debounce";
import { useGetPatientsQuery } from "@/redux/features/patient/patientApi";
import {
  PATIENT_SORT_FIELDS,
  type ENUM_GENDER,
  type TREATMENT_STATUS,
  type PatientSortBy,
  type PatientSortOrder,
  type PatientsQueryParams,
} from "@/types/patient";
import { apiErrorMessage } from "@/utils/api-error";
import { Alert, Button } from "antd";
import { useState } from "react";

export default function DoctorPatientsSection({ doctorId }: { doctorId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [gender, setGender] = useState<ENUM_GENDER>();
  const [treatmentStatus, setTreatmentStatus] = useState<TREATMENT_STATUS>();
  const [followUpDate, setFollowUpDate] = useState<string>();
  const [lastVisitAt, setLastVisitAt] = useState<string>();
  const [sortBy, setSortBy] = useState<PatientSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<PatientSortOrder>("desc");
  const debouncedSearch = useDebounced({ searchQuery: searchTerm, delay: 350 });

  const params: PatientsQueryParams = { page, limit, doctorId, sortBy, sortOrder };
  // Clearing filters takes effect immediately, even while debounce is pending.
  if (searchTerm.trim() && debouncedSearch.trim()) params.searchTerm = debouncedSearch.trim();
  if (gender) params.gender = gender;
  if (treatmentStatus) params.treatmentStatus = treatmentStatus;
  if (followUpDate) params.followUpDate = followUpDate;
  if (lastVisitAt) params.lastVisitAt = lastVisitAt;
  const isDebouncing = Boolean(searchTerm.trim()) && searchTerm !== debouncedSearch;
  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPatientsQuery(params, { skip: isDebouncing });

  const changeSortBy = (field: string) => {
    const validField = PATIENT_SORT_FIELDS.find((value) => value === field);
    if (validField) {
      setSortBy(validField);
      if (validField !== sortBy) setPage(1);
    }
  };
  const changeSortOrder = (order: string) => {
    if (order === "asc" || order === "desc") {
      setSortOrder(order);
      if (order !== sortOrder) setPage(1);
    }
  };
  const resetFilters = () => {
    setSearchTerm("");
    setGender(undefined);
    setTreatmentStatus(undefined);
    setFollowUpDate(undefined);
    setLastVisitAt(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };
  const filterProps: PatientFilterValuesProps = {
    hideDoctorFilter: true,
    gender,
    treatmentStatus,
    followUpDate,
    lastVisitAt,
    sortBy,
    sortOrder,
    setGender,
    setTreatmentStatus,
    setFollowUpDate,
    setLastVisitAt,
    setPage,
    changeSortBy,
    changeSortOrder,
    resetFilters,
  };

  return (
    <section aria-label="Doctor patients" className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <TeamOutlined className="text-orange-500" /> Patients
          </h2>
          <p className="mb-0 mt-1 text-sm text-slate-500">
            {data?.meta
              ? `${data.meta.total} patients matching the current filters`
              : "Patients assigned to this doctor"}
          </p>
        </div>
        <Button
          className="sm:hidden"
          icon={<FilterOutlined />}
          onClick={() => setFilterOpen(true)}
          aria-expanded={filterOpen}
        >
          Filters
        </Button>
      </div>
      <div className="space-y-2 sm:space-y-4">
        <PatientFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} {...filterProps} />
        {error && !isDebouncing && (
          <Alert
            type="error"
            showIcon
            message={apiErrorMessage(error, "Unable to load patients.")}
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        )}
        <PatientTable
          patients={data?.data ?? []}
          meta={data?.meta}
          isLoading={isLoading}
          isFetching={isFetching || isDebouncing}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          changeSortBy={changeSortBy}
          changeSortOrder={changeSortOrder}
        />
      </div>
      <PatientFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filterProps}
      />
    </section>
  );
}

```

### src/components/doctor/doctor-table.tsx

```tsx
import Table from "@/components/ui/data-table";
import type { TMeta } from "@/types";
import type { DoctorSortBy, DoctorSortOrder, TDoctor } from "@/types/doctor";
import { getDoctorColumns } from "./doctor-table-columns";

import { useRouter } from "next/navigation";

type DoctorTableProps = {
  doctors: TDoctor[];
  meta: TMeta | undefined;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  sortBy: DoctorSortBy;
  sortOrder: DoctorSortOrder;
  changeSortBy: (field: string) => void;
  changeSortOrder: (order: string) => void;
};

export default function DoctorTable({
  doctors,
  meta,
  isLoading,
  isFetching,
  page,
  limit,
  setPage,
  setLimit,
  sortBy,
  sortOrder,
  changeSortBy,
  changeSortOrder,
}: DoctorTableProps) {
  const router = useRouter();
  const columns = getDoctorColumns({
    sortBy,
    sortOrder,
    onView: (record) => router.push(`/dashboard/doctors/${record._id}`),
  });
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-200 sm:p-5">
      <Table<TDoctor>
        data={doctors}
        meta={meta}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        setSortBy={changeSortBy}
        setSortOrder={changeSortOrder}
        rowKey="_id"
      />
    </div>
  );
}

```

### src/components/doctor/doctor-table-columns.tsx

```tsx
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SPECIALIZATION,
  type DoctorSortBy,
  type DoctorSortOrder,
  type TDoctor,
} from "@/types/doctor";

export const specializationLabel = (value: SPECIALIZATION) =>
  value === SPECIALIZATION.ENT
    ? "ENT"
    : value
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");

const renderEllipsis = (value: string | number | null | undefined) => {
  const text = value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <Tooltip title={text}>
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

type DoctorColumnsOptions = {
  onView: (doctor: TDoctor) => void;
  sortBy: DoctorSortBy;
  sortOrder: DoctorSortOrder;
};

export const getDoctorColumns = ({
  sortBy,
  sortOrder,
  onView,
}: DoctorColumnsOptions): ColumnsType<TDoctor> => {
  const sortState = (field: DoctorSortBy) => ({
    sorter: true,
    sortOrder:
      sortBy === field ? (sortOrder === "asc" ? ("ascend" as const) : ("descend" as const)) : null,
  });

  return [
    {
      title: "Doctor Name",
      dataIndex: "name",
      key: "name",
      width: 180,
      ...sortState("name"),
      render: renderEllipsis,
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      width: 170,
      ...sortState("specialization"),
      render: (value: SPECIALIZATION) => {
        const label = specializationLabel(value);

        return (
          <Tooltip title={label}>
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {label}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Hospital",
      dataIndex: "hospital",
      key: "hospital",
      width: 200,
      ...sortState("hospital"),
      render: renderEllipsis,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: renderEllipsis,
    },
    {
      title: "Patients",
      dataIndex: "patientsCount",
      key: "patientsCount",
      width: 100,
      render: renderEllipsis,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      render: (active: boolean) => {
        const status = active ? "Active" : "Inactive";

        return (
          <Tooltip title={status}>
            <Tag color={active ? "green" : "red"}>{status}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      ...sortState("createdAt"),
      render: (value: string) => {
        const date = new Date(value);
        const text = Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();

        return (
          <Tooltip title={text}>
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              aria-label={`View ${record.name}`}
              onClick={() => onView(record)}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                console.log("Edit doctor:", record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
};

```

### src/components/patient/patient-filters.tsx

```tsx
import { SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select, Spin } from "antd";
import dayjs from "dayjs";
import {
  ENUM_GENDER,
  TREATMENT_STATUS,
  type PatientSortBy,
  type PatientSortOrder,
} from "@/types/patient";
import { formatEnumLabel } from "./patient-table-columns";

export type DoctorOption = { value: string; label: string };

type PatientCommonFilterProps = {
  gender: ENUM_GENDER | undefined;
  treatmentStatus: TREATMENT_STATUS | undefined;
  followUpDate: string | undefined;
  lastVisitAt: string | undefined;
  sortBy: PatientSortBy;
  sortOrder: PatientSortOrder;
  setGender: (value: ENUM_GENDER | undefined) => void;
  setTreatmentStatus: (value: TREATMENT_STATUS | undefined) => void;
  setFollowUpDate: (value: string | undefined) => void;
  setLastVisitAt: (value: string | undefined) => void;
  setPage: (page: number) => void;
  changeSortBy: (field: string) => void;
  changeSortOrder: (order: string) => void;
  resetFilters: () => void;
};

type DoctorFilterProps = {
  doctorId: string | undefined;
  doctorOptions: DoctorOption[];
  doctorSearchTerm: string;
  isDoctorsFetching: boolean;
  doctorError: string | undefined;
  retryDoctors: () => void;
  setDoctorSearchTerm: (value: string) => void;
  changeDoctor: (value: string | undefined) => void;
};

export type PatientFilterValuesProps = PatientCommonFilterProps &
  ({ hideDoctorFilter: true } | ({ hideDoctorFilter?: false } & DoctorFilterProps));

type PatientFiltersProps = PatientFilterValuesProps &
  (
    | { mode?: "desktop"; searchTerm: string; setSearchTerm: (value: string) => void }
    | { mode: "mobile"; searchTerm?: never; setSearchTerm?: never }
  );

const sortOptions: { value: PatientSortBy; label: string }[] = [
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" },
  { value: "name", label: "Patient Name" },
  { value: "followUpDate", label: "Follow Up Date" },
  { value: "lastVisitAt", label: "Last Visit Date" },
  { value: "age", label: "Age" },
];

export default function PatientFilters(props: PatientFiltersProps) {
  const mobile = props.mode === "mobile";
  const fieldClass = mobile ? "space-y-1.5" : "min-w-0";
  const controls = (
    <>
      {!props.hideDoctorFilter && (
        <div className={fieldClass}>
          {mobile && <div className="text-sm font-medium text-slate-700">Doctor</div>}
          <Select<string>
            aria-label="Doctor"
            placeholder="All Doctors"
            allowClear
            showSearch
            filterOption={false}
            searchValue={props.doctorSearchTerm}
            onSearch={props.setDoctorSearchTerm}
            value={props.doctorId}
            options={props.doctorOptions}
            onChange={props.changeDoctor}
            loading={props.isDoctorsFetching}
            notFoundContent={
              props.isDoctorsFetching ? (
                <Spin size="small" />
              ) : props.doctorError ? (
                "Unable to load doctors"
              ) : (
                "No doctors found"
              )
            }
            className="w-full"
          />
          {props.doctorError && !props.isDoctorsFetching && (
            <div role="alert" className="mt-1 text-xs text-red-600">
              {props.doctorError}{" "}
              <Button type="link" size="small" onClick={props.retryDoctors}>
                Retry
              </Button>
            </div>
          )}
        </div>
      )}
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Gender</div>}
        <Select<ENUM_GENDER>
          aria-label="Gender"
          placeholder="All Gender"
          allowClear
          value={props.gender}
          options={Object.values(ENUM_GENDER).map((value) => ({
            value,
            label: formatEnumLabel(value),
          }))}
          onChange={(value) => {
            props.setGender(value);
            props.setPage(1);
          }}
          className="w-full"
        />
      </div>
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Treatment Status</div>}
        <Select<TREATMENT_STATUS>
          aria-label="Treatment status"
          placeholder="All Treatment Status"
          allowClear
          value={props.treatmentStatus}
          options={Object.values(TREATMENT_STATUS).map((value) => ({
            value,
            label: formatEnumLabel(value),
          }))}
          onChange={(value) => {
            props.setTreatmentStatus(value);
            props.setPage(1);
          }}
          className="w-full"
        />
      </div>
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Follow Up Date</div>}
        <DatePicker
          aria-label="Follow up date"
          placeholder="Follow Up Date"
          format="YYYY-MM-DD"
          value={props.followUpDate ? dayjs(props.followUpDate) : null}
          onChange={(date) => {
            props.setFollowUpDate(date?.format("YYYY-MM-DD"));
            props.setPage(1);
          }}
          className="w-full"
        />
      </div>
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Last Visit Date</div>}
        <DatePicker
          aria-label="Last visit date"
          placeholder="Last Visit Date"
          format="YYYY-MM-DD"
          value={props.lastVisitAt ? dayjs(props.lastVisitAt) : null}
          onChange={(date) => {
            props.setLastVisitAt(date?.format("YYYY-MM-DD"));
            props.setPage(1);
          }}
          className="w-full"
        />
      </div>
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Sort By</div>}
        <Select<PatientSortBy>
          aria-label="Sort by"
          value={props.sortBy}
          options={sortOptions}
          onChange={props.changeSortBy}
          className="w-full"
        />
      </div>
      <div className={fieldClass}>
        {mobile && <div className="text-sm font-medium text-slate-700">Sort Order</div>}
        <Select<PatientSortOrder>
          aria-label="Sort order"
          value={props.sortOrder}
          options={[
            { value: "asc", label: "Ascending" },
            { value: "desc", label: "Descending" },
          ]}
          onChange={props.changeSortOrder}
          className="w-full"
        />
      </div>
    </>
  );

  if (props.mode === "mobile") return <div className="space-y-4">{controls}</div>;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-blue-200">
      <div className="space-y-3">
        <Input
          aria-label="Search patients"
          placeholder="Search patients..."
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          value={props.searchTerm}
          onChange={(event) => {
            props.setSearchTerm(event.target.value);
            props.setPage(1);
          }}
        />
        <div className="hidden grid-cols-2 gap-3 sm:grid xl:grid-cols-4">
          {controls}
          <Button onClick={props.resetFilters} className="w-full">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

```

### src/redux/features/doctor/doctorApi.ts

```typescript
import { tagTypes } from "@/redux/tag-types";
import { baseApi } from "../../api/baseApi";
import type {
  DoctorDetails,
  DoctorFormValues,
  DoctorsQueryParams,
  DoctorsResponse,
  TDoctor,
} from "@/types/doctor";
import type { TResponse } from "@/types/global";
const URL = "/doctors";

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctorById: builder.query<TResponse<DoctorDetails>, string>({
      query: (id) => ({ url: `${URL}/${encodeURIComponent(id)}`, method: "GET" }),
      providesTags: [tagTypes.doctor],
    }),
    getDoctors: builder.query<DoctorsResponse, DoctorsQueryParams>({
      query: (params) => ({ url: URL, method: "GET", params }),
      providesTags: [tagTypes.doctor],
    }),
    createDoctorAccount: builder.mutation<TDoctor, DoctorFormValues>({
      query: (body) => ({
        url: URL,
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.doctor],
    }),
  }),
});

export const { useGetDoctorsQuery, useGetDoctorByIdQuery, useCreateDoctorAccountMutation } =
  doctorApi;

```

### src/types/doctor.ts

```typescript
import type { TMeta, TResponse } from "./global";

export enum SPECIALIZATION {
  CARDIOLOGY = "CARDIOLOGY",
  DERMATOLOGY = "DERMATOLOGY",
  NEUROLOGY = "NEUROLOGY",
  PEDIATRICS = "PEDIATRICS",
  GYNECOLOGY = "GYNECOLOGY",
  ORTHOPEDICS = "ORTHOPEDICS",
  ENT = "ENT",
  OPHTHALMOLOGY = "OPHTHALMOLOGY",
  GENERAL_MEDICINE = "GENERAL_MEDICINE",
  GENERAL_SURGERY = "GENERAL_SURGERY",
  PSYCHIATRY = "PSYCHIATRY",
  DENTISTRY = "DENTISTRY",
  OTHER = "OTHER",
}

export interface TDoctor {
  _id: string;
  userId: string;
  createdBy: string;
  name: string;
  email: string;
  specialization: SPECIALIZATION;
  hospital: string;
  phone: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  patientsCount: number;
}
export interface DoctorFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  hospital: string;
  specialization: SPECIALIZATION;
}
export const DOCTOR_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "specialization",
  "hospital",
] as const;
export type DoctorSortBy = (typeof DOCTOR_SORT_FIELDS)[number];
export type DoctorSortOrder = "asc" | "desc";

export interface DoctorsQueryParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: DoctorSortBy;
  sortOrder?: DoctorSortOrder;
  specialization?: SPECIALIZATION;
  hospital?: string;
  isActive?: boolean;
}

export type DoctorsResponse = TResponse<TDoctor[]> & {
  data: TDoctor[];
  meta: TMeta;
};

// Fields consumed from the detail endpoint; its aggregation omits list patient counts.
export type DoctorDetails = Pick<
  TDoctor,
  "_id" | "name" | "email" | "phone" | "hospital" | "specialization" | "isActive" | "createdAt"
> &
  Partial<Pick<TDoctor, "patientsCount">>;

```

### tests/doctor-details.test.ts

```typescript
import assert from "node:assert/strict";
import { test } from "node:test";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../src/redux/api/baseApi";
import authReducer from "../src/redux/features/auth/authSlice";
import { doctorApi } from "../src/redux/features/doctor/doctorApi";
import { patientApi } from "../src/redux/features/patient/patientApi";
import { ENUM_GENDER, TREATMENT_STATUS } from "../src/types/patient";

test("doctor detail and scoped patient queries keep independent cache entries", async () => {
  const originalFetch = globalThis.fetch;
  const requests: URL[] = [];
  const id = "6abe56bb75b73e67a5efdc01";
  const store = configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  const profile = { success: true, message: "", data: { _id: id, name: "Test Doctor" } };
  globalThis.fetch = async (input) => {
    const request = input as Request;
    assert.equal(request.method, "GET");
    const url = new URL(request.url);
    requests.push(url);
    return new Response(
      JSON.stringify(
        url.pathname.endsWith(`/doctors/${id}`)
          ? profile
          : { success: true, message: "", data: [], meta: { page: 1, limit: 10, total: 0 } },
      ),
      { headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    const detail = store.dispatch(doctorApi.endpoints.getDoctorById.initiate(id));
    assert.deepEqual(await detail.unwrap(), profile);
    const defaults = {
      doctorId: id,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    };
    await store.dispatch(patientApi.endpoints.getPatients.initiate(defaults)).unwrap();
    const filtered = {
      ...defaults,
      page: 2,
      limit: 20,
      searchTerm: "Olivia",
      gender: ENUM_GENDER.FEMALE,
      treatmentStatus: TREATMENT_STATUS.ACTIVE,
      followUpDate: "2026-10-02",
      lastVisitAt: "2026-10-01",
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    };
    await store.dispatch(patientApi.endpoints.getPatients.initiate(filtered)).unwrap();
    await store.dispatch(patientApi.endpoints.getPatients.initiate(defaults)).unwrap();
    assert.equal(requests[0].pathname, `/api/v1/doctors/${id}`);
    assert.equal(requests[0].search, "");
    assert.deepEqual(
      Object.fromEntries(requests[1].searchParams),
      Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, String(value)])),
    );
    assert.deepEqual(
      Object.fromEntries(requests[2].searchParams),
      Object.fromEntries(Object.entries(filtered).map(([key, value]) => [key, String(value)])),
    );
    assert.equal(
      requests.length,
      3,
      "changing patients must not refetch the doctor or an already cached patient query",
    );
    assert.deepEqual(doctorApi.endpoints.getDoctorById.select(id)(store.getState()).data, profile);
  } finally {
    store.dispatch(baseApi.util.resetApiState());
    globalThis.fetch = originalFetch;
  }
});

```

This report is saved as docs/doctor-details-implementation.md. Other pre-existing or concurrent workspace changes were preserved.
