import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { CityHero } from "@/features/places/city-chrome";
import {
  CityCatalog,
  type CatalogDay,
  type CatalogPlace,
} from "@/features/places/city-catalog";
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

  const days: CatalogDay[] = previewPlans.map((pb) => ({
    playbook: pb,
    stops: planStops[pb.id] ?? [],
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <CityHero city={city} hero={hero} profile={profile} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <CityCatalog
          citySlug={city.slug}
          cityName={city.name}
          shareHref={shareHref}
          byKind={byKind}
          days={days}
          places={publishedPlaces}
        />
      </main>
    </div>
  );
}
