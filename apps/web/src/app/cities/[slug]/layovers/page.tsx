import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { AiStill } from "@/features/places/ai-still";
import { CityHero } from "@/features/places/city-chrome";
import { CITY_HERO, stillForStop } from "@/features/places/rec-media";
import { getCityBySlug } from "@/features/places/queries";
import {
  listPlaybooksForCity,
  listStopsForPlaybook,
} from "@/features/playbooks/queries";
import type { Playbook, PlaybookStop } from "@/features/playbooks/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "Layover Intel" };
  return { title: `Layovers · ${city.name} · Layover Intel` };
}

export default async function CityLayoversPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [playbooks, profile] = await Promise.all([
    listPlaybooksForCity(city.id),
    getProfile(),
  ]);
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
        hero={CITY_HERO[city.slug] ?? null}
        loggedIn={Boolean(profile)}
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
              href={profile ? "/dashboard" : "/signup"}
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
                <PlanCard playbook={pb} stops={stopsById[pb.id] ?? []} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function PlanCard({
  playbook: pb,
  stops,
}: {
  playbook: Playbook;
  stops: PlaybookStop[];
}) {
  return (
    <Link
      href={`/playbooks/${pb.id}`}
      className="block overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 hover:ring-zinc-400"
    >
      <div className="grid grid-cols-4 gap-0.5 bg-zinc-900">
        {stops.slice(0, 4).map((s) => {
          const still = stillForStop(s);
          return (
            <div key={s.id} className="relative aspect-square">
              {still ? (
                <AiStill
                  src={still.src}
                  alt={still.alt}
                  sizes="15vw"
                  className="object-cover"
                  badge={null}
                />
              ) : (
                <div className="h-full bg-zinc-800" />
              )}
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4">
        {pb.hours_available ? (
          <p className="font-mono text-3xl font-semibold tracking-tight">
            ~{pb.hours_available}h
          </p>
        ) : null}
        <p className="mt-2 font-medium">{pb.title}</p>
        {pb.narrative ? (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
            {pb.narrative}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
