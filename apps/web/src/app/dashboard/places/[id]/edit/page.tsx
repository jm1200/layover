import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { updatePlace } from "@/features/places/actions";
import { PlaceForm } from "@/features/places/place-form";
import {
  getPlace,
  listAllZones,
  listCities,
} from "@/features/places/queries";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const place = await getPlace(id);
  if (!place) notFound();
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    redirect(`/places/${id}`);
  }

  const [cities, zones] = await Promise.all([listCities(), listAllZones()]);
  const bound = updatePlace.bind(null, id);

  return (
    <AppShell profile={profile} title="Edit place">
      <PlaceForm
        action={bound}
        cities={cities}
        zones={zones}
        defaults={{
          city_id: place.city_id,
          zone_id: place.zone_id,
          name: place.name,
          blurb: place.blurb,
          category: place.category,
          status: place.status,
        }}
        submitLabel="Save"
        allowHidden={profile.role === "admin"}
      />
    </AppShell>
  );
}
