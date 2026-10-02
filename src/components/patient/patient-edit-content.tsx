"use client";
import { Alert, Button, Skeleton } from "antd";
import { useGetPatientByIdQuery } from "@/redux/features/patient/patientApi";
import { apiErrorMessage } from "@/utils/api-error";
import PatientForm from "./patient-form";
export default function PatientEditContent({
  id,
  onLoadingChange,
}: {
  id: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const { currentData, isLoading, error, refetch } = useGetPatientByIdQuery(id);
  if (currentData?.success && currentData.data)
    return (
      <PatientForm
        patient={currentData.data}
        doctorId={currentData.data.doctor?._id}
        onLoadingChange={onLoadingChange}
      />
    );
  return (
    <>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <Alert
          type="error"
          showIcon
          message={apiErrorMessage(error, currentData?.message || "Unable to load patient.")}
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      )}
    </>
  );
}
