import Link from "next/link";
import { AiStill } from "@/features/places/ai-still";

export function RecThumb({
  href,
  name,
  zone,
  still,
}: {
  href: string;
  name: string;
  zone?: string | null;
  still?: { src: string; alt: string } | null;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-900">
        {still ? (
          <AiStill
            src={still.src}
            alt={still.alt}
            sizes="80px"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            badge={null}
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{name}</p>
        {zone ? <p className="truncate text-xs text-zinc-500">{zone}</p> : null}
      </div>
    </Link>
  );
}
