import { redirect } from "next/navigation";
import { signUp } from "@/features/auth/actions";
import { AuthDoor } from "@/features/auth/auth-door";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { safeNextPath } from "@/features/auth/paths";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const profile = await getProfile();
  // Match login: only bounce active sessions into the app (suspended stay out of dashboards)
  if (profile && profile.status !== "suspended") {
    redirect(next ?? homeForRole(profile.role));
  }

  return (
    <AuthDoor
      mode="signup"
      action={signUp}
      submitLabel="Sign up"
      next={next}
    />
  );
}
