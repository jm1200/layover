import Link from "next/link";

export function Byline({
  name,
  href,
  posted,
  tone = "light",
}: {
  name: string;
  href?: string | null;
  posted?: string | null;
  tone?: "light" | "dark";
}) {
  const cls =
    tone === "dark"
      ? "mt-3 text-sm text-white/70"
      : "mt-2 text-sm text-zinc-500";
  const linkCls =
    tone === "dark" ? "underline hover:text-white" : "underline hover:text-zinc-800";

  return (
    <div className={cls}>
      <p>
        Posted by{" "}
        {href ? (
          <Link href={href} className={linkCls}>
            {name}
          </Link>
        ) : (
          name
        )}
      </p>
      {posted ? <p className="mt-0.5">{posted}</p> : null}
    </div>
  );
}
