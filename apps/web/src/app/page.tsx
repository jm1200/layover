import Link from "next/link";
import { CitySearch } from "@/features/places/city-search";
import { AiStill } from "@/features/places/ai-still";
import { getProfile } from "@/features/auth/get-profile";
import { listCities } from "@/features/places/queries";

/** Seed IDs from 003 (Limmat) and 005 (Santiago steak, Munich mustard). */
const IDEAS = [
  {
    kind: "Eat",
    idea: "Baseball steak in Santiago",
    href: "/places/c1000000-0000-4000-8000-000000000021",
    src: "/landing/eat-santiago.jpg",
    alt: "Thick grilled baseball-cut steak with pebre",
  },
  {
    kind: "Do",
    idea: "Float the Limmat in Zurich",
    href: "/places/c1000000-0000-4000-8000-000000000001",
    src: "/landing/do-zurich.jpg",
    alt: "People floating the Limmat on inflatable rings",
  },
  {
    kind: "Buy",
    idea: "Don't miss the mustard in Munich",
    href: "/places/c1000000-0000-4000-8000-000000000031",
    src: "/landing/buy-munich.jpg",
    alt: "Jars of Bavarian sweet mustard at a market stall",
  },
] as const;

export default async function HomePage() {
  const [profile, cities] = await Promise.all([getProfile(), listCities()]);
  const loggedIn = Boolean(profile);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-900">
      <section className="relative min-h-[78vh] text-white">
        <AiStill
          src="/landing/hero.jpg"
          alt="Evening cafe tables on a cobbled street at blue hour"
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/25" />

        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
            <span className="text-lg font-semibold tracking-tight">Layover</span>
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

        <div className="relative z-10 flex min-h-[78vh] flex-col justify-end px-4 pb-14 pt-28">
          <div className="mx-auto w-full max-w-xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Layover Intel
            </h1>
            <p className="mt-2 text-lg text-white/85">For Crew, By Crew.</p>
            <div className="mt-8">
              <CitySearch cities={cities} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
          {IDEAS.map((card) => (
            <Link
              key={card.kind}
              href={card.href}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <AiStill
                  src={card.src}
                  alt={card.alt}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-3 pb-16 pt-4 text-center font-mono text-2xl font-semibold uppercase tracking-[0.28em] text-white sm:text-3xl">
                  {card.kind}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {card.idea}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
