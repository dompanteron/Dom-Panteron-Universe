export function memberDisplayInitials(fullName: string | null | undefined, email: string) {
  const name = fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase();
}

/** Public-friendly label, e.g. "Sam P." */
export function memberPublicDisplayName(fullName: string | null | undefined, email: string) {
  const name = fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0]!;
      const lastInitial = parts[parts.length - 1]![0]?.toUpperCase() ?? "";
      return `${first} ${lastInitial}.`;
    }
    return name;
  }

  const local = email.split("@")[0] ?? "Member";
  return local;
}
