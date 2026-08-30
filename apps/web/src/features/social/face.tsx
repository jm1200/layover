export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (
    words[0].slice(0, 1) + words[words.length - 1].slice(0, 1)
  ).toUpperCase();
}

export function FaceCircle({
  name,
  src,
  size,
  tone = "light",
}: {
  name: string;
  src?: string | null;
  size: "sm" | "lg";
  tone?: "light" | "dark";
}) {
  const px = size === "lg" ? "h-20 w-20 text-xl" : "h-9 w-9 text-xs";
  const fill =
    tone === "dark"
      ? "bg-white text-zinc-900"
      : "bg-zinc-800 text-white";
  const letters = initialsOf(name);

  if (src) {
    return (
      <span
        className={`relative inline-block shrink-0 overflow-hidden rounded-full ${px}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  if (letters) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${px} ${fill}`}
        aria-hidden
      >
        {letters}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${px} ${
        tone === "dark" ? "text-white/90" : "text-zinc-700"
      }`}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size === "lg" ? 36 : 18}
        height={size === "lg" ? 36 : 18}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.4 19.2c1.3-2.8 3.6-4.2 6.6-4.2s5.3 1.4 6.6 4.2" />
      </svg>
    </span>
  );
}
