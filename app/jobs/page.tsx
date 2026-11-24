import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CompanyAvatar from "@/components/CompanyAvatar";
import { liveJobFilter } from "@/lib/job-filter";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 5;

const MODES = [
  ["REMOTE", "Remote"],
  ["HYBRID", "Hybrid"],
  ["ONSITE", "On-site"],
] as const;

const TYPES = [
  ["FULL_TIME", "Full-time"],
  ["PART_TIME", "Part-time"],
  ["CONTRACT", "Contract"],
  ["INTERNSHIP", "Internship"],
] as const;

type Params = { q?: string; mode?: string; type?: string; page?: string };
type Props = { searchParams: Promise<Params> };

// Naye filter ke sath URL banata hai (baaki filters wahi rehte hain)
function buildHref(params: Params, changes: Partial<Params>) {
  const next = { ...params, ...changes };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `/jobs?${s}` : "/jobs";
}

async function JobsContent({ searchParams }: Props) {
  const params = await searchParams;
  const { q } = params;

  // URL se aayi value sirf tab maanenge jab allowed list mein ho
  const mode = MODES.find(([v]) => v === params.mode)?.[0];
  const type = TYPES.find(([v]) => v === params.type)?.[0];

  const where = {
    ...(await liveJobFilter()), // sirf LIVE aur jo expire nahi hui
    ...(mode ? { workMode: mode } : {}),
    ...(type ? { jobType: type } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { company: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.job.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-bold transition ${
      active ? "border-accent bg-accent text-on-accent" : "border-line text-muted hover:border-accent"
    }`;

  const hasFilters = !!(q || mode || type);

  return (
    <>
      <form action="/jobs" className="mb-5 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-2 sm:flex-row sm:rounded-full">
        {mode && <input type="hidden" name="mode" value={mode} />}
        {type && <input type="hidden" name="type" value={type} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, company or skill"
          aria-label="Search jobs"
          className="h-11 w-full bg-transparent px-5 text-fg outline-none placeholder:text-faint sm:flex-1"
        />
        <button className="h-11 rounded-full bg-accent px-8 font-extrabold text-on-accent">Search</button>
      </form>

      <div className="mb-3 flex flex-wrap gap-2">
        {MODES.map(([value, label]) => (
          <Link key={value} href={buildHref(params, { mode: mode === value ? undefined : value, page: undefined })} className={chip(mode === value)}>
            {label}
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TYPES.map(([value, label]) => (
          <Link key={value} href={buildHref(params, { type: type === value ? undefined : value, page: undefined })} className={chip(type === value)}>
            {label}
          </Link>
        ))}
        {hasFilters && <Link href="/jobs" className="px-3 py-2 text-sm font-bold text-accent-ink">Clear all</Link>}
      </div>

      <p className="mb-4 text-sm text-muted">
        {total} {total === 1 ? "job" : "jobs"} found
      </p>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-lg font-semibold">No jobs found</p>
          <p className="mt-1 text-muted">Try a different keyword or remove a filter.</p>
          <Link href="/jobs" className="mt-5 inline-block font-bold text-accent-ink">Clear all filters</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent sm:p-5"
            >
              <CompanyAvatar name={job.company} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold group-hover:text-accent-ink">{job.title}</p>
                <p className="text-sm text-muted">{job.company}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{MODES.find(([v]) => v === job.workMode)?.[1]}</span>
                  <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{TYPES.find(([v]) => v === job.jobType)?.[1]}</span>
                  <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{job.location}</span>
                  {job.salary && <span className="rounded-full bg-chip px-3 py-1 text-chip-fg">{job.salary}</span>}
                  <span className="px-1 font-normal text-faint">Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
              <span className="hidden font-extrabold text-accent-ink sm:block">View →</span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={buildHref(params, { page: String(page - 1) })} className="rounded-full border border-line px-5 py-2 font-bold hover:border-accent">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={buildHref(params, { page: String(page + 1) })} className="rounded-full border border-line px-5 py-2 font-bold hover:border-accent">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}

export default function JobsPage({ searchParams }: Props) {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-bg px-4 py-10 text-fg sm:py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Find your next role</h1>
        <p className="mb-8 mt-2 text-muted">Browse approved jobs from verified employers.</p>
        <Suspense fallback={<p className="text-muted">Loading jobs...</p>}>
          <JobsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}