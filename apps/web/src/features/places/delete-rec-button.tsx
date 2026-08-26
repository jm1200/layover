"use client";

import { useTransition } from "react";
import { deletePlace } from "@/features/places/actions";

export function DeleteRecButton({ placeId }: { placeId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "This rec comes off the city. The layover day stays.",
          )
        ) {
          return;
        }
        start(async () => {
          await deletePlace(placeId);
        });
      }}
      className="mt-8 text-sm text-red-700 underline disabled:opacity-60"
    >
      {pending ? "Removing…" : "Take this rec off"}
    </button>
  );
}
