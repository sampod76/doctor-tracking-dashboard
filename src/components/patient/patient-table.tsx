import Table from "@/components/ui/data-table";
import type { TMeta } from "@/types";
import type { PatientSortBy, PatientSortOrder, TPatient } from "@/types/patient";
import { Descriptions, Modal } from "antd";
import { useState } from "react";
import { formatDate, formatEnumLabel, getPatientColumns } from "./patient-table-columns";

type PatientTableProps = {
  patients: TPatient[];
  meta: TMeta | undefined;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  sortBy: PatientSortBy;
  sortOrder: PatientSortOrder;
  changeSortBy: (field: string) => void;
  changeSortOrder: (order: string) => void;
};

export default function PatientTable(props: PatientTableProps) {
  const [selectedPatient, setSelectedPatient] = useState<TPatient>();
  const columns = getPatientColumns({
    sortBy: props.sortBy,
    sortOrder: props.sortOrder,
    onView: setSelectedPatient,
  });
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-200 sm:p-5">
      <Table<TPatient>
        data={props.patients}
        meta={props.meta}
        columns={columns}
        isLoading={props.isLoading}
        isFetching={props.isFetching}
        page={props.page}
        setPage={props.setPage}
        limit={props.limit}
        setLimit={props.setLimit}
        setSortBy={props.changeSortBy}
        setSortOrder={props.changeSortOrder}
        rowKey="_id"
      />
      <Modal
        title="Patient Details"
        open={Boolean(selectedPatient)}
        onCancel={() => setSelectedPatient(undefined)}
        footer={null}
      >
        {selectedPatient && (
          <Descriptions
            column={1}
            items={[
              { key: "name", label: "Patient Name", children: selectedPatient.name },
              { key: "phone", label: "Phone", children: selectedPatient.phone },
              { key: "age", label: "Age", children: selectedPatient.age },
              { key: "gender", label: "Gender", children: formatEnumLabel(selectedPatient.gender) },
              { key: "doctor", label: "Doctor ID", children: selectedPatient.doctorId },
              {
                key: "status",
                label: "Treatment Status",
                children: formatEnumLabel(selectedPatient.treatmentStatus),
              },
              {
                key: "lastVisit",
                label: "Last Visit",
                children: formatDate(selectedPatient.lastVisitAt),
              },
              {
                key: "followUp",
                label: "Follow Up",
                children: formatDate(selectedPatient.followUpDate),
              },
              {
                key: "createdAt",
                label: "Created At",
                children: formatDate(selectedPatient.createdAt),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
