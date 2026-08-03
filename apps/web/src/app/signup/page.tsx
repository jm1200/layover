import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { getProfile, homeForRole } from "@/features/auth/get-profile";

export default async function SignupPage() {
  const profile = await getProfile();
  // Match login: only bounce active sessions into the app (suspended stay out of dashboards)
  if (profile && profile.status !== "suspended") {
    redirect(homeForRole(profile.role));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Default role is user. Sponsors and admin are set separately.
        </p>
      </div>
      <AuthForm action={signUp} submitLabel="Sign up" mode="signup" />
      <p className="mt-6 text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
