import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { ClaimRunner } from "@/features/ai-import/claim-runner";

/** Lands here after sign-in from a guest write-up. */
export default async function ShareClaimPage() {
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login?next=/share/claim");
  if (error === "suspended" || !profile) redirect("/dashboard");

  return (
    <AppShell profile={profile} title="Share your intel">
      <ClaimRunner />
    </AppShell>
  );
}
