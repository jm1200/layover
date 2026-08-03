import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createPlace } from "@/features/places/actions";
import { PlaceForm } from "@/features/places/place-form";
import { listAllZones, listCities } from "@/features/places/queries";

export default async function NewPlacePage() {
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const [cities, zones] = await Promise.all([listCities(), listAllZones()]);

  return (
    <AppShell profile={profile} title="Add a place">
      <PlaceForm
        action={createPlace}
        cities={cities}
        zones={zones}
        submitLabel="Create place"
        showDishFields
      />
    </AppShell>
  );
}
