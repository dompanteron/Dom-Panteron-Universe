const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const optionalButRecommended = [
  "ADMIN_EMAIL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL"
];

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");
const missingRecommended = optionalButRecommended.filter(
  (key) => !process.env[key] || String(process.env[key]).trim() === ""
);

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  missing.forEach((key) => console.error(`- ${key}`));
  const typoKeys = Object.keys(process.env).filter(
    (key) => key.includes("SUPABASE_URL") && key !== "NEXT_PUBLIC_SUPABASE_URL"
  );
  if (typoKeys.length > 0) {
    console.error("Possible typo in .env (rename to NEXT_PUBLIC_SUPABASE_URL):");
    typoKeys.forEach((key) => console.error(`- ${key}`));
  }
  process.exit(1);
}

console.log("Environment check passed for required variables.");

if (missingRecommended.length > 0) {
  console.warn("Missing recommended environment variables:");
  missingRecommended.forEach((key) => console.warn(`- ${key}`));
}
