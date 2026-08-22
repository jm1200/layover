import Link from "next/link";
import { listCities } from "@/features/places/queries";
import { getProfile } from "@/features/auth/get-profile";

export default async function CitiesPage() {
  const [cities, profile] = await Promise.all([listCities(), getProfile()]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Layover
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/cities" className="font-medium">
              Cities
            </Link>
            {profile ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login">Log in</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Cities</h1>
        <p className="mt-2 text-zinc-600">
          Eat, do, buy — plus the perfect layover. Organics first, zones not hotels.
        </p>
        <ul className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {cities.length === 0 ? (
            <li className="px-4 py-6 text-sm text-zinc-500">
              No cities yet. After SQL seed (003) or create content, they appear
              here.
            </li>
          ) : (
            cities.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-zinc-50"
                >
                  <span>
                    <span className="font-medium">{c.name}</span>
                    {c.country ? (
                      <span className="text-zinc-500"> · {c.country}</span>
                    ) : null}
                  </span>
                  {c.airport_code ? (
                    <span className="text-sm text-zinc-500">
                      {c.airport_code}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
