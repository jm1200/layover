import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { GoogleButton } from "@/features/auth/google-button";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="mb-10 max-w-sm text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Come in.
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Describe the layover. We’ll fill it in.
        </p>
      </div>
      {errorText ? (
        <p
          className="mb-4 max-w-sm rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {errorText}
        </p>
      ) : null}
      <div className="w-full max-w-sm">
        <GoogleButton next={next} />
        <p className="my-4 text-center text-xs uppercase tracking-wider text-white/40">
          use email instead
        </p>
        <div className="rounded-2xl bg-white p-5 text-zinc-900">
          <AuthForm action={signIn} submitLabel="Log in" mode="login" next={next} />
        </div>
      </div>
      <p className="mt-8 text-sm text-white/60">
        No account?{" "}
        <Link href="/signup" className="font-medium text-white underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
