import { requireAdmin } from "@/lib/members";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-[70vh] bg-panteron-black text-white">
      {children}
    </div>
  );
}
