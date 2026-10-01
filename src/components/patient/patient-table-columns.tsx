import { EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  TREATMENT_STATUS,
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
  onView: (patient: TPatient) => void;
};

export const getPatientColumns = ({
  sortBy,
  sortOrder,
  onView,
}: PatientColumnsOptions): ColumnsType<TPatient> => {
  const sortState = (field: PatientSortBy) => ({
    sorter: true,
    sortOrder:
      sortBy === field ? (sortOrder === "asc" ? ("ascend" as const) : ("descend" as const)) : null,
  });
  return [
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
      width: 80,
      fixed: "right",
      align: "center",
      render: (_: unknown, patient) => (
        <Tooltip title="View">
          <Button
            type="text"
            aria-label={`View ${patient.name}`}
            icon={<EyeOutlined />}
            onClick={() => onView(patient)}
          />
        </Tooltip>
      ),
    },
  ];
};
