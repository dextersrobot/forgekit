import { and, eq, gte, sql } from "drizzle-orm";
import { db, usageAlerts, usageEvents, users } from "@/lib/db";
import type { BillingOwner } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/subscription";
import { sendUsageThresholdEmail } from "@/lib/email/send";

/** Records a usage event and fires the threshold alert email (once/month). */
export async function recordUsage(
  owner: BillingOwner,
  userId: string,
  kind: string,
  amount: number,
) {
  if (amount <= 0) return;

  await db.insert(usageEvents).values({
    ownerType: owner.ownerType,
    ownerId: owner.ownerId,
    userId,
    kind,
    amount,
  });

  await checkUsageThreshold(owner).catch(console.error);
}

/** Sum of usage for the current calendar month. */
export async function getMonthlyUsage(owner: BillingOwner): Promise<number> {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${usageEvents.amount}), 0)::int` })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.ownerType, owner.ownerType),
        eq(usageEvents.ownerId, owner.ownerId),
        gte(usageEvents.createdAt, monthStart),
      ),
    );
  return row?.total ?? 0;
}

/** Enforced before each chat request: free/pro plans have monthly caps. */
export async function assertWithinLimits(owner: BillingOwner) {
  const plan = await getCurrentPlan(owner);
  if (plan.metered) return;
  const used = await getMonthlyUsage(owner);
  if (used >= plan.includedUsage) {
    throw Object.assign(
      new Error(
        `Monthly usage limit reached (${plan.includedUsage.toLocaleString()} units on the ${plan.name} plan). Upgrade to continue.`,
      ),
      { status: 429 },
    );
  }
}

async function checkUsageThreshold(owner: BillingOwner) {
  const threshold = Number(process.env.USAGE_ALERT_THRESHOLD ?? 0);
  if (!threshold) return;

  const used = await getMonthlyUsage(owner);
  if (used < threshold) return;

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const inserted = await db
    .insert(usageAlerts)
    .values({ ownerType: owner.ownerType, ownerId: owner.ownerId, month })
    .onConflictDoNothing()
    .returning({ id: usageAlerts.id });
  if (inserted.length === 0) return; // already alerted this month

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, owner.ownerId))
    .limit(1);
  const email = user?.email;
  if (email) {
    await sendUsageThresholdEmail(email, used, threshold).catch(console.error);
  }
}
