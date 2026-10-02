import type { TDoctor } from "@/types/doctor";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select, Spin, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  ENUM_GENDER,
  TREATMENT_STATUS,
  type PatientSortBy,
  type PatientSortOrder,
} from "@/types/patient";
import { formatEnumLabel, renderDoctorRelationTooltip } from "./patient-table-columns";

export type DoctorOption = { value: string; label: string } & Pick<
  TDoctor,
  "medicalRegistrationNo" | "email" | "specialization"
>;

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
  const fieldClass = (desktop: string) => (mobile ? "space-y-1.5" : `min-w-0 ${desktop}`);
  const controls = (
    <>
      {!props.hideDoctorFilter && (
        <div className={fieldClass("order-2 xl:col-span-3")}>
          {mobile && <div className="text-sm font-medium text-slate-700">Doctor</div>}
          <Select<string, DoctorOption>
            aria-label="Doctor"
            placeholder="All Doctors"
            allowClear
            showSearch
            filterOption={false}
            searchValue={props.doctorSearchTerm}
            onSearch={props.setDoctorSearchTerm}
            value={props.doctorId}
            options={props.doctorOptions}
            optionRender={(option) => (
              <Tooltip
                title={renderDoctorRelationTooltip({ ...option.data, name: option.data.label })}
              >
                <span>{option.data.label || "—"}</span>
              </Tooltip>
            )}
            labelRender={(option) => {
              const doctor = props.doctorOptions.find((item) => item.value === option.value);
              return doctor ? (
                <Tooltip title={renderDoctorRelationTooltip({ ...doctor, name: doctor.label })}>
                  <span>{doctor.label || "—"}</span>
                </Tooltip>
              ) : (
                option.label
              );
            }}
            title="Search doctors by name, email or registration no."
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
      <div className={fieldClass("order-4 xl:col-span-2")}>
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
      <div className={fieldClass("order-3 xl:col-span-3")}>
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
      <div className={fieldClass("order-5 xl:col-span-3")}>
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
      <div className={fieldClass("order-6 xl:col-span-3")}>
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
      <div className={fieldClass("order-7 xl:col-span-2")}>
        {mobile && <div className="text-sm font-medium text-slate-700">Sort By</div>}
        <Select<PatientSortBy>
          aria-label="Sort by"
          value={props.sortBy}
          options={sortOptions}
          onChange={props.changeSortBy}
          className="w-full"
        />
      </div>
      <div className={fieldClass("order-8 xl:col-span-2")}>
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
    <div className="patient-compact-filters rounded-xl border border-[#e8edf3] bg-white/90 p-3">
      <div className="grid min-w-0 grid-cols-1 items-start gap-2.5 sm:grid-cols-2 xl:grid-cols-12">
        <div
          className={
            props.hideDoctorFilter
              ? "order-1 min-w-0 sm:col-span-2 xl:col-span-7"
              : "order-1 min-w-0 sm:col-span-2 xl:col-span-4"
          }
        >
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
        </div>
        <div className="hidden sm:contents">
          {controls}
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={props.resetFilters}
            className="patient-filter-reset order-9 justify-self-end !px-2 !text-slate-500 xl:col-span-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
