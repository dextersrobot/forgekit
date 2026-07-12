export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceId: string | null;
  metered: boolean;
  /** Included usage units per month (soft limit for free plan). */
  includedUsage: number;
}

const ALL_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started — basic chat with monthly limits.",
    priceId: null,
    metered: false,
    includedUsage: 10_000,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Flat monthly rate, generous limits.",
    priceId: process.env.STRIPE_PRICE_ID_PRO ?? null,
    metered: false,
    includedUsage: 1_000_000,
  },
];

export function availablePlans(): Plan[] {
  return ALL_PLANS;
}

export function getPlan(id: PlanId): Plan {
  const plan = ALL_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function planFromPriceId(priceId: string): PlanId {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return "free";
}
