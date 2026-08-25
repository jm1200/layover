import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
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

  const errorText = authErrorMessage(params.error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600">Crew, explorers, and sponsors</p>
      </div>
      {errorText ? (
        <p
          className="mb-4 max-w-sm rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errorText}
        </p>
      ) : null}
      <AuthForm action={signIn} submitLabel="Log in" mode="login" next={next} />
      <p className="mt-6 text-sm text-zinc-600">
        No account?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
