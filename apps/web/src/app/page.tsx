import Image from "next/image";
import Link from "next/link";
import { CitySearch } from "@/features/places/city-search";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
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
  const appHome = profile ? homeForRole(profile.role) : null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">Layover</span>
          <nav className="flex items-center gap-3 text-sm">
            {appHome ? (
              <Link
                href={appHome}
                className="text-zinc-700 hover:text-zinc-900"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-zinc-700 hover:text-zinc-900">
                  Log in
                </Link>
                <Link href="/signup" className="text-zinc-700 hover:text-zinc-900">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div
          className="relative h-48 overflow-hidden rounded-2xl sm:h-56"
          aria-hidden
        >
          {IDEAS.map((card, i) => (
            <div
              key={card.src}
              className={[
                "absolute inset-y-[-12%] w-[48%] overflow-hidden",
                i === 0
                  ? "left-[-6%] rotate-[-8deg]"
                  : i === 1
                    ? "left-[26%] rotate-[4deg]"
                    : "right-[-6%] rotate-[-5deg]",
              ].join(" ")}
            >
              <Image
                src={card.src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover"
                sizes="50vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/25 to-transparent" />
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Layover Intel
        </h1>
        <p className="mt-1 text-zinc-600">For Crew, By Crew.</p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {IDEAS.map((card) => (
            <Link
              key={card.kind}
              href={card.href}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-zinc-400"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <div className="px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {card.kind}
                </p>
                <p className="mt-0.5 text-sm font-medium">{card.idea}</p>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-8">
          <CitySearch cities={cities} />
        </div>
      </main>
    </div>
  );
}
