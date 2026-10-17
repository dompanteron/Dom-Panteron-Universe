import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type MemberRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  auth_id: string | null;
};

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  return user;
}

export async function ensureCurrentMember(fullName?: string | null) {
  const user = await getCurrentUser();
  if (!user?.email) {
    return { user: null, member: null, error: "Not authenticated" as const };
  }

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("members")
    .select("id, email, full_name, role, auth_id")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (existingError) {
    return { user, member: null, error: existingError.message };
  }

  const resolvedName =
    fullName?.trim() ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null);

  if (existing) {
    if (resolvedName && resolvedName !== existing.full_name) {
      const { data, error } = await admin
        .from("members")
        .update({ full_name: resolvedName, email: user.email })
        .eq("auth_id", user.id)
        .select("id, email, full_name, role, auth_id")
        .single();

      if (error) {
        return { user, member: null, error: error.message };
      }

      return { user, member: data as MemberRow, error: null };
    }

    return { user, member: existing as MemberRow, error: null };
  }

  const { data, error } = await admin
    .from("members")
    .insert({
      auth_id: user.id,
      email: user.email,
      full_name: resolvedName
    })
    .select("id, email, full_name, role, auth_id")
    .single();

  if (error) {
    return { user, member: null, error: error.message };
  }

  return { user, member: data as MemberRow, error: null };
}

export async function requireMember() {
  const { user, member } = await ensureCurrentMember();

  if (!user || !member) {
    redirect("/join");
  }

  return { user, member };
}

export async function requireAdmin() {
  const { user, member } = await ensureCurrentMember();

  if (!user || member?.role !== "admin") {
    redirect("/");
  }

  return { user, member };
}
