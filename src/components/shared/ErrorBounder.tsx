"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";
import React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

type ErrorBounderComProps = {
  children: React.ReactNode;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
};

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = getErrorMessage(error);

  console.error("🚀 ~ Error Boundary:", error);

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg">
        <div className="mb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold text-red-600">Oops! Something went wrong.</h2>

          <p className="mt-2 text-sm text-gray-500">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="mb-5 max-h-40 overflow-auto rounded-lg bg-red-50 p-3 text-left">
          <p className="break-words text-sm text-red-600">{errorMessage}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/" className="w-full">
            <Button className="w-full">
              <span className="flex items-center justify-center gap-1">
                <ArrowLeftOutlined />
                Back
              </span>
            </Button>
          </Link>

          <Button type="primary" onClick={resetErrorBoundary} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBounderCom({ children }: ErrorBounderComProps) {
  const handleError = (error: unknown, info: React.ErrorInfo) => {
    console.error("🚀 ~ Error Boundary Error:", error);
    console.error("🚀 ~ Component Stack:", info.componentStack);

    if (error instanceof Error) {
      console.error("🚀 ~ Error Message:", error.message);
      console.error("🚀 ~ Error Stack:", error.stack);
    }

    // Later:
    // send error to Sentry / Better Stack / custom API
  };

  const handleReset = () => {
    console.log("🚀 ~ Resetting Error Boundary");
  };

  return (
    <ErrorBoundary FallbackComponent={Fallback} onError={handleError} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
}
