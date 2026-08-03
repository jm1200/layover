import Link from "next/link";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { listCities } from "@/features/places/queries";

export default async function HomePage() {
  const [profile, cities] = await Promise.all([getProfile(), listCities()]);
  const appHome = profile ? homeForRole(profile.role) : null;

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
          For flight crew (and friends)
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          What to do on a layover — from people who actually fly.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600">
          High-trust playbooks: places, food, activities. Organic staples stay
          primary. Logistics use zones — never crew hotel lists.
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

        {cities.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-sm font-medium text-zinc-500">On the map</h2>
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
