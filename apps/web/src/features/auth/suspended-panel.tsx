import { signOut } from "@/features/auth/actions";
import { SignOutButton } from "@/features/auth/sign-out-button";

export function SuspendedPanel({
  detail = "Contact an admin if this is a mistake.",
}: {
  detail?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Account suspended</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">{detail}</p>
      </div>
      <SignOutButton action={signOut} />
    </div>
  );
}
