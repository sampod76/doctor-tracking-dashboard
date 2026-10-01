"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">
          <section className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[660px] lg:px-14 lg:py-12">
            <div className="w-full max-w-md">
              <Link href="/" className="flex justify-center" aria-label="Doctor Tracker Home">
                <Image
                  src="/auth-logo.png"
                  width={384}
                  height={150}
                  alt="Doctor Tracker"
                  priority
                  className="h-auto w-32 object-contain sm:w-36 lg:w-40"
                />
              </Link>

              {children}
            </div>
          </section>

          <section className="relative hidden min-h-[660px] overflow-hidden lg:block">
            <Image
              src="/auth-banner.jpg"
              alt="Doctor Tracker healthcare management"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-orange-900/10" />

            <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10">
              <div className="rounded-2xl border border-white/30 bg-white/20 p-5 shadow-lg backdrop-blur-md">
                <h2 className="text-xl font-semibold text-slate-900 xl:text-2xl">
                  Manage healthcare smarter
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-700">
                  Keep doctors, patients and healthcare information organized from one simple
                  dashboard.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
