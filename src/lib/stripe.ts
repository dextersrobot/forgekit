import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import type { BillingOwner } from "@/lib/auth";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/** Get or lazily create a Stripe customer for the billing owner (user). */
export async function getOrCreateCustomer(owner: BillingOwner): Promise<string> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, owner.ownerId))
    .limit(1);
  if (!user) throw new Error("User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { ownerType: "user", ownerId: user.id },
  });
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));
  return customer.id;
}
