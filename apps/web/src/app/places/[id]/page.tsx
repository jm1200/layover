import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/features/auth/get-profile";
import {
  getPlace,
  listCities,
  listDishesForPlace,
  listZonesForCity,
} from "@/features/places/queries";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
} from "@/features/places/kind";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const [dishes, cities, profile] = await Promise.all([
    listDishesForPlace(place.id),
    listCities(),
    getProfile(),
  ]);
  const city = cities.find((c) => c.id === place.city_id);
  const zones = city ? await listZonesForCity(city.id) : [];
  const zone = place.zone_id
    ? zones.find((z) => z.id === place.zone_id)
    : null;

  const canEdit =
    profile && (profile.role === "admin" || profile.id === place.author_id);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Layover
          </Link>
          <nav className="flex gap-3 text-sm">
            {city ? (
              <Link href={`/cities/${city.slug}`}>{city.name}</Link>
            ) : (
              <Link href="/cities">Cities</Link>
            )}
            {canEdit ? (
              <Link href={`/dashboard/places/${place.id}/edit`}>Edit</Link>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {place.status !== "published" ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Status: {place.status}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight">{place.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {city ? (
            <Link href={`/cities/${city.slug}`} className="underline">
              {city.name}
            </Link>
          ) : null}
          {` · ${REC_KIND_LABEL[recKindFromCategory(place.category)]}`}
          {zone
            ? ` · zone: ${zone.name || ZONE_LABELS[zone.type as ZoneType] || zone.type}`
            : null}
        </p>
        {place.blurb ? (
          <p className="mt-6 whitespace-pre-wrap text-zinc-700">{place.blurb}</p>
        ) : null}

        {dishes.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Try this</h2>
            <ul className="mt-3 space-y-2">
              {dishes.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
                >
                  <span className="font-medium">{d.name}</span>
                  {d.note ? (
                    <p className="text-sm text-zinc-600">{d.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
