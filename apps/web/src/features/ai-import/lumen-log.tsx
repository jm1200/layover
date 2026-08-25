import { createClient } from "@/lib/supabase/server";
import { monthlyCapUsd } from "@/lib/ai/xai";
import { monthSpentUsd } from "@/features/ai-import/spend";
import { listCities } from "@/features/places/queries";

type LogRow = {
  id: string;
  created_at: string;
  model: string | null;
  success: boolean;
  error_code: string | null;
  search_calls?: number | null;
  estimated_usd: number | string | null;
  city_id: string | null;
  created_place_ids: string[] | null;
  created_playbook_id: string | null;
  followup: boolean;
};

function whatSheDid(row: LogRow): string {
  switch (row.error_code) {
    case "still":
      return "Generated a still";
    case "city_hero":
      return "Generated a city hero";
    case "sell_blurb":
      return "Rewrote a blurb";
    case "blocked":
      return "Refused a dump";
    case "duplicate_plan":
      return "Wouldn’t copy a day";
    case "need_city":
      return "Asked which city";
    case "need_name":
      return "Couldn’t find the place";
    case "linked":
      return "Linked an existing rec";
    case "parse":
      return "Couldn’t read the dump";
    case "xai":
    case "missing_key":
      return "Nap / provider fail";
    case "write":
      return "Write failed";
    default:
      break;
  }
  if (row.success && row.created_playbook_id) return "Filed a layover";
  if (row.success && (row.created_place_ids?.length ?? 0) > 0) {
    const n = row.created_place_ids!.length;
    return n === 1 ? "Filed a rec" : `Filed ${n} recs`;
  }
  if (row.success) return "Dump ok";
  return "Failed";
}

function money(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v) || v <= 0) return "—";
  return `$${v.toFixed(v >= 0.01 ? 2 : 3)}`;
}

export async function LumenLog() {
  const supabase = await createClient();
  const spent = await monthSpentUsd(supabase);
  const cap = monthlyCapUsd();
  const cities = await listCities();
  const cityName = Object.fromEntries(cities.map((c) => [c.id, c.name]));

  const full = await supabase
    .from("ai_import_logs")
    .select(
      "id, created_at, model, success, error_code, search_calls, estimated_usd, city_id, created_place_ids, created_playbook_id, followup",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  const { data, error } = full.error
    ? await supabase
        .from("ai_import_logs")
        .select(
          "id, created_at, model, success, error_code, estimated_usd, city_id, created_place_ids, created_playbook_id, followup",
        )
        .order("created_at", { ascending: false })
        .limit(50)
    : full;
  if (error) {
    return (
      <section className="mt-8">
        <h2 className="font-semibold">What she’s been doing</h2>
        <p className="mt-2 text-sm text-zinc-500">Log isn’t readable yet.</p>
      </section>
    );
  }
  const rows = (data ?? []) as LogRow[];
  const refused = rows.filter((r) => r.error_code === "blocked").length;

  return (
    <section className="mt-8">
      <h2 className="font-semibold">What she’s been doing</h2>
      <p className="mt-1 text-sm text-zinc-600">
        This month: {money(spent)} of ${cap}
        {refused ? ` · ${refused} refused in this list` : ""}. Last 50 actions.
        No dump text here.
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nothing logged yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{whatSheDid(r)}</p>
              <p className="mt-0.5 text-zinc-500">
                {new Date(r.created_at).toLocaleString()}
                {r.city_id && cityName[r.city_id]
                  ? ` · ${cityName[r.city_id]}`
                  : ""}
                {r.search_calls
                  ? ` · ${r.search_calls} search${r.search_calls === 1 ? "" : "es"}`
                  : ""}
                {` · ${money(r.estimated_usd)}`}
                {r.followup ? " · follow-up" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
