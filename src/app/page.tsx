import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  ["Auth", "Clerk authentication with sign-in, sign-up, and user profiles."],
  ["AI chat", "Streaming chat via the Vercel AI SDK — swap OpenAI and Anthropic with one env var."],
  ["Stripe billing", "Flat-rate Pro plan, customer portal, and webhooks."],
  ["Postgres + Drizzle", "Typed schema and migrations ready for your product data."],
  ["Usage limits", "Monthly caps on free/pro plans with threshold email alerts."],
  ["Resend email", "Welcome and subscription notification emails out of the box."],
] as const;

export default async function LandingPage() {
  const { userId } = await auth();
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Badge variant="secondary">Next.js 15 · Clerk · Stripe · Drizzle</Badge>
      <h1 className="text-5xl font-bold tracking-tight">ForgeKit</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        The MIT open-source starter for AI SaaS. Auth, streaming chat, and flat-rate
        billing — wired together so you can ship your product, not plumbing.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            {userId ? "Open dashboard" : "Get started"}
          </Link>
        </Button>
        {!userId && (
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
      </div>
      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([title, desc]) => (
          <div key={title} className="rounded-xl border p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
