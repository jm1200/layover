"use client";

import { useTransition } from "react";
import { deletePlaybook } from "@/features/playbooks/actions";

export function DeleteLayoverButton({ playbookId }: { playbookId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Take this layover off the city? Eat, Do, and Buy stay.",
          )
        ) {
          return;
        }
        start(async () => {
          await deletePlaybook(playbookId);
        });
      }}
      className="mt-8 text-sm text-red-700 underline disabled:opacity-60"
    >
      {pending ? "Removing…" : "Delete layover"}
    </button>
  );
}
