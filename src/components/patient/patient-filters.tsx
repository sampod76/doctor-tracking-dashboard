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
