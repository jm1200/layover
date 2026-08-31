import Link from "next/link";
import { CitySearch } from "@/features/places/city-search";
import { AiStill } from "@/features/places/ai-still";
import { getProfile } from "@/features/auth/get-profile";
import { SiteHeader } from "@/features/auth/site-header";
import { listCities, listPublishedPlaces } from "@/features/places/queries";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
  type RecKind,
} from "@/features/places/kind";
import type { Place } from "@/features/places/types";

/** Editorial mood. Not demo recs — those were wiped in 021. */
const MOOD: { kind: RecKind; src: string; alt: string }[] = [
  {
    kind: "eat",
    src: "/landing/eat-santiago.jpg",
    alt: "Thick grilled baseball-cut steak with pebre",
  },
  {
    kind: "do",
    src: "/landing/do-zurich.jpg",
    alt: "People floating the Limmat on inflatable rings",
  },
  {
    kind: "shop",
    src: "/landing/buy-munich.jpg",
    alt: "Jars of Bavarian sweet mustard at a market stall",
  },
];

function latestOfKind(places: Place[], kind: RecKind): Place | undefined {
  return places
    .filter((p) => recKindFromCategory(p.category) === kind)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0];
}

export default async function HomePage() {
  const [profile, cities, published] = await Promise.all([
    getProfile(),
    listCities(),
    listPublishedPlaces(),
  ]);

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
          <SiteHeader profile={profile} tone="dark" />
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
          {MOOD.map((card) => {
            const rec = latestOfKind(published, card.kind);
            const inner = (
              <>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                  <AiStill
                    src={card.src}
                    alt={card.alt}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className={
                      rec
                        ? "object-cover transition duration-300 group-hover:scale-[1.03]"
                        : "object-cover"
                    }
                  />
                  <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-3 pb-16 pt-4 text-center font-mono text-2xl font-semibold uppercase tracking-[0.28em] text-white sm:text-3xl">
                    {REC_KIND_LABEL[card.kind]}
                  </span>
                </div>
                {rec ? (
                  <p className="mt-3 text-sm font-medium text-zinc-900">
                    {rec.name}
                  </p>
                ) : null}
              </>
            );
            if (rec) {
              return (
                <Link
                  key={card.kind}
                  href={`/places/${rec.id}`}
                  className="group block"
                >
                  {inner}
                </Link>
              );
            }
            return <div key={card.kind}>{inner}</div>;
          })}
        </div>
        <p className="mx-auto mt-12 max-w-6xl text-center text-xs text-zinc-400">
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </p>
      </section>
    </div>
  );
}
