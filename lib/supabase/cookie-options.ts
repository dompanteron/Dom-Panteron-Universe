const isDev = process.env.NODE_ENV === "development";

export const supabaseCookieOptions = isDev
  ? { secure: false, sameSite: "lax" as const, path: "/" }
  : { sameSite: "lax" as const, path: "/" };
