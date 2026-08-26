import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { updatePlace } from "@/features/places/actions";
import { PlaceForm } from "@/features/places/place-form";
import { recKindFromCategory } from "@/features/places/kind";
import { DeleteRecButton } from "@/features/places/delete-rec-button";
import { PlatesEditor } from "@/features/places/plates-editor";
import { RecPhotosEditor } from "@/features/places/rec-photos-editor";
import { DISH_STILL, stillForDish, stillForPlace } from "@/features/places/rec-media";
import {
  getPlace,
  listAllZones,
  listCities,
  listDishesForPlace,
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

  const [cities, zones, dishes] = await Promise.all([
    listCities(),
    listAllZones(),
    listDishesForPlace(id),
  ]);
  const bound = updatePlace.bind(null, id);
  const kind = recKindFromCategory(place.category);
  const plates = dishes.map((d) => ({
    ...d,
    image_url: d.image_url ?? DISH_STILL[d.id]?.src ?? stillForDish(d)?.src ?? null,
  }));
  const heroSrc = stillForPlace(place)?.src ?? null;
  const extraPhotos = plates
    .map((d) => stillForDish(d))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ src: s.src, alt: s.alt }));

  return (
    <AppShell profile={profile} title="Edit rec">
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
      <RecPhotosEditor
        placeId={place.id}
        authorId={profile.id}
        heroSrc={heroSrc}
        extras={extraPhotos}
      />
      {kind === "eat" || kind === "shop" ? (
        <PlatesEditor
          placeId={place.id}
          authorId={profile.id}
          initial={plates}
          recStill={stillForPlace(place)?.src}
        />
      ) : null}
      <DeleteRecButton placeId={place.id} />
    </AppShell>
  );
}
