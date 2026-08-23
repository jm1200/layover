import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { CityHero } from "@/features/places/city-chrome";
import {
  recKindFromCategory,
  recKindPath,
  REC_KIND_LABEL,
  REC_KINDS,
  type RecKind,
} from "@/features/places/kind";
import {
  CITY_HERO,
  CITY_PAGE_FORCE_EMPTY,
  PLACE_STILL,
  PREVIEW_COUNT,
} from "@/features/places/rec-media";
import {
  getCityBySlug,
  listPlacesForCity,
  listZonesForCity,
} from "@/features/places/queries";
import type { Place, Zone } from "@/features/places/types";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";
import { listPlaybooksForCity } from "@/features/playbooks/queries";
import type { Playbook } from "@/features/playbooks/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "Layover Intel" };
  return {
    title: `${city.name}${city.airport_code ? ` · ${city.airport_code}` : ""} · Layover Intel`,
  };
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

  const emptyDemo = CITY_PAGE_FORCE_EMPTY.has(city.slug);
  const publishedPlaces = emptyDemo
    ? []
    : places.filter((p) => p.status === "published");
  const publishedPlaybooks = emptyDemo
    ? []
    : playbooks.filter((p) => p.status === "published");
  const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));

  const byKind: Record<RecKind, Place[]> = { eat: [], do: [], shop: [] };
  for (const p of publishedPlaces) {
    byKind[recKindFromCategory(p.category)].push(p);
  }

  const hero = CITY_HERO[city.slug] ?? null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <CityHero
        city={city}
        hero={hero}
        loggedIn={Boolean(profile)}
      />

      <main className="mx-auto max-w-6xl px-4 py-12">
        {REC_KINDS.map((kind) => (
          <KindPreview
            key={kind}
            citySlug={city.slug}
            cityName={city.name}
            kind={kind}
            places={byKind[kind]}
            zoneById={zoneById}
            loggedIn={Boolean(profile)}
          />
        ))}

        <section id="full-layover" className="mt-16 scroll-mt-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
            Full layover
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            A day, sequenced
          </h2>
          {publishedPlaybooks.length === 0 ? (
            <EmptyInvite
              cityName={city.name}
              label="full layover"
              loggedIn={Boolean(profile)}
            />
          ) : (
            <ul className="mt-6 space-y-4">
              {publishedPlaybooks.map((pb) => (
                <li key={pb.id}>
                  <PlaybookCard playbook={pb} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function KindPreview({
  citySlug,
  cityName,
  kind,
  places,
  zoneById,
  loggedIn,
}: {
  citySlug: string;
  cityName: string;
  kind: RecKind;
  places: Place[];
  zoneById: Record<string, Zone>;
  loggedIn: boolean;
}) {
  const label = REC_KIND_LABEL[kind];
  const path = recKindPath(kind);
  const preview = places.slice(0, PREVIEW_COUNT);

  return (
    <section id={path} className="mt-14 first:mt-0 scroll-mt-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-mono text-3xl font-semibold uppercase tracking-[0.22em] sm:text-4xl">
          {label}
        </h2>
        {places.length > 0 ? (
          <Link
            href={`/cities/${citySlug}/${path}`}
            className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            {places.length > PREVIEW_COUNT
              ? `See all ${places.length}`
              : `All ${label}`}
          </Link>
        ) : null}
      </div>
      {places.length === 0 ? (
        <EmptyInvite cityName={cityName} label={label} loggedIn={loggedIn} />
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {preview.map((p) => (
            <li key={p.id}>
              <PlaceCard
                place={p}
                zone={p.zone_id ? zoneById[p.zone_id] : null}
                still={PLACE_STILL[p.id]}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyInvite({
  cityName,
  label,
  loggedIn,
}: {
  cityName: string;
  label: string;
  loggedIn: boolean;
}) {
  return (
    <p className="mt-6 max-w-xl text-zinc-600">
      No {label} recs in {cityName} yet.{" "}
      <Link
        href={loggedIn ? "/dashboard" : "/signup"}
        className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4"
      >
        Share your intel
      </Link>
      .
    </p>
  );
}

function PlaceCard({
  place: p,
  zone: z,
  still,
}: {
  place: Place;
  zone: Zone | null | undefined;
  still?: { src: string; alt: string };
}) {
  const kind = recKindFromCategory(p.category);
  return (
    <Link href={`/places/${p.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
        {still ? (
          <Image
            src={still.src}
            alt={still.alt}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 640px) 33vw, 100vw"
          />
        ) : null}
        <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 pb-12 pt-4 text-center font-mono text-xl font-semibold uppercase tracking-[0.28em] text-white">
          {REC_KIND_LABEL[kind]}
        </span>
        {!still ? (
          <span className="absolute inset-x-4 bottom-4 text-center text-sm font-medium text-white">
            {p.name}
          </span>
        ) : null}
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

function PlaybookCard({ playbook: pb }: { playbook: Playbook }) {
  return (
    <Link
      href={`/playbooks/${pb.id}`}
      className="block rounded-xl bg-white px-5 py-5 shadow-sm ring-1 ring-zinc-200 hover:ring-zinc-400"
    >
      {pb.hours_available ? (
        <p className="font-mono text-3xl font-semibold tracking-tight">
          ~{pb.hours_available}h
        </p>
      ) : null}
      <p className="mt-2 text-lg font-medium">{pb.title}</p>
      {pb.narrative ? (
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{pb.narrative}</p>
      ) : null}
    </Link>
  );
}
