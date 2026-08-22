import Image from "next/image";
import Link from "next/link";
import { CitySearch } from "@/features/places/city-search";
import { getProfile, homeForRole } from "@/features/auth/get-profile";
import { listCities } from "@/features/places/queries";

const IDEAS = [
  {
    kind: "Eat",
    idea: "Baseball steak in Santiago",
    src: "/landing/eat-santiago.jpg",
    alt: "Thick grilled baseball-cut steak with pebre",
  },
  {
    kind: "Do",
    idea: "Float the Limmat in Zurich",
    src: "/landing/do-zurich.jpg",
    alt: "People floating the Limmat on inflatable rings",
  },
  {
    kind: "Buy",
    idea: "Don't miss the mustard in Munich",
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

      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Intel for crew, by crew
        </p>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {IDEAS.map((card) => (
            <article
              key={card.kind}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                  priority
                />
              </div>
              <div className="px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {card.kind}
                </p>
                <p className="mt-0.5 text-sm font-medium">{card.idea}</p>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-8">
          <CitySearch cities={cities} />
        </div>
      </main>
    </div>
  );
}
