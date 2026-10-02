"use client";

import { useEffect, useId, useState } from "react";
import { App, Button, DatePicker, Form, Input, InputNumber, Select, Spin, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useDebounced } from "@/hooks/use-debounce";
import { useGetDoctorsQuery } from "@/redux/features/doctor/doctorApi";
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "@/redux/features/patient/patientApi";
import {
  ENUM_GENDER,
  TREATMENT_STATUS,
  type CreatePatientPayload,
  type PatientDetails,
} from "@/types/patient";
import { apiErrorMessage } from "@/utils/api-error";
import { formatEnumLabel, renderDoctorRelationTooltip } from "./patient-table-columns";
import { useModal } from "@/components/ui/modal";
import type { DoctorOption } from "./patient-filters";

type PatientFormValues = Omit<CreatePatientPayload, "doctorId" | "lastVisitAt" | "followUpDate"> & {
  doctorId?: string;
  lastVisitAt?: Dayjs | null;
  followUpDate?: Dayjs | null;
};

export default function PatientForm({
  doctorId,
  onLoadingChange,
  patient,
}: {
  doctorId?: string;
  patient?: PatientDetails;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [form] = Form.useForm<PatientFormValues>();
  const formId = useId();
  const { closeModal } = useModal();
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption>();
  const debouncedSearch = useDebounced({ searchQuery: search, delay: 350 });
  const isDebouncing = Boolean(search.trim()) && search !== debouncedSearch;
  const { currentData, isFetching, error, refetch } = useGetDoctorsQuery(
    {
      page: 1,
      limit: 10,
      ...(search.trim() && debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    },
    { skip: Boolean(doctorId) || isDebouncing },
  );
  const options = (currentData?.data ?? []).map((doctor) => ({
    value: doctor._id,
    label: doctor.name,
    medicalRegistrationNo: doctor.medicalRegistrationNo,
    specialization: doctor.specialization,
    email: doctor.email,
  }));
  if (selectedDoctor && !options.some((option) => option.value === selectedDoctor.value))
    options.unshift(selectedDoctor);
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const isLoading = isCreating || isUpdating;
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);
  const reset = () => {
    form.resetFields();
    setSearch("");
    setSelectedDoctor(undefined);
  };
  const close = () => {
    if (isLoading) return;
    reset();
    closeModal();
  };
  const submit = async (values: PatientFormValues) => {
    const assignedDoctorId = doctorId ?? values.doctorId;
    if (!assignedDoctorId) return;
    const payload: CreatePatientPayload = {
      ...values,
      doctorId: assignedDoctorId,
      name: values.name.trim(),
      phone: values.phone.trim(),
      patientComplaint: values.patientComplaint.trim(),
      lastVisitAt: values.lastVisitAt?.format("YYYY-MM-DD") ?? null,
      followUpDate: values.followUpDate?.format("YYYY-MM-DD") ?? null,
    };
    try {
      const response = patient
        ? await updatePatient({ id: patient._id, body: payload }).unwrap()
        : await createPatient(payload).unwrap();
      if (!response.success) {
        message.error(
          response.message || (patient ? "Failed to update patient" : "Failed to create patient"),
        );
        return;
      }
      message.success(patient ? "Patient updated successfully" : "Patient created successfully");
      reset();
      closeModal();
    } catch (error: unknown) {
      message.error(
        apiErrorMessage(error, patient ? "Failed to update patient" : "Failed to create patient"),
      );
    }
  };
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">{patient ? "Edit Patient" : "Add Patient"}</h2>
      <Form<PatientFormValues>
        name={formId}
        form={form}
        layout="vertical"
        onFinish={submit}
        disabled={isLoading}
        initialValues={
          patient
            ? {
                ...patient,
                doctorId: patient.doctor?._id,
                lastVisitAt:
                  patient.lastVisitAt && dayjs(patient.lastVisitAt).isValid()
                    ? dayjs(patient.lastVisitAt)
                    : null,
                followUpDate:
                  patient.followUpDate && dayjs(patient.followUpDate).isValid()
                    ? dayjs(patient.followUpDate)
                    : null,
              }
            : { treatmentStatus: TREATMENT_STATUS.ACTIVE }
        }
      >
        <Form.Item
          name="name"
          label="Patient Name"
          rules={[
            {
              required: true,
              whitespace: true,
              min: 2,
              max: 100,
              message: "Enter a name between 2 and 100 characters",
            },
          ]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              {
                required: true,
                whitespace: true,
                min: 6,
                max: 20,
                message: "Enter a phone number between 6 and 20 characters",
              },
            ]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[
              {
                required: true,
                type: "integer",
                min: 0,
                max: 150,
                message: "Enter a whole-number age from 0 to 150",
              },
            ]}
          >
            <InputNumber min={0} max={150} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Select gender" }]}
          >
            <Select
              options={Object.values(ENUM_GENDER).map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </Form.Item>
          <Form.Item name="treatmentStatus" label="Treatment Status">
            <Select
              options={Object.values(TREATMENT_STATUS).map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </Form.Item>
        </div>
        {!doctorId && (
          <Form.Item
            name="doctorId"
            label="Doctor"
            rules={[{ required: true, message: "Select a doctor" }]}
          >
            <Select<string, DoctorOption>
              showSearch
              allowClear
              filterOption={false}
              searchValue={search}
              onSearch={setSearch}
              options={options}
              optionRender={(option) => (
                <Tooltip
                  title={renderDoctorRelationTooltip({ ...option.data, name: option.data.label })}
                >
                  <span>{option.data.label || "â€”"}</span>
                </Tooltip>
              )}
              labelRender={(option) => {
                const doctor = options.find((item) => item.value === option.value);
                return doctor ? (
                  <Tooltip title={renderDoctorRelationTooltip({ ...doctor, name: doctor.label })}>
                    <span>{doctor.label || "â€”"}</span>
                  </Tooltip>
                ) : (
                  option.label
                );
              }}
              title="Search doctors by name, email or registration no."
              loading={isFetching || isDebouncing}
              placeholder="Select Doctor"
              onChange={(value: string | undefined) => {
                setSelectedDoctor(options.find((option) => option.value === value));
                setSearch("");
              }}
              notFoundContent={
                isFetching || isDebouncing ? (
                  <Spin size="small" />
                ) : error ? (
                  "Unable to load doctors"
                ) : (
                  "No doctors found"
                )
              }
            />
          </Form.Item>
        )}
        {!doctorId && error && !isDebouncing && (
          <div role="alert" className="mb-4 text-sm text-red-600">
            {apiErrorMessage(error, "Unable to load doctors.")}{" "}
            <Button type="link" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        <Form.Item
          name="patientComplaint"
          label="Patient Complaint"
          rules={[
            {
              required: true,
              whitespace: true,
              max: 5000,
              message: "Enter a patient complaint (up to 5000 characters)",
            },
          ]}
        >
          <Input.TextArea rows={3} maxLength={5000} />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ max: 500 }]}>
          <Input.TextArea rows={2} maxLength={500} />
        </Form.Item>
        <Form.Item name="doctorAdvice" label="Doctor Advice" rules={[{ max: 5000 }]}>
          <Input.TextArea rows={2} maxLength={5000} />
        </Form.Item>
        <Form.Item name="notes" label="Notes" rules={[{ max: 5000 }]}>
          <Input.TextArea rows={2} maxLength={5000} />
        </Form.Item>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="lastVisitAt" label="Last Visit Date">
            <DatePicker format="YYYY-MM-DD" className="w-full" />
          </Form.Item>
          <Form.Item name="followUpDate" label="Follow Up Date">
            <DatePicker format="YYYY-MM-DD" className="w-full" />
          </Form.Item>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button onClick={reset} disabled={isLoading}>
            Reset
          </Button>
          <Button onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="bg-orange-500 hover:!bg-orange-600"
          >
            {patient ? "Save Changes" : "Create Patient"}
          </Button>
        </div>
      </Form>
    </>
  );
}
