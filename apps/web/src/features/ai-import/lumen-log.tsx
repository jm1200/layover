import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCities } from "@/features/places/queries";

type LogRow = {
  id: string;
  created_at: string;
  success: boolean;
  error_code: string | null;
  estimated_usd: number | string | null;
  city_id: string | null;
  created_place_ids: string[] | null;
  created_playbook_id: string | null;
  payload: Record<string, unknown> | null;
};

type Named = { id: string; name: string; href: string };

type Cluster = { anchor: LogRow; extras: LogRow[] };

function postedDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function money(n: number | string | null | undefined): number {
  const v = Number(n ?? 0);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function placeIdFrom(row: LogRow): string | null {
  const fromCol = row.created_place_ids?.[0];
  if (fromCol) return fromCol;
  const pid = row.payload?.place_id;
  return typeof pid === "string" ? pid : null;
}

function Name({ item }: { item: Named }) {
  return (
    <Link href={item.href} className="font-semibold hover:underline">
      {item.name}
    </Link>
  );
}

function groupPosts(rows: LogRow[]): Cluster[] {
  const stills: LogRow[] = [];
  const heroes: LogRow[] = [];
  const anchors: LogRow[] = [];
  for (const r of rows) {
    if (r.error_code === "still") stills.push(r);
    else if (r.error_code === "city_hero") heroes.push(r);
    else anchors.push(r);
  }

  const clusters: Cluster[] = anchors.map((anchor) => ({
    anchor,
    extras: [],
  }));

  for (const still of stills) {
    const pid = placeIdFrom(still);
    const host = pid
      ? clusters.find((c) => (c.anchor.created_place_ids ?? []).includes(pid))
      : null;
    if (host) host.extras.push(still);
    else clusters.push({ anchor: still, extras: [] });
  }

  for (const hero of heroes) {
    const host = clusters
      .filter(
        (c) =>
          c.anchor.city_id === hero.city_id &&
          c.anchor.payload?.opened_city === true,
      )
      .sort(
        (a, b) =>
          Math.abs(
            +new Date(a.anchor.created_at) - +new Date(hero.created_at),
          ) -
          Math.abs(
            +new Date(b.anchor.created_at) - +new Date(hero.created_at),
          ),
      )[0];
    if (host) host.extras.push(hero);
    else clusters.push({ anchor: hero, extras: [] });
  }

  return clusters.sort(
    (a, b) =>
      +new Date(b.anchor.created_at) - +new Date(a.anchor.created_at),
  );
}

export async function LumenLog() {
  const supabase = await createClient();
  const cities = await listCities();
  const cityName = Object.fromEntries(cities.map((c) => [c.id, c.name]));
  const citySlug = Object.fromEntries(cities.map((c) => [c.id, c.slug]));

  const { data, error } = await supabase
    .from("ai_import_logs")
    .select(
      "id, created_at, success, error_code, estimated_usd, city_id, created_place_ids, created_playbook_id, payload",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <section className="mt-10">
        <h2 className="font-semibold">What she’s been doing</h2>
        <p className="mt-2 text-sm text-zinc-500">Can’t read her log.</p>
      </section>
    );
  }

  const rows = (data ?? []) as LogRow[];
  const clusters = groupPosts(rows).slice(0, 50);

  const placeIds = [
    ...new Set(
      clusters.flatMap((c) => [
        ...(c.anchor.created_place_ids ?? []),
        ...c.extras.flatMap((e) => e.created_place_ids ?? []),
        ...[c.anchor, ...c.extras]
          .map(placeIdFrom)
          .filter((id): id is string => Boolean(id)),
      ]),
    ),
  ];
  const playbookIds = [
    ...new Set(
      clusters
        .map((c) => c.anchor.created_playbook_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [{ data: placeRows }, { data: playbookRows }] = await Promise.all([
    placeIds.length
      ? supabase.from("places").select("id, name").in("id", placeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    playbookIds.length
      ? supabase.from("playbooks").select("id, title").in("id", playbookIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const places = Object.fromEntries(
    (placeRows ?? []).map((p) => [
      p.id,
      { id: p.id, name: p.name, href: `/places/${p.id}` } satisfies Named,
    ]),
  );
  const days = Object.fromEntries(
    (playbookRows ?? []).map((p) => [
      p.id,
      { id: p.id, name: p.title, href: `/playbooks/${p.id}` } satisfies Named,
    ]),
  );

  return (
    <section className="mt-10">
      <h2 className="font-semibold">What she’s been doing</h2>
      {clusters.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nothing yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {clusters.map((c) => {
            const r = c.anchor;
            const city = r.city_id ? cityName[r.city_id] : null;
            const slug = r.city_id ? citySlug[r.city_id] : null;
            const when = postedDay(r.created_at);
            const spent = [r, ...c.extras].reduce(
              (sum, x) => sum + money(x.estimated_usd),
              0,
            );
            const filed = Boolean(r.success) && r.error_code !== "still";
            const dateBit =
              filed || r.error_code === "still" || r.error_code === "city_hero"
                ? `Posted ${when}`
                : when;
            const inCity = city ? `in ${city}` : null;
            const recs = [
              ...new Set([
                ...(r.created_place_ids ?? []),
                ...c.extras.flatMap((e) => e.created_place_ids ?? []),
                ...[r, ...c.extras]
                  .map(placeIdFrom)
                  .filter((id): id is string => Boolean(id)),
              ]),
            ]
              .map((id) => places[id] ?? null)
              .filter((x): x is Named => Boolean(x));
            const gone =
              (r.created_place_ids ?? []).length > 0 && recs.length === 0;
            const day = r.created_playbook_id
              ? days[r.created_playbook_id]
              : null;
            const actions = whatSheDidList(c, recs.length, Boolean(day));
            const spentLabel = spent > 0 ? `$${spent.toFixed(2)}` : null;

            return (
              <li key={r.id} className="px-4 py-3 text-sm leading-relaxed">
                <p>
                  {headline(r, { recs, gone, day, city, slug, inCity })}
                </p>
                {actions.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-zinc-600">
                    {actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-1 text-zinc-500">
                  {[dateBit, spentLabel].filter(Boolean).join(" · ")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function whatSheDidList(
  c: Cluster,
  recCount: number,
  hasDay: boolean,
): string[] {
  const out: string[] = [];
  const codes = new Set(
    [c.anchor, ...c.extras].map((r) => r.error_code ?? ""),
  );
  if (c.anchor.success && !c.anchor.error_code) {
    if (hasDay) out.push("Filed the day");
    if (recCount === 1) out.push("Filed the rec");
    else if (recCount > 1) out.push(`Filed ${recCount} recs`);
  }
  if (codes.has("still")) out.push("Generated a still");
  if (codes.has("city_hero")) out.push("Put up a city hero");
  if (codes.has("linked")) out.push("Linked a rec already on the city");
  return out;
}

function headline(
  r: LogRow,
  ctx: {
    recs: Named[];
    gone: boolean;
    day: Named | null;
    city: string | null;
    slug: string | null;
    inCity: string | null;
  },
) {
  const { recs, gone, day, city, slug, inCity } = ctx;
  const recList = recs.map((p, i) => (
    <span key={p.id}>
      {i > 0 ? ", " : null}
      <Name item={p} />
    </span>
  ));

  switch (r.error_code) {
    case "still":
      return (
        <>
          Still for {recs[0] ? <Name item={recs[0]} /> : "a rec"} {inCity}
        </>
      );
    case "city_hero":
      return city && slug ? (
        <>
          City hero for{" "}
          <Link href={`/cities/${slug}`} className="font-semibold hover:underline">
            {city}
          </Link>
        </>
      ) : (
        <>City hero</>
      );
    case "blocked":
      return <>Wouldn’t file that</>;
    case "duplicate_plan":
      return (
        <>
          Same day — {day ? <Name item={day} /> : "a day"} {inCity}
        </>
      );
    case "need_city":
      return <>Asked which city</>;
    case "need_name":
      return <>What’s the place called?</>;
    case "linked":
      return (
        <>
          Already on the city — {recs[0] ? <Name item={recs[0]} /> : "a rec"}{" "}
          {inCity}
        </>
      );
    case "parse":
      return <>Couldn’t read that</>;
    case "xai":
    case "missing_key":
    case "over_cap":
    case "killed":
      return <>Lumen’s taking a nap</>;
    case "write":
      return recs.length ? (
        <>
          Write failed · {recList} {inCity}
        </>
      ) : (
        <>Write failed</>
      );
    default:
      break;
  }

  if (gone && !day) return <>Taken off the city</>;

  if (r.success && day) {
    return (
      <>
        <Name item={day} /> {inCity}
        {recs.length ? (
          <>
            {" · "}
            {recs.map((p, i) => (
              <span key={p.id}>
                {i > 0 ? " · " : null}
                <Name item={p} />
              </span>
            ))}
          </>
        ) : null}
      </>
    );
  }

  if (r.success && recs.length > 0) {
    return (
      <>
        {recList} {inCity}
      </>
    );
  }

  return <>Didn’t land</>;
}
