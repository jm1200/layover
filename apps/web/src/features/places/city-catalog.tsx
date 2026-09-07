"use client";

import Link from "next/link";
import { useState } from "react";
import { DumpBox } from "@/features/ai-import/dump-box";
import { RecThumb } from "@/features/places/rec-thumb";
import {
  recKindPath,
  REC_KIND_LABEL,
  REC_KINDS,
  type RecKind,
} from "@/features/places/kind";

export type CatalogPlace = {
  id: string;
  name: string;
  zone?: string | null;
  still?: { src: string; alt: string } | null;
};

const PREVIEW = 6;

export function CityCatalog({
  citySlug,
  cityName,
  loggedIn,
  byKind,
  dayCount,
}: {
  citySlug: string;
  cityName: string;
  loggedIn: boolean;
  byKind: Record<RecKind, CatalogPlace[]>;
  dayCount: number;
}) {
  const [open, setOpen] = useState<RecKind>("eat");
  const shareHref = loggedIn
    ? `/share?city=${encodeURIComponent(citySlug)}`
    : `/signup?next=${encodeURIComponent(`/share?city=${citySlug}`)}`;

  return (
    <div>
      <nav
        aria-label="Eat, do, buy"
        className="sticky top-0 z-20 -mx-4 mb-8 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur"
      >
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {REC_KINDS.map((kind) => {
            const active = open === kind;
            return (
              <li key={kind}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setOpen(kind);
                    document.getElementById(recKindPath(kind))?.scrollIntoView({
                      block: "start",
                    });
                  }}
                  className={
                    active
                      ? "font-mono text-2xl font-semibold uppercase tracking-[0.18em] text-zinc-900 sm:text-3xl"
                      : "font-mono text-2xl font-semibold uppercase tracking-[0.18em] text-zinc-400 hover:text-zinc-700 sm:text-3xl"
                  }
                >
                  {REC_KIND_LABEL[kind]}
                </button>
              </li>
            );
          })}
          <li>
            <a
              href="#full-layover"
              className="font-mono text-2xl font-semibold uppercase tracking-[0.18em] text-zinc-400 hover:text-zinc-700 sm:text-3xl"
            >
              A day
            </a>
          </li>
        </ul>
      </nav>

      {REC_KINDS.map((kind) => {
        const places = byKind[kind];
        const preview = places.slice(0, PREVIEW);
        const path = recKindPath(kind);
        const label = REC_KIND_LABEL[kind];
        return (
          <section
            key={kind}
            id={path}
            className={`scroll-mt-24 ${
              open === kind ? "block" : "hidden md:block"
            } mt-10 first:mt-0`}
          >
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-mono text-lg font-semibold uppercase tracking-[0.22em] text-zinc-900 md:text-xl">
                {label}
              </h2>
              {places.length > PREVIEW ? (
                <Link
                  href={`/cities/${citySlug}/${path}`}
                  className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  See all {places.length}
                </Link>
              ) : places.length > 0 ? (
                <Link
                  href={`/cities/${citySlug}/${path}`}
                  className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  All {label}
                </Link>
              ) : null}
            </div>
            {places.length === 0 ? (
              <EmptyKind
                citySlug={citySlug}
                cityName={cityName}
                label={label}
                showDump={loggedIn && open === kind}
                shareHref={shareHref}
              />
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {preview.map((p) => (
                  <li key={p.id}>
                    <RecThumb
                      href={`/places/${p.id}`}
                      name={p.name}
                      zone={p.zone}
                      still={p.still}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <p className="mt-12 max-w-xl text-zinc-700">
        Got something that isn’t here?{" "}
        <Link
          href={shareHref}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4"
        >
          Share your intel
        </Link>
        {dayCount === 0 ? " — a place, or a whole day." : ` for ${cityName}.`}
      </p>
    </div>
  );
}

function EmptyKind({
  citySlug,
  cityName,
  label,
  showDump,
  shareHref,
}: {
  citySlug: string;
  cityName: string;
  label: string;
  showDump: boolean;
  shareHref: string;
}) {
  return (
    <div className="mt-4 max-w-xl">
      <p className="text-zinc-600">
        Nobody’s filed {label} in {cityName} yet.
      </p>
      {showDump ? (
        <div className="mt-4">
          <p className="mb-2 text-sm text-zinc-500">
            One place. A real name we can search.
          </p>
          <DumpBox citySlug={citySlug} cityName={cityName} />
        </div>
      ) : (
        <p className="mt-2">
          <Link
            href={shareHref}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4"
          >
            Share your intel
          </Link>
        </p>
      )}
    </div>
  );
}
