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
};

type Named = { id: string; name: string; href: string };

function postedDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function money(n: number | string | null | undefined): string | null {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v) || v <= 0) return null;
  return `$${v.toFixed(2)}`;
}

function Name({ item }: { item: Named | { name: string } }) {
  if ("href" in item) {
    return (
      <Link href={item.href} className="font-semibold hover:underline">
        {item.name}
      </Link>
    );
  }
  return <span className="font-semibold">{item.name}</span>;
}

function Bits({
  parts,
}: {
  parts: (string | null | undefined)[];
}) {
  const clean = parts.filter((p): p is string => Boolean(p && p.trim()));
  return <>{clean.join(" · ")}</>;
}

export async function LumenLog() {
  const supabase = await createClient();
  const cities = await listCities();
  const cityName = Object.fromEntries(cities.map((c) => [c.id, c.name]));
  const citySlug = Object.fromEntries(cities.map((c) => [c.id, c.slug]));

  const { data, error } = await supabase
    .from("ai_import_logs")
    .select(
      "id, created_at, success, error_code, estimated_usd, city_id, created_place_ids, created_playbook_id",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <section className="mt-10">
        <h2 className="font-semibold">What she’s been doing</h2>
        <p className="mt-2 text-sm text-zinc-500">Can’t read her log.</p>
      </section>
    );
  }

  const rows = (data ?? []) as LogRow[];
  const placeIds = [...new Set(rows.flatMap((r) => r.created_place_ids ?? []))];
  const playbookIds = [
    ...new Set(rows.map((r) => r.created_playbook_id).filter(Boolean)),
  ] as string[];

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
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nothing yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {rows.map((r) => {
            const city = r.city_id ? cityName[r.city_id] : null;
            const slug = r.city_id ? citySlug[r.city_id] : null;
            const when = postedDay(r.created_at);
            const spent = money(r.estimated_usd);
            const filed = Boolean(r.success);
            const dateBit = filed ? `Posted ${when}` : when;
            const inCity = city ? `in ${city}` : null;
            const recs = (r.created_place_ids ?? [])
              .map((id) => places[id] ?? null)
              .filter((x): x is Named => Boolean(x));
            const gone =
              (r.created_place_ids ?? []).length > 0 && recs.length === 0;
            const day = r.created_playbook_id
              ? days[r.created_playbook_id]
              : null;

            return (
              <li key={r.id} className="px-4 py-3 text-sm leading-relaxed">
                <p>{line(r, { recs, gone, day, city, slug, inCity })}</p>
                <p className="mt-0.5 text-zinc-500">
                  <Bits parts={[dateBit, spent]} />
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function line(
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
          Still for {recs[0] ? <Name item={recs[0]} /> : "a rec"}{" "}
          {inCity}
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
        Filed <Name item={day} /> {inCity}
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
        Filed {recList} {inCity}
      </>
    );
  }

  if (r.success) return <>Didn’t land</>;
  return <>Didn’t land</>;
}
