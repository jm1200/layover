import Link from "next/link";

export function Byline({
  name,
  href,
  tone = "light",
}: {
  name: string;
  href?: string | null;
  tone?: "light" | "dark";
}) {
  const cls =
    tone === "dark"
      ? "mt-3 text-sm text-white/70"
      : "mt-2 text-sm text-zinc-500";
  const linkCls =
    tone === "dark" ? "underline hover:text-white" : "underline hover:text-zinc-800";

  return (
    <p className={cls}>
      Posted by{" "}
      {href ? (
        <Link href={href} className={linkCls}>
          {name}
        </Link>
      ) : (
        name
      )}
    </p>
  );
}
