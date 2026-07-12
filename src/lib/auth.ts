import { auth } from "@clerk/nextjs/server";
import type { Role } from "@/lib/db";

export type BillingOwner = { ownerType: "user"; ownerId: string };

/**
 * Resolves the current request context: authenticated user and billing owner.
 * Multi-tenancy (orgs) is part of ForgeKit Pro and is not included in the MIT core.
 */
export async function getContext() {
  const { userId } = await auth();
  if (!userId) return null;

  const owner: BillingOwner = { ownerType: "user", ownerId: userId };
  return { userId, orgId: null as string | null, orgRole: null as string | null, owner };
}

export async function requireContext() {
  const ctx = await getContext();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}

/** Personal workspaces are always "owner" in the MIT core. */
export async function getRole(): Promise<Role | null> {
  const ctx = await getContext();
  if (!ctx) return null;
  return "owner";
}

export async function requireAdmin() {
  const role = await getRole();
  if (role !== "owner") throw new ForbiddenError();
  return role;
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor() {
    super("Unauthorized");
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor() {
    super("Forbidden: admin access required");
  }
}
