import Link from "next/link";
import type { AdminLineOpsSnapshot } from "@/lib/admin/line-ops-stats";
import { adminFilterHref } from "@/lib/admin/admin-list-filters";
import { LOW_STOCK_THRESHOLD } from "@/lib/shop/low-stock";

export default function AdminOpsSnapshot({ snapshot }: { snapshot: AdminLineOpsSnapshot }) {
  return (
    <div className="mt-16 space-y-12">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Operations</p>
        <h2 className="font-display mt-3 text-3xl">By product line</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Quick pulse for champagne, HOME, water, and fashion — without leaving the control room.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.lines.map((row) => (
          <div key={row.line} className="border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{row.label}</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>{row.activeProducts} active products</li>
              <li>
                {row.pendingOrders} pending{" "}
                {row.pendingOrders === 1 ? "order" : "orders"}
              </li>
              <li>{row.activeRaffles} active raffles</li>
              {row.lowStock > 0 ? (
                <li className="text-amber-300/90">{row.lowStock} low stock</li>
              ) : null}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <Link
                href={adminFilterHref("/admin/orders", { line: row.line, status: "pending" })}
                className="text-panteron-violet hover:text-white"
              >
                Orders →
              </Link>
              <Link
                href={adminFilterHref("/admin/products", { line: row.line })}
                className="text-zinc-400 hover:text-white"
              >
                Products →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {snapshot.totalPendingOrders > 0 ? (
        <div className="border border-panteron-violet/30 bg-panteron-violet/5 p-5">
          <p className="font-display text-xl text-white">
            {snapshot.totalPendingOrders} shop order
            {snapshot.totalPendingOrders === 1 ? "" : "s"} awaiting action
          </p>
          <Link
            href={adminFilterHref("/admin/orders", { status: "pending" })}
            className="mt-3 inline-block text-sm text-panteron-violet hover:text-white"
          >
            Review pending orders →
          </Link>
        </div>
      ) : null}

      {snapshot.lowStockProducts.length > 0 ? (
        <div className="border border-amber-500/25 bg-amber-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">Low stock</p>
          <p className="mt-2 text-sm text-zinc-300">
            Tracked inventory at {LOW_STOCK_THRESHOLD} units or below.
          </p>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {snapshot.lowStockProducts.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="text-white">{product.title}</p>
                  <p className="text-zinc-500">{product.product_line ?? "—"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-amber-200">{product.stock_quantity} left</span>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-panteron-violet hover:text-white"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
