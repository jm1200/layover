import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { AiStill } from "@/features/places/ai-still";
import { CityPublicHeader } from "@/features/places/city-chrome";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
} from "@/features/places/kind";
import { PlaceMap } from "@/features/places/place-map";
import { stillForPlace } from "@/features/places/rec-media";
import {
  getPlace,
  listCities,
  listDishesForPlace,
  listPlacePhotos,
  listZonesForCity,
} from "@/features/places/queries";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlace(id);
  return { title: place ? `${place.name} · Layover Intel` : "Layover Intel" };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const [dishes, cities, profile, album] = await Promise.all([
    listDishesForPlace(place.id),
    listCities(),
    getProfile(),
    listPlacePhotos(place.id),
  ]);
  const city = cities.find((c) => c.id === place.city_id);
  const zones = city ? await listZonesForCity(city.id) : [];
  const zone = place.zone_id
    ? zones.find((z) => z.id === place.zone_id)
    : null;
  const kind = recKindFromCategory(place.category);
  const still = stillForPlace(place);
  const photos: { src: string; alt: string; badge?: "ai" | null }[] = [];
  for (const p of album) {
    if (!photos.some((x) => x.src === p.image_url)) {
      photos.push({
        src: p.image_url,
        alt: place.name,
        badge: p.image_url.startsWith("/landing/") ? "ai" : null,
      });
    }
  }
  if (photos.length === 0 && still) {
    photos.push({
      src: still.src,
      alt: still.alt,
      badge: still.badge ?? null,
    });
  }
  const canEdit = Boolean(profile && profile.id === place.author_id);
  const mapQuery = [place.name, city?.name, city?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <section className="relative min-h-[56vh] text-white">
        <div className="absolute inset-0">
          {still ? (
            <AiStill
              src={still.src}
              alt={still.alt}
              sizes="100vw"
              className="object-cover"
              badge={still.badge ?? null}
            />
          ) : (
            <div className="h-full bg-zinc-950" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <CityPublicHeader loggedIn={Boolean(profile)} />
        <div className="relative z-10 flex min-h-[56vh] flex-col justify-end px-4 pb-12 pt-28">
          <div className="mx-auto w-full max-w-6xl">
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-white/70">
              {REC_KIND_LABEL[kind]}
              {city?.airport_code ? ` · ${city.airport_code}` : ""}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {place.name}
            </h1>
            <p className="mt-2 text-white/75">
              {city ? (
                <Link href={`/cities/${city.slug}`} className="underline">
                  {city.name}
                </Link>
              ) : null}
              {zone
                ? ` · ${zone.name || ZONE_LABELS[zone.type as ZoneType] || zone.type}`
                : null}
            </p>
            {canEdit ? (
              <p className="mt-3 text-sm">
                <Link
                  href={`/dashboard/places/${place.id}/edit`}
                  className="underline"
                >
                  Edit
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          {place.blurb ? (
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-700">
              {place.blurb}
            </p>
          ) : null}
          {photos.filter(
            (p) =>
              !still || p.src.split("?")[0] !== still.src.split("?")[0],
          ).length > 0 ? (
            <section className="mt-10">
              <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
                Photos
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos
                  .filter(
                    (p) =>
                      !still ||
                      p.src.split("?")[0] !== still.src.split("?")[0],
                  )
                  .map((p) => (
                  <li
                    key={p.src}
                    className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100"
                  >
                    <AiStill
                      src={p.src}
                      alt={p.alt}
                      sizes="30vw"
                      className="object-cover"
                      badge={
                        p.badge ??
                        (p.src.startsWith("/landing/") ? "ai" : null)
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {dishes.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
                Get this
              </h2>
              <ul className="mt-4 space-y-2">
                {dishes.map((d) => (
                  <li key={d.id} className="flex items-start gap-3">
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.image_url}
                        alt={d.name}
                        className="h-16 w-12 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="font-medium">{d.name}</p>
                      {d.note ? (
                        <p className="text-sm text-zinc-600">{d.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <PlaceMap query={mapQuery} />
      </main>
    </div>
  );
}
