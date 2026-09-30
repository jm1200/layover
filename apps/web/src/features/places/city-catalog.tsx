"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { RecThumb } from "@/features/places/rec-thumb";
import {
  recKindPath,
  REC_KIND_LABEL,
  REC_KINDS,
  type RecKind,
} from "@/features/places/kind";
import { LayoverPreviewCard } from "@/features/playbooks/layover-card";
import type { Place } from "@/features/places/types";
import type { Playbook, PlaybookStop } from "@/features/playbooks/types";

export type CatalogPlace = {
  id: string;
  name: string;
  zone?: string | null;
  still?: { src: string; alt: string } | null;
};

export type CatalogDay = {
  playbook: Playbook;
  stops: PlaybookStop[];
};

const PREVIEW = 6;

type Tab = RecKind | "day";

export function CityCatalog({
  citySlug,
  cityName,
  shareHref,
  byKind,
  days,
  places,
}: {
  citySlug: string;
  cityName: string;
  shareHref: string;
  byKind: Record<RecKind, CatalogPlace[]>;
  days: CatalogDay[];
  places: Place[];
}) {
  // Open on the first tab with something in it, not an empty Eat.
  const [tab, setTab] = useState<Tab>(() => {
    const first = (["eat", "do", "shop"] as RecKind[]).find(
      (k) => byKind[k]?.length,
    );
    return first ?? (days.length ? "day" : "eat");
  });

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-zinc-200 bg-zinc-50/95 px-4 backdrop-blur">
        <div
          role="tablist"
          aria-label="Eat, do, buy, a day"
          className="flex"
          onKeyDown={(e) => {
            const order: Tab[] = ["eat", "do", "shop", "day"];
            const i = order.indexOf(tab);
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              setTab(order[(i + 1) % order.length]);
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              setTab(order[(i - 1 + order.length) % order.length]);
            }
          }}
        >
          {REC_KINDS.map((kind) => (
            <TabBtn
              key={kind}
              id={`tab-${recKindPath(kind)}`}
              controls={recKindPath(kind)}
              selected={tab === kind}
              onSelect={() => setTab(kind)}
            >
              {REC_KIND_LABEL[kind]}
            </TabBtn>
          ))}
          <TabBtn
            id="tab-day"
            controls="full-layover"
            selected={tab === "day"}
            onSelect={() => setTab("day")}
          >
            A day
          </TabBtn>
        </div>
      </div>

      {REC_KINDS.map((kind) => {
        const placesOf = byKind[kind];
        const preview = placesOf.slice(0, PREVIEW);
        const path = recKindPath(kind);
        const label = REC_KIND_LABEL[kind];
        const selected = tab === kind;
        return (
          <section
            key={kind}
            id={path}
            role="tabpanel"
            aria-labelledby={`tab-${path}`}
            hidden={!selected}
            className="scroll-mt-24"
          >
            {selected ? (
              <>
                {placesOf.length > PREVIEW ? (
                  <p className="mb-4 text-right text-sm">
                    <Link
                      href={`/cities/${citySlug}/${path}`}
                      className="text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                    >
                      See all {placesOf.length}
                    </Link>
                  </p>
                ) : placesOf.length > 0 ? (
                  <p className="mb-4 text-right text-sm">
                    <Link
                      href={`/cities/${citySlug}/${path}`}
                      className="text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                    >
                      All {label}
                    </Link>
                  </p>
                ) : null}
                {placesOf.length === 0 ? (
                  <EmptyShare
                    cityName={cityName}
                    label={label}
                    shareHref={shareHref}
                  />
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
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
              </>
            ) : null}
          </section>
        );
      })}

      <section
        id="full-layover"
        role="tabpanel"
        aria-labelledby="tab-day"
        hidden={tab !== "day"}
        className="scroll-mt-24"
      >
        {tab === "day" ? (
          days.length === 0 ? (
            <EmptyShare
              cityName={cityName}
              label="day"
              shareHref={shareHref}
            />
          ) : (
            <>
              {days.length > 0 ? (
                <p className="mb-4 text-right text-sm">
                  <Link
                    href={`/cities/${citySlug}/layovers`}
                    className="text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                  >
                    All layovers
                  </Link>
                </p>
              ) : null}
              <ul className="grid gap-6 lg:grid-cols-3">
                {days.map(({ playbook, stops }) => (
                  <li key={playbook.id}>
                    <LayoverPreviewCard
                      playbook={playbook}
                      stops={stops}
                      places={places}
                    />
                  </li>
                ))}
              </ul>
            </>
          )
        ) : null}
      </section>
    </div>
  );
}

function TabBtn({
  id,
  controls,
  selected,
  onSelect,
  children,
}: {
  id: string;
  controls: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className={
        selected
          ? "-mb-px flex-1 border-b-2 border-zinc-950 py-3 text-center text-sm font-semibold tracking-wide text-zinc-950 sm:text-base"
          : "-mb-px flex-1 border-b-2 border-transparent py-3 text-center text-sm font-medium tracking-wide text-zinc-500 hover:text-zinc-800 sm:text-base"
      }
    >
      {children}
    </button>
  );
}

const EMPTY_WHAT: Record<string, string> = {
  Eat: "a place to eat",
  Do: "something to do",
  Buy: "a shop",
  day: "a full day",
};

/** Empty tab: say so plainly, then one button that already knows the city. */
export function EmptyShare({
  cityName,
  label,
  shareHref,
}: {
  cityName: string;
  label: string;
  shareHref: string;
}) {
  return (
    <div className="max-w-xl">
      <p className="text-zinc-600">
        No one’s shared {EMPTY_WHAT[label] ?? label} in {cityName} yet.
      </p>
      <Link
        href={shareHref}
        className="mt-4 inline-flex rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white"
      >
        Been to {cityName}? Share it
      </Link>
    </div>
  );
}
