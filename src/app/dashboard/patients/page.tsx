"use client";

import PatientHeader from "@/components/patient/patient-header";
import PatientFilters, { type DoctorOption } from "@/components/patient/patient-filters";
import PatientFilterDrawer from "@/components/patient/patient-filter-drawer";
import PatientTable from "@/components/patient/patient-table";
import { useDebounced } from "@/hooks/use-debounce";
import { useGetDoctorsQuery } from "@/redux/features/doctor/doctorApi";
import { useGetPatientsQuery } from "@/redux/features/patient/patientApi";
import type { DoctorsQueryParams } from "@/types/doctor";
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

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [doctorId, setDoctorId] = useState<string>();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption>();
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [gender, setGender] = useState<ENUM_GENDER>();
  const [treatmentStatus, setTreatmentStatus] = useState<TREATMENT_STATUS>();
  const [followUpDate, setFollowUpDate] = useState<string>();
  const [lastVisitAt, setLastVisitAt] = useState<string>();
  const [sortBy, setSortBy] = useState<PatientSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<PatientSortOrder>("desc");
  const debouncedSearch = useDebounced({ searchQuery: searchTerm, delay: 350 });
  const debouncedDoctorSearch = useDebounced({ searchQuery: doctorSearchTerm, delay: 350 });

  const params: PatientsQueryParams = { page, limit, sortBy, sortOrder };
  // Clearing filters takes effect immediately, even while debounce is pending.
  if (searchTerm.trim() && debouncedSearch.trim()) params.searchTerm = debouncedSearch.trim();
  if (doctorId) params.doctorId = doctorId;
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

  const doctorParams: DoctorsQueryParams = { page: 1, limit: 10 };
  if (doctorSearchTerm.trim() && debouncedDoctorSearch.trim())
    doctorParams.searchTerm = debouncedDoctorSearch.trim();
  const isDoctorDebouncing =
    Boolean(doctorSearchTerm.trim()) && doctorSearchTerm !== debouncedDoctorSearch;
  // One subscription supplies both desktop and drawer; RTK Query caches by params.
  const {
    currentData: doctorsData,
    isFetching: isDoctorsFetching,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useGetDoctorsQuery(doctorParams, { skip: isDoctorDebouncing });
  const doctorOptions: DoctorOption[] = (doctorsData?.data ?? []).map((doctor) => ({
    value: doctor._id,
    label: doctor.name,
  }));
  // Preserve the selected label when subsequent remote results omit this doctor.
  if (selectedDoctor && !doctorOptions.some((option) => option.value === selectedDoctor.value))
    doctorOptions.unshift(selectedDoctor);

  const changeDoctor = (value: string | undefined) => {
    setDoctorId(value);
    setSelectedDoctor(doctorOptions.find((option) => option.value === value));
    setDoctorSearchTerm("");
    setPage(1);
  };
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
    setDoctorId(undefined);
    setSelectedDoctor(undefined);
    setDoctorSearchTerm("");
    setGender(undefined);
    setTreatmentStatus(undefined);
    setFollowUpDate(undefined);
    setLastVisitAt(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };
  const filterProps = {
    doctorId,
    doctorOptions,
    doctorSearchTerm,
    isDoctorsFetching: isDoctorsFetching || isDoctorDebouncing,
    doctorError: doctorsError
      ? apiErrorMessage(doctorsError, "Unable to load doctors.")
      : undefined,
    retryDoctors: () => {
      if (!isDoctorDebouncing) void refetchDoctors();
    },
    setDoctorSearchTerm,
    changeDoctor,
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
    <div className="min-h-screen bg-transparent p-2 sm:p-6">
      <PatientHeader filterOpen={filterOpen} onOpenFilters={() => setFilterOpen(true)} />
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
      <div className="mt-4 text-xs text-gray-400">
        Sort: {sortBy} / {sortOrder}
      </div>
    </div>
  );
}
