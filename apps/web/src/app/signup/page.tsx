import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { GoogleButton } from "@/features/auth/google-button";
import { getProfile, homeForRole } from "@/features/auth/get-profile";

export default async function SignupPage() {
  const profile = await getProfile();
  // Match login: only bounce active sessions into the app (suspended stay out of dashboards)
  if (profile && profile.status !== "suspended") {
    redirect(homeForRole(profile.role));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="mb-10 max-w-sm text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          First time?
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Describe the layover. We’ll fill it in.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <GoogleButton />
        <p className="my-4 text-center text-xs uppercase tracking-wider text-white/40">
          use email instead
        </p>
        <div className="rounded-2xl bg-white p-5 text-zinc-900">
          <AuthForm action={signUp} submitLabel="Create account" mode="signup" />
        </div>
      </div>
      <p className="mt-8 text-sm text-white/60">
        Already in?{" "}
        <Link href="/login" className="font-medium text-white underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
