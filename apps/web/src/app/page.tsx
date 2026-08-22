import Link from "next/link";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { listCities } from "@/features/places/queries";
import { listPublishedPlaybooks } from "@/features/playbooks/queries";

export default async function HomePage() {
  const [profile, cities, playbooks] = await Promise.all([
    getProfile(),
    listCities(),
    listPublishedPlaybooks(),
  ]);
  const appHome = profile ? homeForRole(profile.role) : null;
  const cityById = Object.fromEntries(cities.map((c) => [c.id, c]));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">Layover</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/cities" className="text-zinc-700 hover:text-zinc-900">
              Cities
            </Link>
            {appHome ? (
              <Link
                href={appHome}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-zinc-700 hover:text-zinc-900">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          From people who fly
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Steal the whole layover.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600">
          Crew recs used to live as word of mouth. Here the day is already
          sequenced — copy the plan. Or pick one eat / do / shop rec.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/cities"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Browse cities
          </Link>
          {appHome ? (
            <Link
              href={appHome}
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium"
            >
              Create account
            </Link>
          )}
        </div>

        {playbooks.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-sm font-medium text-zinc-500">Full layovers</h2>
            <ul className="mt-3 space-y-3">
              {playbooks.map((pb) => {
                const city = cityById[pb.city_id];
                return (
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
                      {city ? (
                        <p className="mt-0.5 text-sm text-zinc-500">
                          {city.name}
                          {city.airport_code ? ` (${city.airport_code})` : ""}
                        </p>
                      ) : null}
                      {pb.narrative ? (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                          {pb.narrative}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {cities.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-sm font-medium text-zinc-500">Cities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cities/${c.slug}`}
                    className="inline-block rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm hover:border-zinc-400"
                  >
                    {c.name}
                    {c.airport_code ? ` (${c.airport_code})` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
