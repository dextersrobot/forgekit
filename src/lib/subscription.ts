import { and, desc, eq, inArray } from "drizzle-orm";
import { db, subscriptions, type Subscription } from "@/lib/db";
import type { BillingOwner } from "@/lib/auth";
import { getPlan, type Plan } from "@/lib/plans";

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

export async function getActiveSubscription(
  owner: BillingOwner,
): Promise<Subscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.ownerType, owner.ownerType),
        eq(subscriptions.ownerId, owner.ownerId),
        inArray(subscriptions.status, ACTIVE_STATUSES),
      ),
    )
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  return sub ?? null;
}

export async function getCurrentPlan(owner: BillingOwner): Promise<Plan> {
  const sub = await getActiveSubscription(owner);
  return getPlan(sub?.plan ?? "free");
}
