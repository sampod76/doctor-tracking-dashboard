"use client";
import Link from "next/link";
import { useRef } from "react";
import { useDeletePatientMutation } from "@/redux/features/patient/patientApi";
import { apiErrorMessage } from "@/utils/api-error";
import { DeleteFilled, EditOutlined, MoreOutlined, EyeOutlined } from "@ant-design/icons";
import { App, Dropdown, type MenuProps, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  TREATMENT_STATUS,
  type PatientDoctor,
  type PatientSortBy,
  type PatientSortOrder,
  type TPatient,
} from "@/types/patient";

export const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

export const renderDoctorRelationTooltip = (doctor: Partial<PatientDoctor>) => (
  <div className="space-y-1">
    <div>Med. Reg. No: {doctor.medicalRegistrationNo?.trim() || "N/A"}</div>
    <div>
      <span className="font-medium">Name:</span> {doctor.name?.trim() || "N/A"}
    </div>
    <div>
      <span className="font-medium">Specialization:</span>{" "}
      {doctor.specialization ? formatEnumLabel(doctor.specialization) : "N/A"}
    </div>
    <div>
      <span className="font-medium">Email:</span> {doctor.email?.trim() || "N/A"}
    </div>
  </div>
);

const renderEllipsis = (value: string | number | null | undefined) => {
  const text = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <Tooltip title={text}>
      <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">{text}</div>
    </Tooltip>
  );
};

const statusColors: Record<TREATMENT_STATUS, string> = {
  [TREATMENT_STATUS.ACTIVE]: "blue",
  [TREATMENT_STATUS.UNDER_OBSERVATION]: "orange",
  [TREATMENT_STATUS.RECOVERED]: "green",
};

type PatientColumnsOptions = {
  sortBy: PatientSortBy;
  sortOrder: PatientSortOrder;
  onEdit: (patient: TPatient) => void;
  onDeleted?: () => void;
};

export const usePatientColumns = ({
  sortBy,
  sortOrder,
  onEdit,
  onDeleted,
}: PatientColumnsOptions) => {
  const { modal, message } = App.useApp();
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();
  const deletePending = useRef(false);
  const handleDeleteConfirm = (record: Pick<TPatient, "_id" | "name">) => {
    if (isDeleting || deletePending.current) return;
    modal.confirm({
      title: "Delete Patient",
      content: (
        <span>
          Are you sure you want to delete <strong>{record.name}</strong>?
        </span>
      ),
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        if (deletePending.current) return;
        deletePending.current = true;
        try {
          const response = await deletePatient(record._id).unwrap();
          if (!response.success) throw new Error(response.message || "Failed to delete patient");
          message.success("Patient deleted successfully.");
          onDeleted?.();
        } catch (error: unknown) {
          message.error(apiErrorMessage(error, "Failed to delete patient"));
          throw error;
        } finally {
          deletePending.current = false;
        }
      },
    });
  };

  const sortState = (field: PatientSortBy) => ({
    sorter: true,
    sortOrder:
      sortBy === field ? (sortOrder === "asc" ? ("ascend" as const) : ("descend" as const)) : null,
  });
  const columns: ColumnsType<TPatient> = [
    {
      title: "Patient Name",
      dataIndex: "name",
      key: "name",
      width: 170,
      ...sortState("name"),
      render: renderEllipsis,
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 130, render: renderEllipsis },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 70,
      ...sortState("age"),
      render: renderEllipsis,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 90,
      render: (value: string) => renderEllipsis(formatEnumLabel(value)),
    },
    {
      title: "Doctor",
      key: "doctor",
      width: 160,
      render: (_: unknown, record) => {
        const doctor = record.doctor?.[0];
        if (!doctor) return "—";

        return (
          <Tooltip title={renderDoctorRelationTooltip(doctor)}>
            <span className="block w-full cursor-help overflow-hidden text-ellipsis whitespace-nowrap">
              {doctor.name || "—"}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Treatment Status",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      width: 170,
      render: (value: TREATMENT_STATUS) => (
        <Tag color={statusColors[value]}>{formatEnumLabel(value)}</Tag>
      ),
    },
    {
      title: "Last Visit",
      dataIndex: "lastVisitAt",
      key: "lastVisitAt",
      width: 120,
      ...sortState("lastVisitAt"),
      render: (value: string | null) => renderEllipsis(formatDate(value)),
    },
    {
      title: "Follow Up",
      dataIndex: "followUpDate",
      key: "followUpDate",
      width: 120,
      ...sortState("followUpDate"),
      render: (value: string | null) => renderEllipsis(formatDate(value)),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      ...sortState("createdAt"),
      render: (value: string) => renderEllipsis(formatDate(value)),
    },
    {
      title: "Actions",
      key: "actions",
      width: 70,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: (
              <Link href={`/dashboard/patients/${encodeURIComponent(record._id)}`}>
                View Patient
              </Link>
            ),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Patient",
            onClick: () => onEdit(record),
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteFilled />,
            label: "Delete Patient",
            danger: true,
            disabled: isDeleting,
            onClick: () => handleDeleteConfirm(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["hover"]} placement="bottomRight">
            <MoreOutlined />
          </Dropdown>
        );
      },
    },
  ];
  return { columns, isDeleting, handleDeleteConfirm };
};
