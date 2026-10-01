"use client";

import Table from "@/components/ui/data-table";
import { useDebounced } from "@/hooks/use-debounce";
import { useGetDoctorsQuery } from "@/redux/features/doctor/doctorApi";
import {
  DOCTOR_SORT_FIELDS,
  SPECIALIZATION,
  type DoctorSortBy,
  type DoctorSortOrder,
  type DoctorsQueryParams,
  type TDoctor,
} from "@/types/doctor";

import { apiErrorMessage } from "@/utils/api-error";
import { Alert, Button, Input, Select, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

const specializationLabel = (value: SPECIALIZATION) =>
  value === SPECIALIZATION.ENT
    ? "ENT"
    : value
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");

const sortOptions: { value: DoctorSortBy; label: string }[] = [
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" },
  { value: "name", label: "Doctor Name" },
  { value: "specialization", label: "Specialization" },
  { value: "hospital", label: "Hospital" },
];
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
export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [hospital, setHospital] = useState("");
  const [specialization, setSpecialization] = useState<SPECIALIZATION>();
  const [isActive, setIsActive] = useState<boolean>();
  const [sortBy, setSortBy] = useState<DoctorSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<DoctorSortOrder>("desc");
  const debouncedSearch = useDebounced({ searchQuery: searchTerm, delay: 350 });
  const debouncedHospital = useDebounced({ searchQuery: hospital, delay: 350 });
  const params: DoctorsQueryParams = { page, limit, sortBy, sortOrder };
  // Clearing a text filter takes effect immediately, including when resetting filters.
  if (searchTerm.trim() && debouncedSearch.trim()) params.searchTerm = debouncedSearch.trim();
  if (hospital.trim() && debouncedHospital.trim()) params.hospital = debouncedHospital.trim();
  if (specialization !== undefined) params.specialization = specialization;
  if (isActive !== undefined) params.isActive = isActive;
  const isDebouncing =
    (Boolean(searchTerm.trim()) && searchTerm !== debouncedSearch) ||
    (Boolean(hospital.trim()) && hospital !== debouncedHospital);
  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDoctorsQuery(params, {
    skip: isDebouncing,
  });

  const changeSortBy = (field: string) => {
    if (DOCTOR_SORT_FIELDS.some((value) => value === field)) {
      setSortBy(field as DoctorSortBy);
      if (field !== sortBy) setPage(1);
    }
  };
  const changeSortOrder = (order: string) => {
    if (order === "asc" || order === "desc") {
      setSortOrder(order);
      if (order !== sortOrder) setPage(1);
    }
  };
  const sortState = (field: DoctorSortBy) => ({
    sorter: true,
    sortOrder:
      sortBy === field ? (sortOrder === "asc" ? ("ascend" as const) : ("descend" as const)) : null,
  });

  const columns: ColumnsType<TDoctor> = [
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
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setHospital("");
    setSpecialization(undefined);
    setIsActive(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Doctors List</h2>
        <p className="text-sm text-gray-500">View and filter all doctors</p>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-3 rounded-xl p-5 shadow-xl shadow-sky-100 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            aria-label="Search doctors"
            placeholder="Search by name, email, phone or hospital..."
            className="sm:col-span-2"
            allowClear
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
          />
          <Select<SPECIALIZATION>
            aria-label="Specialization"
            placeholder="All Specializations"
            allowClear
            value={specialization}
            options={Object.values(SPECIALIZATION).map((value) => ({
              value,
              label: specializationLabel(value),
            }))}
            onChange={(value) => {
              setSpecialization(value);
              setPage(1);
            }}
          />
          <Input
            aria-label="Hospital"
            placeholder="Filter by hospital"
            allowClear
            value={hospital}
            onChange={(event) => {
              setHospital(event.target.value);
              setPage(1);
            }}
          />
          <Select
            aria-label="Active status"
            value={isActive === undefined ? "all" : isActive ? "active" : "inactive"}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            onChange={(value) => {
              setIsActive(value === "all" ? undefined : value === "active");
              setPage(1);
            }}
          />
          <Select<DoctorSortBy>
            aria-label="Sort by"
            value={sortBy}
            options={sortOptions}
            onChange={changeSortBy}
          />
          <Select<DoctorSortOrder>
            aria-label="Sort order"
            value={sortOrder}
            options={[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ]}
            onChange={changeSortOrder}
          />
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
        {error && !isDebouncing && (
          <Alert
            type="error"
            showIcon
            message={apiErrorMessage(error, "Unable to load doctors.")}
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        )}
        <div className="space-y-6 rounded-xl p-5 shadow-xl shadow-sky-200">
          <Table<TDoctor>
            data={data?.data ?? []}
            meta={data?.meta}
            columns={columns}
            isLoading={isLoading}
            isFetching={isFetching || isDebouncing}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            setSortBy={changeSortBy}
            setSortOrder={changeSortOrder}
            rowKey="_id"
            urlParamsUpdate={false}
          />
        </div>
      </div>
      {/* Display the active backend sort. */}
      <div className="mt-4 text-xs text-gray-400">
        Sort: {sortBy} / {sortOrder}
      </div>
    </div>
  );
}
