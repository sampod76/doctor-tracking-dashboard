"use client";

import { DeleteFilled, EditOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { App, Dropdown, type MenuProps, Tag, Tooltip } from "antd";
import Link from "next/link";
import { useRef } from "react";
import { useDeleteDoctorMutation } from "@/redux/features/doctor/doctorApi";
import { apiErrorMessage } from "@/utils/api-error";
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
  onEdit: (doctor: TDoctor) => void;
  sortBy: DoctorSortBy;
  sortOrder: DoctorSortOrder;
};

export const useDoctorColumns = ({
  sortBy,
  sortOrder,
  onEdit,
}: DoctorColumnsOptions): ColumnsType<TDoctor> => {
  const { modal, message } = App.useApp();
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();
  const deletePending = useRef(false);
  const handleDeleteConfirm = (record: TDoctor) => {
    if (isDeleting || deletePending.current) return;
    modal.confirm({
      title: "Delete Doctor",
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
          await deleteDoctor(record._id).unwrap();
          message.success("Doctor deleted successfully.");
        } catch (error: unknown) {
          message.error(apiErrorMessage(error, "Failed to delete doctor"));
          throw error;
        } finally {
          deletePending.current = false;
        }
      },
    });
  };
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
      title: "Reg.No",
      dataIndex: "medicalRegistrationNo",
      key: "medicalRegistrationNo",
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
      width: 70,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: (
              <Link href={`/dashboard/doctors/${encodeURIComponent(record._id)}`}>
                Profile & Patients
              </Link>
            ),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Doctor",
            onClick: () => onEdit(record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            icon: <DeleteFilled />,
            label: "Delete Doctor",
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
};
