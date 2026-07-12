import { NextResponse } from "next/server";
import { requireContext } from "@/lib/auth";
import { getOrCreateCustomer, stripe } from "@/lib/stripe";
import { availablePlans } from "@/lib/plans";

/** POST { plan: "pro" } → Stripe Checkout session URL */
export async function POST(req: Request) {
  try {
    const ctx = await requireContext();

    const { plan: planId } = (await req.json()) as { plan: string };
    const plan = availablePlans().find((p) => p.id === planId && p.priceId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const customer = await getOrCreateCustomer(ctx.owner);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const session = await stripe.checkout.sessions.create({
      customer,
      mode: "subscription",
      line_items: [{ price: plan.priceId!, quantity: 1 }],
      subscription_data: {
        metadata: {
          ownerType: ctx.owner.ownerType,
          ownerId: ctx.owner.ownerId,
        },
      },
      success_url: `${appUrl}/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
