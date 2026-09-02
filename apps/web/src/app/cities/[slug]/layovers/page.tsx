import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { CityHero } from "@/features/places/city-chrome";
import { CITY_FEEL, heroForCity } from "@/features/places/rec-media";
import { shareCard, SITE_NAME } from "@/lib/share-card";
import { getCityBySlug, listPlacesForCity } from "@/features/places/queries";
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
    title: `Layovers · ${city.name} · ${SITE_NAME}`,
    description: CITY_FEEL[city.slug] ?? `A day, sequenced — ${city.name}.`,
    image: hero?.src,
    path: `/cities/${city.slug}/layovers`,
  });
}

export default async function CityLayoversPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [playbooks, places, profile] = await Promise.all([
    listPlaybooksForCity(city.id),
    listPlacesForCity(city.id),
    getProfile(),
  ]);
  const publishedPlaces = places.filter((p) => p.status === "published");
  const list = playbooks.filter((p) => p.status === "published");
  const stopsById: Record<string, PlaybookStop[]> = {};
  await Promise.all(
    list.map(async (pb) => {
      stopsById[pb.id] = await listStopsForPlaybook(pb.id);
    }),
  );

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
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          Full layovers
        </h2>
        {list.length === 0 ? (
          <p className="mt-6 text-zinc-600">
            No sequenced days in {city.name} yet.{" "}
            <Link
              href={profile ? `/share?city=${encodeURIComponent(city.slug)}` : "/signup"}
              className="font-medium underline"
            >
              Share your intel
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 lg:grid-cols-3">
            {list.map((pb) => (
              <li key={pb.id}>
                <LayoverPreviewCard
                  playbook={pb}
                  stops={stopsById[pb.id] ?? []}
                  places={publishedPlaces}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}


