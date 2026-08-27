"use client";

/** Server action is passed in so this client module never imports `actions.ts`. */
export function SignOutButton({
  action,
  tone = "light",
  className,
}: {
  action: () => Promise<void>;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={
          className ??
          (tone === "dark"
            ? "text-sm text-white/90 hover:text-white"
            : "text-sm text-zinc-600 hover:text-zinc-900")
        }
      >
        Sign out
      </button>
    </form>
  );
}
