import Link from "next/link";
import { AiStill } from "@/features/places/ai-still";
import { CITY_FEEL } from "@/features/places/rec-media";
import type { City } from "@/features/places/types";

export function CityPublicHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-white">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/90">
          <Link
            href={loggedIn ? "/dashboard" : "/signup"}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-white/90"
          >
            Share your intel
          </Link>
          {loggedIn ? (
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="hover:text-white">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function CityHero({
  city,
  hero,
  loggedIn,
}: {
  city: City;
  hero: { src: string; alt: string } | null;
  loggedIn: boolean;
}) {
  const feel = CITY_FEEL[city.slug];
  return (
    <section className="relative min-h-[34vh] text-white sm:min-h-[40vh]">
      {hero ? (
        <div className="absolute inset-0">
          <AiStill
            src={hero.src}
            alt={hero.alt}
            sizes="100vw"
            className="object-cover object-[50%_55%]"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-zinc-950" />
      )}
      <div
        className={
          hero
            ? "absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25"
            : "absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-zinc-900"
        }
      />
      <CityPublicHeader loggedIn={loggedIn} />
      <div className="relative z-10 flex min-h-[34vh] flex-col justify-end px-4 pb-8 pt-24 sm:min-h-[40vh]">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-white/70">
            {city.airport_code ?? "Layover"}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
            {city.name}
          </h1>
          {feel ? (
            <p className="mt-3 max-w-xl text-lg text-white/90">{feel}</p>
          ) : city.country ? (
            <p className="mt-2 text-white/75">{city.country}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
