export function Byline({
  name,
  tone = "light",
}: {
  name: string;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={
        tone === "dark"
          ? "mt-3 text-sm text-white/70"
          : "mt-2 text-sm text-zinc-500"
      }
    >
      Posted by {name}
    </p>
  );
}
