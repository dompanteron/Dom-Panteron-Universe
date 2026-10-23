import Link from "next/link";
import {
  adminFilterHref,
  adminOrderStatusFilterOptions,
  type AdminLineFilter,
  type AdminOrderStatusFilter
} from "@/lib/admin/admin-list-filters";

const pillClass = (active: boolean) =>
  `border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
    active
      ? "border-panteron-violet text-panteron-violet"
      : "border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
  }`;

export type LineFilterOption = { value: AdminLineFilter; label: string };

export function AdminLineFilterBar({
  basePath,
  currentLine,
  currentStatus,
  lineOptions
}: {
  basePath: string;
  currentLine: AdminLineFilter;
  currentStatus?: AdminOrderStatusFilter;
  lineOptions: LineFilterOption[];
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {lineOptions.map((option) => (
        <Link
          key={option.value}
          href={adminFilterHref(basePath, {
            line: option.value,
            status: currentStatus
          })}
          className={pillClass(currentLine === option.value)}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminOrderFiltersBar({
  basePath,
  currentLine,
  currentStatus,
  lineOptions
}: {
  basePath: string;
  currentLine: AdminLineFilter;
  currentStatus: AdminOrderStatusFilter;
  lineOptions: LineFilterOption[];
}) {
  return (
    <div className="mt-8 space-y-4">
      <AdminLineFilterBar
        basePath={basePath}
        currentLine={currentLine}
        currentStatus={currentStatus}
        lineOptions={lineOptions}
      />
      <div className="flex flex-wrap gap-2">
        {adminOrderStatusFilterOptions.map((option) => (
          <Link
            key={option.value}
            href={adminFilterHref(basePath, {
              line: currentLine,
              status: option.value
            })}
            className={pillClass(currentStatus === option.value)}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
