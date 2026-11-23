import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Cta() {
  return (
    <section className="bg-[#061842] py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Ready to Digitize Your Madrasa or School?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
          Register your institution today to unlock complete academic,
          financial, attendance, examination, and Hefz &amp; Najera management.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/school-register"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#00d2c4] px-8 text-sm font-bold text-[#061842] transition hover:bg-[#00bcaf]"
          >
            Register Your Institution
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Existing User Login
          </Link>
        </div>
      </div>
    </section>
  );
}
