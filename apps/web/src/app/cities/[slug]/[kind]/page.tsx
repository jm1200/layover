import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { CityHero } from "@/features/places/city-chrome";
import { RecThumb } from "@/features/places/rec-thumb";
import {
  parseRecKind,
  recKindFromCategory,
  recKindPath,
  REC_KIND_LABEL,
} from "@/features/places/kind";
import {
  CITY_FEEL,
  heroForCity,
  stillForPlace,
} from "@/features/places/rec-media";
import { shareCard, SITE_NAME } from "@/lib/share-card";
import {
  getCityBySlug,
  listPlacesForCity,
  listZonesForCity,
} from "@/features/places/queries";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; kind: string }>;
}): Promise<Metadata> {
  const { slug, kind: raw } = await params;
  const kind = parseRecKind(raw);
  const city = await getCityBySlug(slug);
  if (!city || !kind) return shareCard({ title: SITE_NAME });
  const hero = heroForCity(city);
  const label = REC_KIND_LABEL[kind];
  return shareCard({
    title: `${label} · ${city.name} · ${SITE_NAME}`,
    description: CITY_FEEL[city.slug] ?? `${label} in ${city.name}.`,
    image: hero?.src,
    path: `/cities/${city.slug}/${recKindPath(kind)}`,
  });
}

export default async function CityKindPage({
  params,
}: {
  params: Promise<{ slug: string; kind: string }>;
}) {
  const { slug, kind: raw } = await params;
  const kind = parseRecKind(raw);
  const city = await getCityBySlug(slug);
  if (!city || !kind) notFound();
  if (raw !== recKindPath(kind)) notFound();

  const [zones, places, profile] = await Promise.all([
    listZonesForCity(city.id),
    listPlacesForCity(city.id),
    getProfile(),
  ]);

  const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
  const list = places.filter(
    (p) => p.status === "published" && recKindFromCategory(p.category) === kind,
  );
  const label = REC_KIND_LABEL[kind];
  const shareHref = profile
    ? `/share?city=${encodeURIComponent(city.slug)}`
    : `/signup?next=${encodeURIComponent(`/share?city=${city.slug}`)}`;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <CityHero
        city={city}
        hero={heroForCity(city)}
        profile={profile}
      />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-zinc-500">
          <Link href={`/cities/${city.slug}`} className="underline">
            {city.name}
          </Link>
        </p>
        <h2 className="mt-4 font-mono text-4xl font-semibold uppercase tracking-[0.22em]">
          {label}
        </h2>
        {list.length === 0 ? (
          <p className="mt-6 text-zinc-600">
            Nobody’s filed {label} in {city.name} yet.{" "}
            <Link
              href={shareHref}
              className="font-medium text-zinc-900 underline"
            >
              Share your intel
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {list.map((p) => {
              const z = p.zone_id ? zoneById[p.zone_id] : null;
              return (
                <li key={p.id}>
                  <RecThumb
                    href={`/places/${p.id}`}
                    name={p.name}
                    zone={
                      z
                        ? z.name || ZONE_LABELS[z.type as ZoneType] || z.type
                        : null
                    }
                    still={stillForPlace(p)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
