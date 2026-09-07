export function AlreadyBanner({ kind }: { kind: "place" | "day" }) {
  const line =
    kind === "place"
      ? "That’s already in. Tell us your experience."
      : "This day’s already in. Tell us how it went.";
  return (
    <p
      className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950"
      role="status"
    >
      {line}
    </p>
  );
}
