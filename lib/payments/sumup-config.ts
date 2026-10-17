export function isSumUpConfigured() {
  return Boolean(process.env.SUMUP_API_KEY?.trim() && process.env.SUMUP_MERCHANT_CODE?.trim());
}

export function getSumUpCredentials() {
  const apiKey = process.env.SUMUP_API_KEY?.trim();
  const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim();
  if (!apiKey || !merchantCode) {
    return null;
  }
  return { apiKey, merchantCode };
}
