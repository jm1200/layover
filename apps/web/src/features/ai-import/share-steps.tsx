/** Where they are in Share your intel: talk → check words → check write-up → publish. */
export type ShareStep = 1 | 2 | 3 | 4;

export function ShareSteps({
  current,
  guest = false,
}: {
  current: ShareStep;
  /** Guests sign in at the last step. */
  guest?: boolean;
}) {
  const labels = [
    "Talk",
    "Check what we heard",
    "Check the write-up",
    guest ? "Sign in to publish" : "Publish",
  ];
  return (
    <ol
      aria-label="Steps"
      className="mb-6 grid max-w-lg grid-cols-4 gap-2"
    >
      {labels.map((label, i) => {
        const n = (i + 1) as ShareStep;
        const done = n < current;
        const now = n === current;
        return (
          <li
            key={label}
            aria-current={now ? "step" : undefined}
            className="flex flex-col gap-1.5"
          >
            <span
              className={
                now
                  ? "h-1 rounded-full bg-zinc-950"
                  : done
                    ? "h-1 rounded-full bg-zinc-400"
                    : "h-1 rounded-full bg-zinc-200"
              }
            />
            <span
              className={
                now
                  ? "text-[11px] font-bold leading-tight text-zinc-950 sm:text-xs"
                  : "text-[11px] leading-tight text-zinc-500 sm:text-xs"
              }
            >
              <span className="font-mono">{n}</span> {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
