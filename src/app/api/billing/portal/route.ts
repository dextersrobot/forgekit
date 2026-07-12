import { NextResponse } from "next/server";
import { requireContext } from "@/lib/auth";
import { getOrCreateCustomer, stripe } from "@/lib/stripe";

/** POST → Stripe customer portal session URL */
export async function POST() {
  try {
    const ctx = await requireContext();

    const customer = await getOrCreateCustomer(ctx.owner);
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
