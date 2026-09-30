"use client";

import { useEffect, useRef, useState } from "react";
import { AiStill } from "@/features/places/ai-still";

export type SwipePhoto = { src: string; alt: string; badge?: "ai" | null };

/** Rec album: swipe left/right on the page, tap for full screen and swipe there too. */
export function PhotoSwipe({ photos }: { photos: SwipePhoto[] }) {
  const strip = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  function onScroll() {
    const el = strip.current;
    if (!el || !el.firstElementChild) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    setActive(Math.min(photos.length - 1, Math.round(el.scrollLeft / w)));
  }

  function goTo(i: number) {
    const el = strip.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }

  return (
    <>
      <ul
        ref={strip}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        aria-label="Photos"
      >
        {photos.map((p, i) => (
          <li
            key={p.src}
            className={`relative aspect-[4/5] shrink-0 snap-start overflow-hidden rounded-lg bg-zinc-100 ${
              photos.length === 1
                ? "w-full sm:w-[calc((100%-1.5rem)/3)]"
                : "w-[82%] sm:w-[calc((100%-1.5rem)/3)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="absolute inset-0 z-[1] block h-full w-full cursor-zoom-in"
              aria-label={`View photo ${i + 1} of ${photos.length}`}
            >
              <AiStill
                src={p.src}
                alt={p.alt}
                sizes="(min-width: 640px) 30vw, 82vw"
                className="object-cover"
                badge={p.badge ?? null}
              />
            </button>
          </li>
        ))}
      </ul>
      {photos.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2 sm:hidden">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === active}
              className={`h-2 w-2 rounded-full ${
                i === active ? "bg-zinc-800" : "bg-zinc-300"
              }`}
            />
          ))}
        </div>
      ) : null}
      {open !== null ? (
        <Viewer photos={photos} start={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

/** One frame (a layover stop tile): fills its parent, swipes photo to photo, dots on top. */
export function PhotoFrame({
  photos,
  sizes,
}: {
  photos: SwipePhoto[];
  sizes: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const many = photos.length > 1;

  return (
    <>
      <div
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Photos"
      >
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
            aria-label={`View photo ${i + 1} of ${photos.length}`}
          >
            <AiStill
              src={p.src}
              alt={p.alt}
              sizes={sizes}
              className="object-cover"
              badge={p.badge ?? null}
            />
          </button>
        ))}
      </div>
      {many ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {photos.map((p, i) => (
            <span
              key={p.src}
              className={`h-1.5 w-1.5 rounded-full shadow ${
                i === active ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
      {open !== null ? (
        <Viewer photos={photos} start={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

function Viewer({
  photos,
  start,
  onClose,
}: {
  photos: SwipePhoto[];
  start: number;
  onClose: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  function show(i: number, smooth = true) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({
      left: next * el.clientWidth,
      behavior: smooth ? "smooth" : "instant",
    });
  }

  useEffect(() => {
    show(start, false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft") show(index - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const many = photos.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={photos[index]?.alt ?? "Photo"}
    >
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p) => (
          <div
            key={p.src}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4"
            onClick={onClose}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src.split("?")[0]}
              alt={p.alt}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25"
        aria-label="Close"
      >
        ×
      </button>
      {many ? (
        <>
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-sm text-white/70">
            {index + 1} / {photos.length}
          </p>
          {index > 0 ? (
            <button
              type="button"
              onClick={() => show(index - 1)}
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 sm:flex"
              aria-label="Previous photo"
            >
              ‹
            </button>
          ) : null}
          {index < photos.length - 1 ? (
            <button
              type="button"
              onClick={() => show(index + 1)}
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 sm:flex"
              aria-label="Next photo"
            >
              ›
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
