import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { CityHero } from "@/features/places/city-chrome";
import { CityCatalog, type CatalogPlace } from "@/features/places/city-catalog";
import {
  recKindFromCategory,
  type RecKind,
} from "@/features/places/kind";
import {
  CITY_FEEL,
  heroForCity,
  stillForPlace,
  PREVIEW_COUNT,
} from "@/features/places/rec-media";
import { shareCard, SITE_NAME } from "@/lib/share-card";
import {
  getCityBySlug,
  listPlacesForCity,
  listZonesForCity,
} from "@/features/places/queries";
import { zonePublicLabel } from "@/features/places/types";
import { LayoverPreviewCard } from "@/features/playbooks/layover-card";
import {
  listPlaybooksForCity,
  listStopsForPlaybook,
} from "@/features/playbooks/queries";
import type { PlaybookStop } from "@/features/playbooks/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return shareCard({ title: SITE_NAME });
  const hero = heroForCity(city);
  return shareCard({
    title: `${city.name}${city.airport_code ? ` · ${city.airport_code}` : ""} · ${SITE_NAME}`,
    description: CITY_FEEL[city.slug] ?? `Eat, do, buy in ${city.name}.`,
    image: hero?.src,
    path: `/cities/${city.slug}`,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [zones, places, playbooks, profile] = await Promise.all([
    listZonesForCity(city.id),
    listPlacesForCity(city.id),
    listPlaybooksForCity(city.id),
    getProfile(),
  ]);

  const publishedPlaces = places.filter((p) => p.status === "published");
  const publishedPlaybooks = playbooks.filter((p) => p.status === "published");
  const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));

  const byKind: Record<RecKind, CatalogPlace[]> = {
    eat: [],
    do: [],
    shop: [],
  };
  for (const p of publishedPlaces) {
    const z = p.zone_id ? zoneById[p.zone_id] : null;
    byKind[recKindFromCategory(p.category)].push({
      id: p.id,
      name: p.name,
      zone: z ? zonePublicLabel(z) : null,
      still: stillForPlace(p),
    });
  }

  const hero = heroForCity(city);
  const previewPlans = publishedPlaybooks.slice(0, PREVIEW_COUNT);
  const planStops: Record<string, PlaybookStop[]> = {};
  await Promise.all(
    previewPlans.map(async (pb) => {
      planStops[pb.id] = await listStopsForPlaybook(pb.id);
    }),
  );

  const shareHref = profile
    ? `/share?city=${encodeURIComponent(city.slug)}`
    : `/signup?next=${encodeURIComponent(`/share?city=${city.slug}`)}`;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <CityHero city={city} hero={hero} profile={profile} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <CityCatalog
          citySlug={city.slug}
          cityName={city.name}
          loggedIn={Boolean(profile)}
          byKind={byKind}
          dayCount={publishedPlaybooks.length}
        />

        <section id="full-layover" className="mt-16 scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
                Full layover
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                A day, sequenced
              </h2>
            </div>
            {publishedPlaybooks.length > 0 ? (
              <Link
                href={`/cities/${city.slug}/layovers`}
                className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
              >
                All layovers
              </Link>
            ) : null}
          </div>
          {publishedPlaybooks.length === 0 ? (
            <p className="mt-6 max-w-xl text-zinc-600">
              No full layover in {city.name} yet.{" "}
              <Link
                href={shareHref}
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4"
              >
                Share your intel
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 lg:grid-cols-3">
              {previewPlans.map((pb) => (
                <li key={pb.id}>
                  <LayoverPreviewCard
                    playbook={pb}
                    stops={planStops[pb.id] ?? []}
                    places={publishedPlaces}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
