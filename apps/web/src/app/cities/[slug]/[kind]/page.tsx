import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { AiStill } from "@/features/places/ai-still";
import { CityHero } from "@/features/places/city-chrome";
import {
  parseRecKind,
  recKindFromCategory,
  recKindPath,
  REC_KIND_LABEL,
  type RecKind,
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
import type { Place, Zone } from "@/features/places/types";
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
            No {label} in {city.name} yet.{" "}
            <Link
              href={profile ? `/share?city=${encodeURIComponent(city.slug)}` : "/signup"}
              className="font-medium text-zinc-900 underline"
            >
              Share your intel
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {list.map((p) => (
              <li key={p.id}>
                <KindPlaceCard
                  place={p}
                  kind={kind}
                  zone={p.zone_id ? zoneById[p.zone_id] : null}
                  still={stillForPlace(p)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function KindPlaceCard({
  place: p,
  kind,
  zone: z,
  still,
}: {
  place: Place;
  kind: RecKind;
  zone: Zone | null | undefined;
  still?: { src: string; alt: string; badge?: "ai" | null };
}) {
  return (
    <Link href={`/places/${p.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
        {still ? (
          <AiStill
            src={still.src}
            alt={still.alt}
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            badge={still.badge ?? null}
          />
        ) : null}
        <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 pb-12 pt-4 text-center font-mono text-xl font-semibold uppercase tracking-[0.28em] text-white">
          {REC_KIND_LABEL[kind]}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium">{p.name}</p>
      {z ? (
        <p className="text-xs text-zinc-500">
          {z.name || ZONE_LABELS[z.type as ZoneType] || z.type}
        </p>
      ) : null}
      {p.blurb ? (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{p.blurb}</p>
      ) : null}
    </Link>
  );
}
