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
