import Link from "next/link";
import { listCities } from "@/features/places/queries";
import { getProfile } from "@/features/auth/get-profile";
import { AiStill } from "@/features/places/ai-still";
import { CITY_FEEL, heroForCity } from "@/features/places/rec-media";

export default async function CitiesPage() {
  const [cities, profile] = await Promise.all([listCities(), getProfile()]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Layover
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/cities" className="font-medium">
              Cities
            </Link>
            <Link
              href={profile ? "/share" : "/signup"}
              className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800"
            >
              Share your intel
            </Link>
            {profile ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login">Log in</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Cities</h1>
        <p className="mt-2 text-zinc-600">
          Eat, do, buy — plus the perfect layover. Organics first, zones not
          hotels.
        </p>
        {cities.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500">
            No cities yet. Dump a layover and Lumen will open one.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {cities.map((c) => {
              const hero = heroForCity(c);
              const feel = CITY_FEEL[c.slug];
              return (
                <li key={c.id}>
                  <Link href={`/cities/${c.slug}`} className="group block">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                      {hero ? (
                        <>
                          <AiStill
                            src={hero.src}
                            alt={hero.alt}
                            sizes="(min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            badge={hero.badge === undefined ? "ai" : hero.badge}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-zinc-200" />
                      )}
                      <div
                        className={
                          hero
                            ? "absolute inset-x-0 bottom-0 p-4 text-white"
                            : "absolute inset-x-0 bottom-0 p-4 text-zinc-900"
                        }
                      >
                        {c.airport_code ? (
                          <p
                            className={
                              hero
                                ? "font-mono text-xs uppercase tracking-[0.3em] text-white/70"
                                : "font-mono text-xs uppercase tracking-[0.3em] text-zinc-500"
                            }
                          >
                            {c.airport_code}
                          </p>
                        ) : null}
                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                          {c.name}
                        </p>
                        {c.country ? (
                          <p
                            className={
                              hero ? "mt-0.5 text-sm text-white/80" : "mt-0.5 text-sm text-zinc-600"
                            }
                          >
                            {c.country}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {feel ? (
                      <p className="mt-2 text-sm text-zinc-600">{feel}</p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
