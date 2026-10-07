"use client";

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePublicSchools } from "@/features/schools/hooks";

const PAGE_SIZE = 10;

export default function SchoolsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } =
    usePublicSchools({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
    });

  const schools = data?.schools ?? [];
  const meta = data?.meta;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#061842] py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#00d2c4]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="school-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-sm font-semibold text-[#5ff5eb]">
              Find Your School
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Find the Right
              <span className="block text-[#00d2c4]">
                School for You
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Explore schools, check admission availability, and start your
              admission application online.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search schools..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white px-12 text-sm text-[#061842] shadow-xl outline-none placeholder:text-slate-400 focus:border-[#00d2c4] focus:ring-4 focus:ring-[#00d2c4]/10"
                />
              </div>

              {isFetching && !isLoading && (
                <p className="mt-2 text-left text-xs text-white/50">
                  Searching...
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* School List */}
      <section className="py-14 sm:py-20">
        <div className="school-container">
          {/* Header */}
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#008f87]">
                Available Schools
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#061842] sm:text-3xl">
                Explore Schools
              </h2>
            </div>

            {!isLoading && !isError && (
              <p className="text-sm text-slate-500">
                {meta?.total ?? 0} school
                {(meta?.total ?? 0) !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-[#00a99d]" />
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="mx-auto flex min-h-[300px] max-w-xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#061842]">
                Failed to load schools
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Something went wrong while loading the schools.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="school-btn school-btn-primary mt-5"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && schools.length === 0 && (
            <div className="mx-auto flex min-h-[300px] max-w-xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Search className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-bold text-[#061842]">
                {searchInput.trim()
                  ? "No schools found"
                  : "No schools available"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {searchInput.trim()
                  ? "Try searching with a different school name."
                  : "There are no active schools available right now."}
              </p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && schools.length > 0 && (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr className="text-left">
                        <th className="px-6 py-4 font-semibold text-slate-500">
                          School
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-500">
                          Location
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-500">
                          School Code
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-500">
                          Admission
                        </th>

                        <th className="px-6 py-4 text-right font-semibold text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {schools.map((school) => (
                        <tr
                          key={school.id}
                          className="transition hover:bg-slate-50/80"
                        >
                          {/* School */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {school.logo ? (
                                <img
                                  src={school.logo}
                                  alt={`${school.name} logo`}
                                  className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-contain"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#061842] text-base font-bold text-[#00d2c4]">
                                  {school.name.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="font-semibold text-[#061842]">
                                  {school.name}
                                </p>

                                {school.email && (
                                  <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                                    {school.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-6 py-4">
                            {school.address ? (
                              <div className="flex max-w-[220px] items-start gap-2 text-slate-500">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00a99d]" />

                                <span className="line-clamp-2">
                                  {school.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Code */}
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#061842]">
                              {school.code}
                            </span>
                          </td>

                          {/* Admission */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Open
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/schools/${school.id}`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#061842] transition hover:bg-slate-50"
                              >
                                View
                              </Link>

                              <Link
                                href={`/admissions?schoolId=${school.id}`}
                                className="group/apply inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#00d2c4] px-3 text-xs font-bold text-[#061842] transition hover:bg-[#00bdb1]"
                              >
                                Apply

                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/apply:translate-x-0.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <div className="text-sm text-slate-500">
                    Page {meta.page} of {meta.totalPages}

                    <span className="hidden sm:inline">
                      {" "}
                      · {meta.total} schools
                    </span>

                    {isFetching && (
                      <span className="ml-2 text-[#008f87]">
                        Updating...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || isFetching}
                      onClick={() => setPage((current) => current - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#061842] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        page >= meta.totalPages || isFetching
                      }
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-lg bg-[#061842] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0b285f] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}