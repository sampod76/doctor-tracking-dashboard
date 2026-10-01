/* eslint-disable @typescript-eslint/no-explicit-any */
import { TMeta } from "@/types";
import { Table as AntdTable } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter, useSearchParams } from "next/navigation";

interface TableProps<TData> {
  data: TData[] | undefined;
  meta: TMeta | undefined;
  columns: ColumnsType<TData>;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: string) => void;
  setStatus?: (value: string | undefined) => void;
  setMediaType?: (value: string | undefined) => void;
  setFieldsType?: (value: string) => void;
  showSizeChanger?: boolean;
  urlParamsUpdate?: boolean;
  dataSource?: TData[];
  pagination?: boolean;
}

export default function Table<TData>({
  data,
  meta,
  columns,
  isLoading,
  isFetching,
  page,
  setPage,
  limit,
  setLimit,
  setSortBy,
  setStatus,
  setMediaType,
  setSortOrder,
  showSizeChanger = true,
  urlParamsUpdate = true,
  pagination = true,
}: TableProps<TData>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calculate column widths
  const adjustedColumns = columns.map((col) => {
    // If the column has a fixed width, use it
    if (col.width) {
      return { ...col };
    }
    // For columns without fixed width, distribute remaining space equally
    const columnsWithoutWidth = columns.filter((c) => !c.width).length;
    const totalFixedWidth = columns
      .filter((c) => c.width)
      .reduce((sum, c) => {
        if (typeof c.width === "number") {
          return sum + c.width;
        } else if (typeof c.width === "string") {
          return sum + (parseInt(c.width) || 0);
        }
        return sum; // Handle undefined case
      }, 0);
    const remainingWidth =
      columnsWithoutWidth > 0 ? (100 - totalFixedWidth) / columnsWithoutWidth : 0;
    return {
      ...col,
      width: `${remainingWidth}%`,
    };
  });

  const updateUrlParams = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newPage > 0) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    if (newLimit > 0) {
      params.set("limit", newLimit.toString());
    } else {
      params.delete("limit");
    }

    router.push(`?${params.toString()}`);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const newPage = pagination.current;
    const newLimit = pagination.pageSize;

    setPage(newPage);
    setLimit(newLimit);
    if (urlParamsUpdate) {
      updateUrlParams(newPage, newLimit);
    }

    if (sorter.field && sorter.order) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    } else {
      setSortBy("createdAt");
      setSortOrder("desc");
    }

    if (setStatus) {
      if (filters.status) setStatus(filters.status[0]);
      else setStatus(undefined);
    }
    if (setMediaType) {
      if (filters.media_type) setMediaType(filters.media_type[0]);
      else setMediaType(undefined);
    }
  };

  const paginationConfig = {
    current: page,
    pageSize: limit,
    total: meta?.total || 0,
    showSizeChanger: showSizeChanger,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: (total: any, range: any[]) => `${range[0]}-${range[1]} of ${total} items`,
  };
  return (
    <AntdTable
      dataSource={data}
      columns={adjustedColumns}
      loading={isLoading || isFetching}
      rowKey="id"
      pagination={pagination ? paginationConfig : false}
      onChange={handleTableChange}
      id="data-table"
      scroll={{ x: "max-content" }} // Ensure table is scrollable if content overflows
    />
  );
}
