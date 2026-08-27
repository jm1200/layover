import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import {
  DayCard,
  RecCard,
  postedOn,
  recKindLabel,
} from "@/features/auth/your-cards";
import {
  heroForCity,
  stillForPlace,
  stillForStop,
} from "@/features/places/rec-media";
import {
  getPlace,
  listCities,
  listPlacePhotos,
} from "@/features/places/queries";
import {
  listMyPlaces,
  listMyPlaybooks,
  listStopsForPlaybook,
} from "@/features/playbooks/queries";

export default async function DashboardPage() {
  const { profile, error } = await requireRole(["user", "sponsor", "admin"]);

  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended") {
    return <SuspendedPanel />;
  }
  if (error === "forbidden" || !profile) redirect("/login");

  const [myPlaybooks, myPlaces, cities] = await Promise.all([
    listMyPlaybooks(profile.id),
    listMyPlaces(profile.id),
    listCities(),
  ]);
  const albums = await Promise.all(
    myPlaces.map((p) => listPlacePhotos(p.id)),
  );
  const city = (id: string) => cities.find((c) => c.id === id);
  const mineById: Record<
    string,
    {
      id: string;
      name: string;
      image_url?: string | null;
      image_source?: string | null;
    }
  > = Object.fromEntries(myPlaces.map((p) => [p.id, p]));

  const stopSets = await Promise.all(
    myPlaybooks.map((pb) => listStopsForPlaybook(pb.id)),
  );
  const needed = new Set<string>();
  for (const stops of stopSets) {
    for (const s of stops) {
      if (s.place_id && !mineById[s.place_id]) needed.add(s.place_id);
    }
  }
  const extras = await Promise.all([...needed].map((id) => getPlace(id)));
  for (const p of extras) {
    if (p) mineById[p.id] = p;
  }

  return (
    <AppShell profile={profile} title="Your recommendations" wide>
      <p className="text-zinc-600">What you put on the map.</p>

      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
          Full days
        </h2>
        {myPlaybooks.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No days yet. Share one.</p>
        ) : (
          <ul className="mt-5 grid gap-10 sm:grid-cols-2">
            {myPlaybooks.map((pb, i) => {
              const c = city(pb.city_id);
              const hero = c ? heroForCity(c) : null;
              const stills = stopSets[i]
                .map((s) =>
                  stillForStop(s, s.place_id ? mineById[s.place_id] : null),
                )
                .filter((x): x is NonNullable<typeof x> => Boolean(x));
              return (
                <li key={pb.id}>
                  <DayCard
                    href={`/playbooks/${pb.id}`}
                    title={pb.title}
                    city={c?.name ?? ""}
                    posted={postedOn(pb.created_at)}
                    hours={pb.hours_available}
                    stills={stills.length ? stills : hero ? [hero] : []}
                    blurb={pb.narrative}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14 border-t border-zinc-200 pt-10">
        <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
          Recs
        </h2>
        {myPlaces.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Nothing here yet. Share one.
          </p>
        ) : (
          <ul className="mt-5 grid gap-10 sm:grid-cols-2">
            {myPlaces.map((p, i) => {
              const c = city(p.city_id);
              const hero = stillForPlace(p);
              const stills: {
                src: string;
                alt: string;
                badge?: "ai" | null;
              }[] = [];
              for (const photo of albums[i] ?? []) {
                if (!stills.some((x) => x.src === photo.image_url)) {
                  stills.push({
                    src: photo.image_url,
                    alt: p.name,
                    badge: photo.image_url.startsWith("/landing/")
                      ? "ai"
                      : null,
                  });
                }
              }
              if (hero && !stills.some((x) => x.src.split("?")[0] === hero.src.split("?")[0])) {
                stills.unshift(hero);
              }
              return (
                <li key={p.id}>
                  <RecCard
                    href={`/places/${p.id}`}
                    name={p.name}
                    city={c?.name ?? ""}
                    kind={recKindLabel(p.category)}
                    posted={postedOn(p.created_at)}
                    blurb={p.blurb}
                    stills={stills}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-12 text-sm text-zinc-500">
        or type it yourself{" "}
        <Link href="/dashboard/places/new?kind=eat" className="underline">
          Eat
        </Link>
        {" · "}
        <Link href="/dashboard/places/new?kind=do" className="underline">
          Do
        </Link>
        {" · "}
        <Link href="/dashboard/places/new?kind=shop" className="underline">
          Buy
        </Link>
        {" · "}
        <Link href="/dashboard/playbooks/new" className="underline">
          Full layover
        </Link>
      </p>
    </AppShell>
  );
}
