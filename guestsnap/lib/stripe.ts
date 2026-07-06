import Stripe from "stripe";
import { stripeSecretKey } from "./config";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(stripeSecretKey);
  return client;
}
