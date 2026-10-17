import type { Metadata } from "next";
import MemberRoleSelect from "@/components/MemberRoleSelect";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin members | Dom Panteron Universe"
};

type ListedMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

function formatJoined(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function AdminMembersPage() {
  const { member: current } = await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("members")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const members = (data ?? []) as ListedMember[];
  const adminCount = members.filter((member) => member.role === "admin").length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">
        Admin
      </p>
      <h1 className="font-display text-4xl font-semibold">Members</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Everyone who has joined the universe. Change a role to grant or remove
        admin access.
      </p>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : members.length === 0 ? (
        <p className="mt-10 text-zinc-400">No members yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[40rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Name</th>
                <th className="py-4 pr-4 font-normal">Email</th>
                <th className="py-4 pr-4 font-normal">Role</th>
                <th className="py-4 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {members.map((member) => {
                const isYou = member.id === current.id;
                return (
                  <tr key={member.id} className="text-sm text-zinc-300">
                    <td className="py-4 pr-4">
                      <span className="text-white">
                        {member.full_name || "—"}
                      </span>
                      {isYou ? (
                        <span className="ml-2 text-xs uppercase tracking-[0.18em] text-panteron-violet">
                          you
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">{member.email}</td>
                    <td className="py-4 pr-4">
                      <MemberRoleSelect
                        memberId={member.id}
                        role={member.role}
                        locked={member.role === "admin" && adminCount <= 1}
                      />
                    </td>
                    <td className="py-4 text-zinc-500">
                      {formatJoined(member.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
