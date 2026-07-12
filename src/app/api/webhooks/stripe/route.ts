import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db, subscriptions, users } from "@/lib/db";
import { planFromPriceId } from "@/lib/plans";
import { sendSubscriptionChangedEmail } from "@/lib/email/send";

/**
 * Stripe webhook. Subscribe to:
 * checkout.session.completed, customer.subscription.created,
 * customer.subscription.updated, customer.subscription.deleted,
 * invoice.payment_failed
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await upsertSubscription(sub, { notify: true });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscription(event.data.object, {
        notify: event.type === "customer.subscription.updated",
      });
      break;

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await db
        .update(subscriptions)
        .set({ status: "canceled", plan: "free", updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id));
      await notifyOwner(sub, "Your subscription has been canceled.");
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const email = invoice.customer_email;
      if (email) {
        await sendSubscriptionChangedEmail(
          email,
          "A payment failed. Please update your payment method to avoid interruption.",
        ).catch(console.error);
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}

async function upsertSubscription(
  sub: Stripe.Subscription,
  opts: { notify: boolean },
) {
  const ownerType = sub.metadata.ownerType as "user" | undefined;
  const ownerId = sub.metadata.ownerId;
  if (ownerType !== "user" || !ownerId) {
    console.warn(`Subscription ${sub.id} missing owner metadata; skipping`);
    return;
  }

  const priceId = sub.items.data[0]?.price.id ?? "";
  const plan = planFromPriceId(priceId);

  await db
    .insert(subscriptions)
    .values({
      id: sub.id,
      ownerType,
      ownerId,
      plan,
      status: sub.status,
      priceId,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        plan,
        status: sub.status,
        priceId,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  if (opts.notify) {
    await notifyOwner(sub, `Your plan is now "${plan}" (status: ${sub.status}).`);
  }
}

async function notifyOwner(sub: Stripe.Subscription, message: string) {
  const ownerId = sub.metadata.ownerId;
  if (!ownerId) return;

  const [u] = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
  if (u?.email) {
    await sendSubscriptionChangedEmail(u.email, message).catch(console.error);
  }
}
