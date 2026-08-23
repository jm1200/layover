import Link from "next/link";
import Image from "next/image";
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
            className="font-medium text-white hover:text-white/80"
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
  return (
    <section className="relative min-h-[52vh] text-white sm:min-h-[60vh]">
      {hero ? (
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          className="object-cover object-[50%_55%]"
          sizes="100vw"
        />
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
      <div className="relative z-10 flex min-h-[52vh] flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[60vh]">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-white/70">
            {city.airport_code ?? "Layover"}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
            {city.name}
          </h1>
          {city.country ? (
            <p className="mt-2 text-white/75">{city.country}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
