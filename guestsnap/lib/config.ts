export const PRICE_CENTS = Number(process.env.PRICE_CENTS || 4900);

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
export const stripeConfigured = stripeSecretKey.length > 0;

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per photo
export const MAX_FILES_PER_REQUEST = 20;

export function baseUrl(reqOrigin?: string): string {
  return process.env.NEXT_PUBLIC_BASE_URL || reqOrigin || "http://localhost:3000";
}

export function priceLabel(): string {
  const dollars = PRICE_CENTS / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
