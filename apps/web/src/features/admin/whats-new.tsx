import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Intel = {
  kind: string;
  id: string;
  title: string;
  city_name: string | null;
  author_name: string | null;
  author_id: string | null;
  posted_at: string;
};

function shortDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function WhatsNew() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_new_intel");

  if (error) {
    console.warn("[admin_new_intel]", error.message);
    return (
      <section className="mt-10">
        <h2 className="font-semibold">What’s new</h2>
        <p className="mt-2 text-sm text-zinc-500">Can’t read what’s new.</p>
      </section>
    );
  }

  const rows = (data ?? []) as Intel[];

  return (
    <section className="mt-10">
      <h2 className="font-semibold">What’s new</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nothing on the map yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {rows.map((r) => {
            const href = r.kind === "day" ? `/playbooks/${r.id}` : `/places/${r.id}`;
            const when = shortDay(r.posted_at);
            const who = r.author_name?.trim() || "Crew";
            return (
              <li key={`${r.kind}-${r.id}`} className="px-4 py-3 text-sm">
                <p>
                  <Link href={href} className="font-semibold hover:underline">
                    {r.title || (r.kind === "day" ? "a day" : "a rec")}
                  </Link>
                  {r.city_name ? ` in ${r.city_name}` : null}
                </p>
                <p className="mt-1 text-zinc-500">
                  {r.author_id ? (
                    <Link href={`/u/${r.author_id}`} className="hover:underline">
                      {who}
                    </Link>
                  ) : (
                    who
                  )}
                  {when ? ` · Posted ${when}` : null}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
