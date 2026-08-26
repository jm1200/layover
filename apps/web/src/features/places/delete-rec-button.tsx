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
            "Take this rec off the city? Plates go with it. Layovers that linked it keep the day.",
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
      {pending ? "Removing…" : "Delete rec"}
    </button>
  );
}
