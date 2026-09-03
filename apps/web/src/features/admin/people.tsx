import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Person = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  status: string;
  last_seen_at: string | null;
  recs: number | string;
  days: number | string;
};

function shortDay(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function postedLine(recsRaw: number | string, daysRaw: number | string) {
  const recs = Number(recsRaw) || 0;
  const days = Number(daysRaw) || 0;
  if (recs === 0 && days === 0) return "Nothing yet.";
  const bits: string[] = [];
  if (recs === 1) bits.push("1 rec");
  else if (recs > 1) bits.push(`${recs} recs`);
  if (days === 1) bits.push("1 day");
  else if (days > 1) bits.push(`${days} days`);
  return bits.join(" · ");
}

export async function People() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_people");

  if (error) {
    console.warn("[admin_people]", error.message);
    return (
      <section>
        <h2 className="font-semibold">People</h2>
        <p className="mt-2 text-sm text-zinc-500">Can’t read people.</p>
      </section>
    );
  }

  const rows = (data ?? []) as Person[];

  return (
    <section>
      <h2 className="font-semibold">People</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nobody yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {rows.map((p) => {
            const name = p.display_name?.trim() || "Crew";
            const seen = shortDay(p.last_seen_at);
            return (
              <li key={p.id} className="px-4 py-3 text-sm">
                <p>
                  <Link
                    href={`/u/${p.id}`}
                    className="font-semibold hover:underline"
                  >
                    {name}
                  </Link>
                  {p.status === "suspended" ? (
                    <span className="ml-2 text-zinc-500">Suspended</span>
                  ) : null}
                </p>
                {p.email ? (
                  <p className="mt-0.5 text-zinc-500">{p.email}</p>
                ) : null}
                <p className="mt-1 text-zinc-500">
                  {seen ? `Last in ${seen}` : "Hasn’t signed in."}
                  {" · "}
                  {postedLine(p.recs, p.days)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
