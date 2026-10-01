"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
        <p className="mb-4 text-gray-700">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={() => reset()}
          className="w-full rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
