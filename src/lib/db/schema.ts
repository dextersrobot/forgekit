import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);
export const ownerTypeEnum = pgEnum("owner_type", ["user"]);

/** Synced from Clerk via webhook. `id` is the Clerk user id. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Mirrors Stripe subscriptions. Owner is the authenticated user. */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(), // Stripe subscription id
    ownerType: ownerTypeEnum("owner_type").notNull(),
    ownerId: text("owner_id").notNull(), // Clerk user id
    plan: planEnum("plan").notNull().default("free"),
    status: text("status").notNull(), // active | trialing | past_due | canceled | ...
    priceId: text("price_id").notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("subscriptions_owner_idx").on(t.ownerType, t.ownerId)],
);

/** Raw usage events for monthly free/pro caps. */
export const usageEvents = pgTable(
  "usage_events",
  {
    id: serial("id").primaryKey(),
    ownerType: ownerTypeEnum("owner_type").notNull(),
    ownerId: text("owner_id").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    kind: text("kind").notNull(), // chat_tokens | ...
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("usage_events_owner_idx").on(t.ownerType, t.ownerId, t.createdAt)],
);

/** Dedupe table so the usage-threshold email is sent once per owner per month. */
export const usageAlerts = pgTable(
  "usage_alerts",
  {
    id: serial("id").primaryKey(),
    ownerType: ownerTypeEnum("owner_type").notNull(),
    ownerId: text("owner_id").notNull(),
    month: text("month").notNull(), // YYYY-MM
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("usage_alerts_owner_month_idx").on(t.ownerType, t.ownerId, t.month)],
);

export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Role = "owner";
