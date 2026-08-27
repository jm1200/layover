import { createClient } from "@/lib/supabase/server";
import type { AccountStatus, Profile, UserRole } from "@/features/auth/types";

const ROLES: UserRole[] = ["user", "sponsor", "admin"];
const STATUSES: AccountStatus[] = ["active", "suspended"];

/** Normalize DB/enum values; unknown role fails closed to least privilege. */
export function asRole(value: unknown): UserRole {
  return ROLES.includes(value as UserRole) ? (value as UserRole) : "user";
}

/** Unknown status fails closed to suspended. */
export function asStatus(value: unknown): AccountStatus {
  return STATUSES.includes(value as AccountStatus)
    ? (value as AccountStatus)
    : "suspended";
}

/**
 * Returns profile for the current session user.
 * - No session → null
 * - Query error → null (fail closed; do not invent active)
 * - Missing row (trigger lag) → temporary user/active only when error is absent
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, status, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("[getProfile] profiles read failed:", error.message);
    return null;
  }

  if (!data) {
    // Trigger lag only — never use this path for DB errors
    return {
      id: user.id,
      email: user.email ?? null,
      role: "user",
      status: "active",
      display_name: null,
    };
  }

  return {
    id: data.id as string,
    email: (data.email as string | null) ?? user.email ?? null,
    role: asRole(data.role),
    status: asStatus(data.status),
    display_name: (data.display_name as string | null) ?? null,
  };
}

export async function requireUser() {
  const profile = await getProfile();
  if (!profile) {
    return {
      profile: null as Profile | null,
      error: "unauthenticated" as const,
    };
  }
  if (profile.status === "suspended") {
    return { profile, error: "suspended" as const };
  }
  return { profile, error: null };
}

export async function requireRole(allowed: UserRole[]) {
  const result = await requireUser();
  if (result.error) return result;
  if (!allowed.includes(result.profile!.role)) {
    return { profile: result.profile, error: "forbidden" as const };
  }
  return result;
}

/** Post-login home. Everyone — including admin — lands on their recs. */
export function homeForRole(_role?: UserRole): string {
  return "/dashboard";
}
