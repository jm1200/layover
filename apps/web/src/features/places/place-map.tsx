export function PlaceMap({ query }: { query: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  return (
    <iframe
      title="Map"
      src={src}
      className="h-80 w-full rounded-lg border-0 bg-zinc-100"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
