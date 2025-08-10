/**
 * Helper function to format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Convert fractional part to string with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");

  // Remove trailing zeros
  const trimmedFractional = fractionalStr.replace(/0+$/, "");

  if (trimmedFractional === "") {
    return wholePart.toString();
  }

  return `${String(wholePart)}.${trimmedFractional}`;
}
