import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/features/auth/get-profile";
import { getPlace, listCities } from "@/features/places/queries";
import {
  getPlaybook,
  listStopsForPlaybook,
} from "@/features/playbooks/queries";

async function getCityById(id: string) {
  const cities = await listCities();
  return cities.find((c) => c.id === id) ?? null;
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playbook = await getPlaybook(id);
  if (!playbook) notFound();

  const [stops, city, profile] = await Promise.all([
    listStopsForPlaybook(playbook.id),
    getCityById(playbook.city_id),
    getProfile(),
  ]);

  const canEdit =
    profile &&
    (profile.role === "admin" || profile.id === playbook.author_id);

  const placeNames: Record<string, string> = {};
  for (const s of stops) {
    if (s.place_id && !placeNames[s.place_id]) {
      const pl = await getPlace(s.place_id);
      if (pl) placeNames[s.place_id] = pl.name;
    }
  }

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
              <Link href={`/dashboard/playbooks/${playbook.id}/edit`}>
                Edit
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {playbook.status !== "published" ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Status: {playbook.status} (not public to strangers)
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight">
          {playbook.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {city ? (
            <Link href={`/cities/${city.slug}`} className="underline">
              {city.name}
            </Link>
          ) : null}
          {playbook.hours_available
            ? ` · ~${playbook.hours_available}h window`
            : null}
        </p>
        {playbook.narrative ? (
          <p className="mt-6 whitespace-pre-wrap text-lg text-zinc-700">
            {playbook.narrative}
          </p>
        ) : null}

        <ol className="mt-10 space-y-4">
          {stops.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Stop {s.position}
              </p>
              <h2 className="mt-1 font-semibold">
                {s.title ||
                  (s.place_id ? placeNames[s.place_id] : null) ||
                  "Stop"}
              </h2>
              {s.place_id ? (
                <p className="mt-1 text-sm">
                  <Link
                    href={`/places/${s.place_id}`}
                    className="text-zinc-600 underline"
                  >
                    {placeNames[s.place_id] ?? "View place"}
                  </Link>
                </p>
              ) : null}
              {s.body ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
                  {s.body}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
