
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
  rowKey?: string;
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
  rowKey = "id",
}: TableProps<TData>) {
  const router = useRouter();
  const searchParams = useSearchParams();


  const adjustedColumns = columns.map((col) => {

    if (col.width) {
      return { ...col };
    }


    const columnsWithoutWidth = columns.filter((c) => !c.width).length;

    const totalFixedWidth = columns
      .filter((c) => c.width)
      .reduce((sum, c) => {
        if (typeof c.width === "number") {
          return sum + c.width;
        }

        if (typeof c.width === "string") {
          return sum + (parseInt(c.width) || 0);
        }

        return sum;
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

  const handleTableChange = (
    paginationInfo: any,
    filters: any,
    sorter: any,
    extra: { action: string },
  ) => {
    const newPage = paginationInfo.pageSize !== limit ? 1 : paginationInfo.current;

    const newLimit = paginationInfo.pageSize;

    setPage(newPage);
    setLimit(newLimit);

    if (urlParamsUpdate) {
      updateUrlParams(newPage, newLimit);
    }

    if (extra.action === "sort") {
      if (sorter.field && sorter.order) {
        setSortBy(sorter.field);
        setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
      } else {
        setSortBy("createdAt");
        setSortOrder("desc");
      }
    }

    if (setStatus) {
      if (filters.status) {
        setStatus(filters.status[0]);
      } else {
        setStatus(undefined);
      }
    }

    if (setMediaType) {
      if (filters.media_type) {
        setMediaType(filters.media_type[0]);
      } else {
        setMediaType(undefined);
      }
    }
  };

  const paginationConfig = {
    current: page,
    pageSize: limit,
    total: meta?.total || 0,
    showSizeChanger,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <div className="custom-data-table">
      <AntdTable
        dataSource={data}
        columns={adjustedColumns}
        loading={isLoading || isFetching}
        rowKey={rowKey}
        pagination={pagination ? paginationConfig : false}
        onChange={handleTableChange}
        id="data-table"
        tableLayout="fixed"
        scroll={{ x: 1100 }}
        rowClassName={(_, index) => (index % 2 === 0 ? "table-row-even" : "table-row-odd")}
      />
    </div>
  );
}
