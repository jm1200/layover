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
      className="relative mt-2 grid gap-0.5 overflow-hidden rounded-lg bg-zinc-100"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {stills.slice(0, 3).map((still) => (
        <div key={still.src} className="relative aspect-[3/4]">
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
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
          {kind}
        </span>
      ) : null}
    </div>
  );
}

export function RecCard({
  href,
  name,
  kind,
  posted,
  blurb,
  stills,
}: {
  href: string;
  name: string;
  kind?: string;
  posted?: string | null;
  blurb?: string | null;
  stills: Still[];
}) {
  return (
    <Link href={href} className="group block">
      {posted ? (
        <p className="text-xs text-zinc-500">{posted}</p>
      ) : null}
      <PhotoRow
        stills={stills}
        kind={kind}
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 50vw"
      />
      <p className="mt-2 text-sm font-medium tracking-tight">{name}</p>
      {blurb ? (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-600">
          {blurb}
        </p>
      ) : null}
    </Link>
  );
}

export function DayCard({
  href,
  title,
  posted,
  hours,
  blurb,
  stills,
}: {
  href: string;
  title: string;
  posted?: string | null;
  hours?: number | null;
  blurb?: string | null;
  stills: Still[];
}) {
  return (
    <Link href={href} className="group block">
      <p className="text-xs text-zinc-500">
        {posted}
        {hours ? ` · ~${hours}h` : null}
      </p>
      <PhotoRow stills={stills} kind="Full day" sizes="15vw" />
      <p className="mt-2 text-sm font-medium tracking-tight">{title}</p>
      {blurb ? (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-600">
          {blurb}
        </p>
      ) : null}
    </Link>
  );
}

export function recKindLabel(category: string | null) {
  return REC_KIND_LABEL[recKindFromCategory(category)];
}
