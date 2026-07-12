import { Webhook } from "svix";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email/send";

/**
 * Clerk webhook: keeps users in sync.
 * Configure in Clerk Dashboard → Webhooks with events: user.*
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });

  const h = await headers();
  const payload = await req.text();
  let evt: { type: string; data: Record<string, unknown> };
  try {
    evt = new Webhook(secret).verify(payload, {
      "svix-id": h.get("svix-id")!,
      "svix-timestamp": h.get("svix-timestamp")!,
      "svix-signature": h.get("svix-signature")!,
    }) as typeof evt;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const data = evt.data as Record<string, unknown>;

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const emails = data.email_addresses as Array<{ id: string; email_address: string }>;
      const primary =
        emails?.find((e) => e.id === data.primary_email_address_id)?.email_address ??
        emails?.[0]?.email_address ??
        "";
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
      await db
        .insert(users)
        .values({
          id: data.id as string,
          email: primary,
          name,
          imageUrl: (data.image_url as string) ?? null,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { email: primary, name, imageUrl: (data.image_url as string) ?? null },
        });
      if (evt.type === "user.created" && primary) {
        await sendWelcomeEmail(primary, name ?? "there").catch(console.error);
      }
      break;
    }
    case "user.deleted":
      await db.delete(users).where(eq(users.id, data.id as string));
      break;
  }

  return new Response("OK", { status: 200 });
}
