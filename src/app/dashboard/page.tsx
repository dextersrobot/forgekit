import Link from "next/link";
import { requireContext, getRole } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/subscription";
import { getMonthlyUsage } from "@/lib/usage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OverviewPage() {
  const ctx = await requireContext();
  const [plan, usage, role] = await Promise.all([
    getCurrentPlan(ctx.owner),
    getMonthlyUsage(ctx.owner),
    getRole(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        {role && <Badge variant="outline">Role: {role}</Badge>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="text-3xl capitalize">{plan.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/billing">Manage billing</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Usage this month</CardDescription>
            <CardTitle className="text-3xl">{usage.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            of {plan.includedUsage.toLocaleString()} included units
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>Jump into the product</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/chat">Start chatting</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
