import { redirect } from "next/navigation";
import { signIn } from "@/features/auth/actions";
import { AuthDoor } from "@/features/auth/auth-door";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { authErrorMessage, safeNextPath } from "@/features/auth/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const profile = await getProfile();
  if (profile && profile.status !== "suspended") {
    redirect(next ?? homeForRole(profile.role));
  }

  return (
    <AuthDoor
      mode="login"
      action={signIn}
      submitLabel="Log in"
      next={next}
      errorText={authErrorMessage(params.error)}
    />
  );
}
