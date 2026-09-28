import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { getProfile } from "@/features/auth/get-profile";
import { GoogleButton } from "@/features/auth/google-button";
import { TOOK_OUT_HOTEL } from "@/features/ai-import/copy";
import { readGuestDraft } from "@/features/ai-import/guest";
import {
  lodgingLeak,
  nameIsOnlyLodging,
  scrubLodging,
} from "@/features/ai-import/moderate";
import { REC_KIND_LABEL } from "@/features/places/kind";
import { createClient } from "@/lib/supabase/server";

const CLAIM = "/share/claim";

type Item = {
  name: string;
  kind: "eat" | "do" | "shop";
  blurb: string | null;
  dish: string | null;
};

/** Guest sees what Lumen wrote. Signing in files it; nothing is on the site yet. */
export default async function SharePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (profile) redirect(CLAIM);

  const supabase = await createClient();
  const draft = await readGuestDraft(supabase, id);
  if (!draft) notFound();
  const x = draft.extract;

  const stops = (x.stops ?? []).filter(
    (s) => s.name.trim() && s.found && !nameIsOnlyLodging(s.name),
  );
  // Same rules as filing, minus the fallbacks: a name that scrubs to nothing is dropped.
  const raw =
    x.post_kind === "place"
      ? [{ name: x.name ?? "", category: x.category, blurb: x.blurb, dish_name: x.dish_name }]
      : stops;
  const items: Item[] = raw.flatMap((s) => {
    const name = scrubLodging(s.name.trim());
    const unconfirmed =
      x.post_kind === "place" && (!s.category || x.found === false);
    if (!name || nameIsOnlyLodging(s.name) || unconfirmed) return [];
    return [
      {
        name,
        kind: s.category ?? "do",
        blurb: scrubLodging(s.blurb),
        dish: scrubLodging(s.dish_name),
      },
    ];
  });
  const title = scrubLodging(x.title);
  const day =
    x.post_kind === "playbook"
      ? scrubLodging((x.narrative ?? "").trim() || (draft.story ?? "").trim())
      : null;
  const city = [
    x.city_name?.trim(),
    x.city_airport ? x.city_airport.toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const tookOutHotel = x.took_out_hotel || lodgingLeak(draft.story ?? "");

  return (
    <AppShell profile={null} title="Here’s your write-up">
      <p className="max-w-lg text-zinc-700">
        Sign in to publish. It goes on the city and into your collection.
      </p>
      {tookOutHotel ? (
        <p
          className="mt-4 max-w-lg rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950"
          role="status"
        >
          {TOOK_OUT_HOTEL}
        </p>
      ) : null}

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        {city ? (
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
            {city}
          </p>
        ) : null}
        {x.post_kind === "playbook" && title ? (
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {title}
          </h2>
        ) : null}
        {day ? (
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-700">
            {day}
          </p>
        ) : null}
        <ul className="mt-4 space-y-5">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                {x.post_kind === "playbook" ? `${i + 1} · ` : ""}
                {REC_KIND_LABEL[it.kind]}
              </p>
              <p className="mt-1 text-lg font-semibold">{it.name}</p>
              {it.blurb ? (
                <p className="mt-1 leading-relaxed text-zinc-700">{it.blurb}</p>
              ) : null}
              {it.dish && it.kind !== "do" ? (
                <p className="mt-1 text-sm text-zinc-500">Get this: {it.dish}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 flex max-w-sm flex-col gap-4">
        <p className="text-sm text-zinc-600">
          After you sign in you can edit it, add photos, then publish.
        </p>
        <GoogleButton next={CLAIM} label="Continue with Google to publish" />
        <p className="text-center text-sm text-zinc-500">
          <Link
            href={`/login?next=${encodeURIComponent(CLAIM)}`}
            className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            Use email instead
          </Link>
        </p>
        <p className="text-center text-sm text-zinc-400">
          <Link href="/share" className="hover:text-zinc-700">
            Start over
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
