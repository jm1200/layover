import Link from "next/link";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { listCities } from "@/features/places/queries";
import { listPublishedPlaybooks } from "@/features/playbooks/queries";

const JOBS = [
  { href: "/cities", label: "Eat", hint: "Where to eat" },
  { href: "/cities", label: "Do", hint: "What to do" },
  { href: "/cities", label: "Buy", hint: "What to buy" },
] as const;

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

      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-2xl font-semibold tracking-tight">
          Intel for crew, by crew.
        </h1>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {JOBS.map((job) => (
            <Link
              key={job.label}
              href={job.href}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center hover:border-zinc-400"
            >
              <span className="text-xl font-semibold">{job.label}</span>
              <p className="mt-1 text-sm text-zinc-500">{job.hint}</p>
            </Link>
          ))}
        </section>

        {cities.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
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
        ) : null}

        {playbooks.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-lg font-semibold tracking-tight">
              The perfect layover
            </h2>
            <ul className="mt-4 space-y-3">
              {playbooks.map((pb) => {
                const city = cityById[pb.city_id];
                return (
                  <li key={pb.id}>
                    <Link
                      href={`/playbooks/${pb.id}`}
                      className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
                    >
                      <p className="font-medium">
                        The perfect layover does not exist
                        {city ? `… ${city.name} edition` : "."}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {pb.title}
                        {pb.hours_available ? ` · ~${pb.hours_available}h` : ""}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
