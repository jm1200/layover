import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/features/auth/get-profile";
import {
  getCityBySlug,
  listPlacesForCity,
  listZonesForCity,
} from "@/features/places/queries";
import { listPlaybooksForCity } from "@/features/playbooks/queries";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";

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

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Crew playbooks</h2>
          <p className="mt-1 text-sm text-zinc-500">Organic staples rail</p>
          <ul className="mt-4 space-y-3">
            {publishedPlaybooks.length === 0 ? (
              <li className="text-sm text-zinc-500">No published playbooks yet.</li>
            ) : (
              publishedPlaybooks.map((pb) => (
                <li key={pb.id}>
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
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                        {pb.narrative}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Places</h2>
          <ul className="mt-4 space-y-2">
            {publishedPlaces.length === 0 ? (
              <li className="text-sm text-zinc-500">No published places yet.</li>
            ) : (
              publishedPlaces.map((p) => {
                const z = p.zone_id ? zoneById[p.zone_id] : null;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/places/${p.id}`}
                      className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
                    >
                      <span className="font-medium">{p.name}</span>
                      {p.category ? (
                        <span className="ml-2 text-xs uppercase tracking-wide text-zinc-400">
                          {p.category}
                        </span>
                      ) : null}
                      {z ? (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          Zone:{" "}
                          {z.name ||
                            ZONE_LABELS[z.type as ZoneType] ||
                            z.type}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </section>

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
