"use client";

/** Server action is passed in so this client module never imports `actions.ts`. */
export function SignOutButton({
  action,
  tone = "light",
}: {
  action: () => Promise<void>;
  tone?: "dark" | "light";
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={
          tone === "dark"
            ? "text-sm text-white/90 hover:text-white"
            : "text-sm text-zinc-600 hover:text-zinc-900"
        }
      >
        Sign out
      </button>
    </form>
  );
}
