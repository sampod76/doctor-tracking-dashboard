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
