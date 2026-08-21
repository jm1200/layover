import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createPlace } from "@/features/places/actions";
import { parseRecKind, REC_KIND_LABEL } from "@/features/places/kind";
import { PlaceForm } from "@/features/places/place-form";
import { listAllZones, listCities } from "@/features/places/queries";

export default async function NewPlacePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const { kind: raw } = await searchParams;
  const lockKind = parseRecKind(raw);
  const title = lockKind
    ? `Add: ${REC_KIND_LABEL[lockKind]}`
    : "Add a rec";

  const [cities, zones] = await Promise.all([listCities(), listAllZones()]);

  return (
    <AppShell profile={profile} title={title}>
      <PlaceForm
        action={createPlace}
        cities={cities}
        zones={zones}
        lockKind={lockKind ?? undefined}
        submitLabel="Create"
        showItemFields
      />
    </AppShell>
  );
}
