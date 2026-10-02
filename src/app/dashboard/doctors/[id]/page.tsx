"use client";

import PatientManagement from "@/components/patient/patient-management";
import DoctorProfileCard from "@/components/doctor/doctor-profile-card";
import { useGetDoctorByIdQuery } from "@/redux/features/doctor/doctorApi";
import { apiErrorMessage } from "@/utils/api-error";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Result, Skeleton } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentData: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDoctorByIdQuery(id);
  const notFound =
    (error && "status" in error && error.status === 404) ||
    response?.statusCode === 404 ||
    (!error && !isFetching && response?.success && !response.data);
  return (
    <div className="doctor-details-page min-w-0 p-2 sm:p-6">
      <style jsx global>{`
        .dashboard-content:has(.doctor-details-page) {
          overflow: clip !important;
        }
      `}</style>
      <header className="mb-6">
        <Link
          href="/dashboard/doctors"
          className="inline-flex items-center gap-2 text-sm text-orange-600"
        >
          <ArrowLeftOutlined /> Doctors
        </Link>
      </header>
      <div className="grid min-w-0 gap-6">
        <div className="min-w-0">
          {isLoading || (isFetching && !response) ? (
            <div
              aria-label="Loading doctor profile"
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <Skeleton.Avatar active size={80} />
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : notFound ? (
            <Result
              status="404"
              title="Doctor not found"
              subTitle="The doctor may have been removed or is unavailable."
              extra={<Link href="/dashboard/doctors">Back to Doctors</Link>}
            />
          ) : error || !response?.success ? (
            <Alert
              type="error"
              showIcon
              message={apiErrorMessage(
                error,
                response?.message || "Unable to load doctor profile.",
              )}
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : response.data ? (
            <DoctorProfileCard doctor={response.data} />
          ) : null}
        </div>
        {response?.success && response.data && !notFound && (
          <PatientManagement key={id} doctorId={id} />
        )}
      </div>
    </div>
  );
}
