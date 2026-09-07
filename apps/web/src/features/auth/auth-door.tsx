import Link from "next/link";
import type { AuthFormState } from "@/features/auth/types";
import { AuthForm } from "@/features/auth/auth-form";
import { EmailReveal } from "@/features/auth/email-reveal";
import { GoogleButton } from "@/features/auth/google-button";

export function AuthDoor({
  mode,
  action,
  submitLabel,
  next,
  errorText,
}: {
  mode: "login" | "signup";
  action: (
    prev: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  submitLabel: string;
  next?: string | null;
  errorText?: string | null;
}) {
  const login = mode === "login";
  const signupHref = next
    ? `/signup?next=${encodeURIComponent(next)}`
    : "/signup";
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="mb-10 max-w-sm text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.28em] text-white/55">
          {login ? "Log in" : "Sign up"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {login ? "In from a trip?" : "First time?"}
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
      <div className="flex w-full max-w-sm flex-col gap-5">
        <GoogleButton next={next} />
        <EmailReveal>
          <AuthForm
            action={action}
            submitLabel={submitLabel}
            mode={mode}
            next={next}
          />
        </EmailReveal>
      </div>
      <p className="mt-8 text-sm text-white/60">
        {login ? (
          <>
            No account?{" "}
            <Link href={signupHref} className="font-medium text-white underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already in?{" "}
            <Link href={loginHref} className="font-medium text-white underline">
              Log in
            </Link>
          </>
        )}
      </p>
      {login ? (
        <p className="mt-4 text-xs text-white/40">
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </p>
      ) : null}
    </div>
  );
}
