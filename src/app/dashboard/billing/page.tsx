import { requireContext } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/subscription";
import { availablePlans } from "@/lib/plans";
import { PlanActions } from "@/components/dashboard/plan-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BillingPage() {
  const ctx = await requireContext();
  const sub = await getActiveSubscription(ctx.owner);
  const currentPlan = sub?.plan ?? "free";
  const plans = availablePlans();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
          <CardDescription>
            {sub
              ? `Status: ${sub.status}${
                  sub.currentPeriodEnd
                    ? ` · renews ${sub.currentPeriodEnd.toLocaleDateString()}`
                    : ""
                }${sub.cancelAtPeriodEnd ? " · cancels at period end" : ""}`
              : "You're on the free plan."}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === currentPlan ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.id === currentPlan && <Badge>Current</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanActions
                planId={plan.id}
                isCurrent={plan.id === currentPlan}
                hasSubscription={!!sub}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
