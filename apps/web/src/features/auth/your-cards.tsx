import Link from "next/link";
import { AiStill } from "@/features/places/ai-still";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
} from "@/features/places/kind";

export function postedOn(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const when = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Posted ${when}`;
}

type Still = { src: string; alt: string; badge?: "ai" | null };

function PhotoRow({
  stills,
  kind,
  sizes,
}: {
  stills: Still[];
  kind?: string;
  sizes: string;
}) {
  if (stills.length === 0) return null;
  const n = Math.min(stills.length, 3);
  return (
    <div
      className="relative mt-4 grid gap-1 overflow-hidden rounded-xl bg-zinc-100"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {stills.slice(0, 3).map((still) => (
        <div key={still.src} className="relative aspect-[4/5]">
          <AiStill
            src={still.src}
            alt={still.alt}
            sizes={sizes}
            className="object-cover"
            badge={still.badge ?? null}
          />
        </div>
      ))}
      {kind ? (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
          {kind}
        </span>
      ) : null}
    </div>
  );
}

export function RecCard({
  href,
  name,
  city,
  kind,
  posted,
  blurb,
  stills,
}: {
  href: string;
  name: string;
  city: string;
  kind?: string;
  posted?: string | null;
  blurb?: string | null;
  stills: Still[];
}) {
  return (
    <Link href={href} className="group block">
      <p className="text-3xl font-bold tracking-tight sm:text-4xl">{city}</p>
      {posted ? (
        <p className="mt-1 text-sm text-zinc-500">{posted}</p>
      ) : null}
      <PhotoRow
        stills={stills}
        kind={kind}
        sizes="(min-width: 640px) 33vw, 100vw"
      />
      <p className="mt-3 font-medium tracking-tight">{name}</p>
      {blurb ? (
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-600">
          {blurb}
        </p>
      ) : null}
    </Link>
  );
}

export function DayCard({
  href,
  title,
  city,
  posted,
  hours,
  blurb,
  stills,
}: {
  href: string;
  title: string;
  city: string;
  posted?: string | null;
  hours?: number | null;
  blurb?: string | null;
  stills: Still[];
}) {
  return (
    <Link href={href} className="group block">
      <p className="text-3xl font-bold tracking-tight sm:text-4xl">{city}</p>
      <p className="mt-1 text-sm text-zinc-500">
        {posted}
        {hours ? ` · ~${hours}h` : null}
      </p>
      <PhotoRow stills={stills} kind="Full day" sizes="15vw" />
      <p className="mt-3 font-medium tracking-tight">{title}</p>
      {blurb ? (
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-600">
          {blurb}
        </p>
      ) : null}
    </Link>
  );
}

export function recKindLabel(category: string | null) {
  return REC_KIND_LABEL[recKindFromCategory(category)];
}
