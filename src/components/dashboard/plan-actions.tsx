"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PlanActions({
  planId,
  isCurrent,
  hasSubscription,
}: {
  planId: string;
  isCurrent: boolean;
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function go(path: string, body?: object) {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isCurrent && planId === "free") return null;

  if (isCurrent || (hasSubscription && planId !== "free")) {
    // Existing subscribers change/cancel plans via the Stripe portal.
    return (
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => go("/api/billing/portal")}
      >
        {isCurrent ? "Manage in Stripe portal" : "Switch via portal"}
      </Button>
    );
  }

  if (planId === "free") return null;

  return (
    <Button disabled={loading} onClick={() => go("/api/billing/checkout", { plan: planId })}>
      {loading ? "Redirecting…" : "Upgrade"}
    </Button>
  );
}
