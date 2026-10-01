import Table from "@/components/ui/data-table";
import type { TMeta } from "@/types";
import type { DoctorSortBy, DoctorSortOrder, TDoctor } from "@/types/doctor";
import { getDoctorColumns } from "./doctor-table-columns";

import { useRouter } from "next/navigation";

type DoctorTableProps = {
  doctors: TDoctor[];
  meta: TMeta | undefined;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  sortBy: DoctorSortBy;
  sortOrder: DoctorSortOrder;
  changeSortBy: (field: string) => void;
  changeSortOrder: (order: string) => void;
};

export default function DoctorTable({
  doctors,
  meta,
  isLoading,
  isFetching,
  page,
  limit,
  setPage,
  setLimit,
  sortBy,
  sortOrder,
  changeSortBy,
  changeSortOrder,
}: DoctorTableProps) {
  const router = useRouter();
  const columns = getDoctorColumns({
    sortBy,
    sortOrder,
    onView: (record) => router.push(`/dashboard/doctors/${record._id}`),
  });
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-200 sm:p-5">
      <Table<TDoctor>
        data={doctors}
        meta={meta}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        setSortBy={changeSortBy}
        setSortOrder={changeSortOrder}
        rowKey="_id"
      />
    </div>
  );
}
