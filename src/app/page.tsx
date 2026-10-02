import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Doctor Tracker | Doctor & Patient Management",
  description:
    "Keep doctors, patients, treatments and follow-up information organized in one calm, simple place.",
};

export default function Page() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#f7fcfd] bg-[radial-gradient(ellipse_at_top_left,_#c8f0fc_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_right,_#c7f9eb_0%,_transparent_60%)] px-6 py-16 font-sans">
      <section aria-labelledby="landing-heading" className="w-full max-w-5xl text-center">
        <div className="mb-10 flex items-center justify-center gap-2.5 text-lg font-semibold text-[#0084ad] sm:mb-11">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#0084ad] text-xl font-medium text-white"
          >
            +
          </span>
          <span>Doctor Tracker</span>
        </div>

        <h1
          id="landing-heading"
          className="m-0 text-4xl font-bold leading-[1.08] tracking-tight text-[#102b39] sm:text-5xl lg:text-6xl"
        >
          <span className="block">Doctor &amp; Patient</span>
          <span className="block">Management Made Simple</span>
        </h1>

        <p className="mx-auto mb-0 mt-6 max-w-xl text-base leading-7 text-[#56758f] sm:text-lg">
          Keep doctors, patients, treatments and follow-up information organized in one calm, simple
          place.
        </p>

        <Link
          href="/signin"
          className="mt-10 inline-flex min-h-[60px] items-center justify-center rounded-full bg-[#0084ad] px-10 text-lg font-semibold text-white shadow-[0_6px_12px_rgba(16,43,57,0.12)] transition-colors hover:bg-[#006f94] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0084ad]"
        >
          Login
        </Link>

        <p className="mb-0 mt-5 text-sm leading-6 text-[#56758f]">
          Registration &middot; Invitation only
        </p>
      </section>
    </main>
  );
}
