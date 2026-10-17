export function formatProductPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: currency || "EUR"
    }).format(amount);
  } catch {
    return `€${Number(amount).toFixed(2)}`;
  }
}
