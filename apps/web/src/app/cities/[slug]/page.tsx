import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/features/auth/get-profile";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
  type RecKind,
} from "@/features/places/kind";
import {
  getCityBySlug,
  listPlacesForCity,
  listZonesForCity,
} from "@/features/places/queries";
import type { Place, Zone } from "@/features/places/types";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";
import { listPlaybooksForCity } from "@/features/playbooks/queries";
import type { Playbook } from "@/features/playbooks/types";

const REC_SECTIONS: RecKind[] = ["eat", "do", "shop"];

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

  const byKind: Record<RecKind, Place[]> = { eat: [], do: [], shop: [] };
  for (const p of publishedPlaces) {
    byKind[recKindFromCategory(p.category)].push(p);
  }

  const chips = [
    { id: "full-layover", label: "Full layover", count: publishedPlaybooks.length },
    { id: "eat", label: "Eat", count: byKind.eat.length },
    { id: "do", label: "Do", count: byKind.do.length },
    { id: "shop", label: "Buy", count: byKind.shop.length },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Layover
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/cities">Cities</Link>
            {profile ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login">Log in</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-zinc-500">
          <Link href="/cities" className="underline">
            Cities
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {city.name}
          {city.airport_code ? (
            <span className="ml-2 text-lg font-normal text-zinc-500">
              {city.airport_code}
            </span>
          ) : null}
        </h1>
        {city.country ? (
          <p className="mt-1 text-zinc-600">{city.country}</p>
        ) : null}

        <nav
          aria-label="Jump to"
          className="mt-8 flex flex-wrap gap-2"
        >
          {chips.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-zinc-400"
            >
              <span className="font-medium">{c.label}</span>
              <span className="text-zinc-400">{c.count}</span>
            </a>
          ))}
        </nav>

        <section id="full-layover" className="mt-10 scroll-mt-6">
          <h2 className="text-lg font-semibold">Full layovers</h2>
          <p className="mt-1 text-sm text-zinc-500">
            A sequenced day from crew — copy it if it fits your hours.
          </p>
          <ul className="mt-4 space-y-3">
            {publishedPlaybooks.length === 0 ? (
              <li className="text-sm text-zinc-500">None yet.</li>
            ) : (
              publishedPlaybooks.map((pb) => (
                <li key={pb.id}>
                  <PlaybookCard playbook={pb} />
                </li>
              ))
            )}
          </ul>
        </section>

        {REC_SECTIONS.map((kind) => (
          <section
            key={kind}
            id={kind}
            className="mt-10 scroll-mt-6"
          >
            <h2 className="text-lg font-semibold">{REC_KIND_LABEL[kind]}</h2>
            <ul className="mt-4 space-y-2">
              {byKind[kind].length === 0 ? (
                <li className="text-sm text-zinc-500">None yet.</li>
              ) : (
                byKind[kind].map((p) => (
                  <li key={p.id}>
                    <PlaceCard place={p} zone={p.zone_id ? zoneById[p.zone_id] : null} />
                  </li>
                ))
              )}
            </ul>
          </section>
        ))}

        {zones.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Layover zones</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Logistics anchors — not crew hotels.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {zones.map((z) => (
                <li
                  key={z.id}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700"
                >
                  {z.name || ZONE_LABELS[z.type as ZoneType] || z.type}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function PlaybookCard({ playbook: pb }: { playbook: Playbook }) {
  return (
    <Link
      href={`/playbooks/${pb.id}`}
      className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
    >
      <span className="font-medium">{pb.title}</span>
      {pb.hours_available ? (
        <span className="ml-2 text-sm text-zinc-500">
          ~{pb.hours_available}h
        </span>
      ) : null}
      {pb.narrative ? (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{pb.narrative}</p>
      ) : null}
    </Link>
  );
}

function PlaceCard({
  place: p,
  zone: z,
}: {
  place: Place;
  zone: Zone | null | undefined;
}) {
  return (
    <Link
      href={`/places/${p.id}`}
      className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
    >
      <span className="font-medium">{p.name}</span>
      {z ? (
        <p className="mt-0.5 text-xs text-zinc-500">
          Zone: {z.name || ZONE_LABELS[z.type as ZoneType] || z.type}
        </p>
      ) : null}
    </Link>
  );
}
