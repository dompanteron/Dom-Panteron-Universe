export function parseStockQuantityInput(value: unknown): number | null {
  if (value === "" || value == null) {
    return null;
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }
  return num;
}
