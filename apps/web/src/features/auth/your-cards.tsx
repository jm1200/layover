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

export function RecCard({
  href,
  name,
  city,
  kind,
  posted,
  still,
}: {
  href: string;
  name: string;
  city: string;
  kind?: string;
  posted?: string | null;
  still?: { src: string; alt: string; badge?: "ai" | null } | null;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900">
        {still ? (
          <AiStill
            src={still.src}
            alt={still.alt}
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            badge={still.badge ?? null}
          />
        ) : null}
        {kind ? (
          <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 pb-10 pt-3 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-white">
            {kind}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-medium tracking-tight">{name}</p>
      <p className="mt-0.5 text-sm text-zinc-600">
        <span className="font-semibold text-zinc-900">{city}</span>
        {posted ? <span className="text-zinc-500"> · {posted}</span> : null}
      </p>
    </Link>
  );
}

export function DayCard({
  href,
  title,
  city,
  posted,
  hours,
  stills,
}: {
  href: string;
  title: string;
  city: string;
  posted?: string | null;
  hours?: number | null;
  stills: { src: string; alt: string; badge?: "ai" | null }[];
}) {
  const tiles = stills.slice(0, 4);
  const n = Math.min(Math.max(tiles.length, 1), 4);
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 hover:ring-zinc-400"
    >
      <div
        className="relative grid gap-0.5 bg-zinc-950"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {(tiles.length ? tiles : [null]).map((still, i) => (
          <div key={still?.src ?? i} className="relative aspect-square bg-zinc-800">
            {still ? (
              <AiStill
                src={still.src}
                alt={still.alt}
                sizes="15vw"
                className="object-cover"
                badge={null}
              />
            ) : null}
          </div>
        ))}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
          Full day
        </span>
      </div>
      <div className="px-4 py-3">
        {hours ? (
          <p className="font-mono text-2xl font-semibold tracking-tight">
            ~{hours}h
          </p>
        ) : null}
        <p className="mt-1 font-medium tracking-tight">{title}</p>
        <p className="mt-0.5 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{city}</span>
          {posted ? <span className="text-zinc-500"> · {posted}</span> : null}
        </p>
      </div>
    </Link>
  );
}

export function recKindLabel(category: string | null) {
  return REC_KIND_LABEL[recKindFromCategory(category)];
}
