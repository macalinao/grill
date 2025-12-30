import type { TokenAmount, TokenInfo } from "./types.js";
import { address } from "@solana/kit";
import { createTokenAmount } from "./create-token-amount.js";
import { parseTokenAmount } from "./parse-token-amount.js";

/**
 * SVG icon for native SOL
 */
const NATIVE_SOL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="-84.8 150.6 101 101" style="enable-background:new -84.8 150.6 101 101;" xml:space="preserve">
    <style type="text/css">
        .st0 {
            fill: #111111;
            stroke: #000000;
            stroke-miterlimit: 10;
        }

        .st1 {
            fill: url(#SVGID_1_);
        }

        .st2 {
            fill: url(#SVGID_2_);
        }

        .st3 {
            fill: url(#SVGID_3_);
        }
    </style>
    <circle class="st0" cx="-34.3" cy="201.1" r="50" />
    <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="-7.7256" y1="255.4465" x2="-43.7526" y2="324.4527"
        gradientTransform="matrix(1 0 0 1 0 -86)">
        <stop offset="0" style="stop-color:#00FFA3" />
        <stop offset="1" style="stop-color:#DC1FFF" />
    </linearGradient>
    <path class="st1" d="M-56.3,214.6c0.4-0.4,0.9-0.6,1.5-0.6h52.1c1,0,1.4,1.1,0.8,1.8l-10.3,10.3c-0.4,0.4-0.9,0.6-1.5,0.6h-52.1
    c-1,0-1.4-1.1-0.8-1.8L-56.3,214.6z" />
    <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="-23.4772" y1="247.2229" x2="-59.5042" y2="316.2291"
        gradientTransform="matrix(1 0 0 1 0 -86)">
        <stop offset="0" style="stop-color:#00FFA3" />
        <stop offset="1" style="stop-color:#DC1FFF" />
    </linearGradient>
    <path class="st2" d="M-56.3,176.2c0.4-0.4,1-0.6,1.5-0.6h52.1c1,0,1.4,1.1,0.8,1.8l-10.3,10.3c-0.4,0.4-0.9,0.6-1.5,0.6h-52.1
    c-1,0-1.4-1.1-0.8-1.8L-56.3,176.2z" />
    <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="-15.6519" y1="251.3083" x2="-51.6789" y2="320.3146"
        gradientTransform="matrix(1 0 0 1 0 -86)">
        <stop offset="0" style="stop-color:#00FFA3" />
        <stop offset="1" style="stop-color:#DC1FFF" />
    </linearGradient>
    <path class="st3" d="M-12.3,195.3c-0.4-0.4-0.9-0.6-1.5-0.6h-52.1c-1,0-1.4,1.1-0.8,1.8l10.3,10.3c0.4,0.4,0.9,0.6,1.5,0.6h52.1
    c1,0,1.4-1.1,0.8-1.8L-12.3,195.3z" />
</svg>`;

/**
 * Data URI for native SOL icon
 */
const NATIVE_SOL_ICON_URL = `data:image/svg+xml,${encodeURIComponent(NATIVE_SOL_SVG)}`;

/**
 * TokenInfo for native SOL
 */
export const NATIVE_SOL: TokenInfo<"11111111111111111111111111111111", 9> = {
  mint: address("11111111111111111111111111111111"),
  name: "Solana",
  symbol: "SOL",
  decimals: 9,
  iconURL: NATIVE_SOL_ICON_URL,
};

/**
 * Creates a TokenAmount representing lamports (native SOL).
 *
 * @param lamports - The amount in lamports (1 SOL = 1,000,000,000 lamports)
 * @returns A TokenAmount for native SOL
 */
export function createLamports(
  lamports: bigint,
): TokenAmount<"11111111111111111111111111111111", 9> {
  return createTokenAmount(NATIVE_SOL, lamports);
}

/**
 * Parse a human-readable SOL amount string into a TokenAmount.
 *
 * @param amountHuman - The amount as a string (e.g. "1.5", "100", "0.000001") or number
 * @returns A TokenAmount for native SOL
 *
 * @example
 * ```ts
 * const amount = parseSolAmount("1.5"); // 1.5 SOL
 * const lamports = amount.amount[0]; // 1500000000n
 * ```
 */
export function parseSolAmount(
  amountHuman: string | number,
): TokenAmount<"11111111111111111111111111111111", 9> {
  return parseTokenAmount(NATIVE_SOL, amountHuman);
}
