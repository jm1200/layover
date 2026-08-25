import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { AiStill } from "@/features/places/ai-still";
import { CityPublicHeader } from "@/features/places/city-chrome";
import { CITY_HERO, stillForStop } from "@/features/places/rec-media";
import { getPlace, listCities } from "@/features/places/queries";
import { StartItinerary } from "@/features/playbooks/start-itinerary";
import {
  getPlaybook,
  listStopsForPlaybook,
} from "@/features/playbooks/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pb = await getPlaybook(id);
  return { title: pb ? `${pb.title} · Layover Intel` : "Layover Intel" };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playbook = await getPlaybook(id);
  if (!playbook) notFound();

  const [stops, cities, profile] = await Promise.all([
    listStopsForPlaybook(playbook.id),
    listCities(),
    getProfile(),
  ]);
  const city = cities.find((c) => c.id === playbook.city_id) ?? null;
  const canEdit =
    profile &&
    (profile.role === "admin" || profile.id === playbook.author_id);

  const placesById: Record<string, NonNullable<Awaited<ReturnType<typeof getPlace>>>> =
    {};
  for (const s of stops) {
    if (s.place_id && !placesById[s.place_id]) {
      const pl = await getPlace(s.place_id);
      if (pl) placesById[s.place_id] = pl;
    }
  }

  const timedStops = stops.map((s) => ({
    title:
      s.title ||
      (s.place_id ? placesById[s.place_id]?.name : null) ||
      "Stop",
    duration_minutes: s.duration_minutes,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <section className="relative min-h-[42vh] overflow-hidden px-4 pb-12 pt-28 text-white">
        {city && CITY_HERO[city.slug] ? (
          <div className="absolute inset-0">
            <AiStill
              src={CITY_HERO[city.slug].src}
              alt={CITY_HERO[city.slug].alt}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25" />
        <CityPublicHeader loggedIn={Boolean(profile)} />
        <div className="relative z-10 mx-auto max-w-6xl">
          {city ? (
            <Link
              href={`/cities/${city.slug}`}
              className="text-sm text-white/70 underline"
            >
              {city.name}
              {city.airport_code ? ` · ${city.airport_code}` : ""}
            </Link>
          ) : null}
          {playbook.hours_available ? (
            <p className="mt-6 font-mono text-6xl font-semibold tracking-tight">
              ~{playbook.hours_available}h
            </p>
          ) : null}
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {playbook.title}
          </h1>
          {playbook.narrative ? (
            <p className="mt-4 max-w-3xl text-lg text-white/80">
              {playbook.narrative}
            </p>
          ) : null}
          {canEdit ? (
            <p className="mt-4 text-sm">
              <Link
                href={`/dashboard/playbooks/${playbook.id}/edit`}
                className="underline"
              >
                Edit
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {playbook.status !== "published" ? (
          <p className="mb-6 text-sm text-amber-800">
            Status: {playbook.status} (not public)
          </p>
        ) : null}

        <ol className="space-y-10">
          {stops.map((s) => {
            const pl = s.place_id ? placesById[s.place_id] : null;
            const still = stillForStop(s, pl);
            return (
              <li
                key={s.id}
                className="grid gap-6 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-start"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
                  {still ? (
                    <AiStill
                      src={still.src}
                      alt={still.alt}
                      sizes="(min-width: 640px) 16rem, 100vw"
                      badge={still.badge ?? null}
                    />
                  ) : null}
                  <span className="absolute left-3 top-3 font-mono text-xs uppercase tracking-widest text-white">
                    Stop {s.position}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {s.title || pl?.name || "Stop"}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {s.duration_minutes
                      ? `~${s.duration_minutes} min`
                      : null}
                    {s.duration_minutes && s.cost_note ? " · " : null}
                    {s.cost_note}
                  </p>
                  {s.body ? (
                    <p className="mt-3 whitespace-pre-wrap text-zinc-700">
                      {s.body}
                    </p>
                  ) : null}
                  {pl?.blurb && pl.blurb !== s.body ? (
                    <p className="mt-3 text-sm text-zinc-600">{pl.blurb}</p>
                  ) : null}
                  {s.place_id ? (
                    <p className="mt-3 text-sm">
                      <Link
                        href={`/places/${s.place_id}`}
                        className="underline"
                      >
                        Open rec
                      </Link>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <StartItinerary stops={timedStops} />
      </main>
    </div>
  );
}
