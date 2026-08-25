import Link from "next/link";
import { AiStill } from "@/features/places/ai-still";
import { stillForStop } from "@/features/places/rec-media";
import type { Place } from "@/features/places/types";
import type { Playbook, PlaybookStop } from "@/features/playbooks/types";

export function LayoverPreviewCard({
  playbook: pb,
  stops,
  places,
}: {
  playbook: Playbook;
  stops: PlaybookStop[];
  places: Place[];
}) {
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));
  const tiles = stops.slice(0, 4);
  const n = Math.min(Math.max(tiles.length, 1), 4);

  return (
    <Link
      href={`/playbooks/${pb.id}`}
      className="block overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 hover:ring-zinc-400"
    >
      <div
        className="grid gap-0.5 bg-zinc-950"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {tiles.map((s) => {
          const place = s.place_id ? byId[s.place_id] : undefined;
          const still = stillForStop(s, place);
          return (
            <div key={s.id} className="relative aspect-square bg-zinc-800">
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
          );
        })}
      </div>
      <div className="px-5 py-4">
        {pb.hours_available ? (
          <p className="font-mono text-3xl font-semibold tracking-tight">
            ~{pb.hours_available}h
          </p>
        ) : null}
        <p className="mt-2 font-medium">{pb.title}</p>
        {pb.narrative ? (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
            {pb.narrative}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
