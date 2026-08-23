import Image from "next/image";

export function AiStill({
  src,
  alt,
  sizes,
  className,
  badge = "ai",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  badge?: "ai" | "sponsored" | null;
}) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        className={className ?? "object-cover"}
        sizes={sizes}
      />
      {badge === "ai" ? (
        <span className="group/ai absolute right-3 top-3 z-10">
          <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            AI
          </span>
          <span className="pointer-events-none absolute right-0 top-8 hidden w-52 rounded-lg bg-zinc-950 px-3 py-2 text-left text-xs font-normal normal-case tracking-normal text-white/90 shadow-lg group-hover/ai:block">
            No crew photo yet — this still is generated, not a picture of this
            exact room or stall.
          </span>
        </span>
      ) : null}
      {badge === "sponsored" ? (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-950">
          Sponsored
        </span>
      ) : null}
    </>
  );
}
