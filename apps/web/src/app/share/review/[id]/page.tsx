import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { recKindFromCategory, REC_KIND_LABEL } from "@/features/places/kind";
import { getPlace } from "@/features/places/queries";
import { getPlaybook } from "@/features/playbooks/queries";

export default async function ShareReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const supabase = await createClient();
  const { data: log } = await supabase
    .from("ai_import_logs")
    .select(
      "id, user_id, created_place_ids, created_playbook_id, success",
    )
    .eq("id", id)
    .maybeSingle();
  if (!log || !log.success) notFound();
  if (profile.role !== "admin" && log.user_id !== profile.id) {
    redirect("/dashboard");
  }

  const placeIds = (log.created_place_ids ?? []) as string[];
  const places = (
    await Promise.all(placeIds.map((pid) => getPlace(pid)))
  ).filter((p) => p !== null);
  const playbook = log.created_playbook_id
    ? await getPlaybook(log.created_playbook_id)
    : null;

  return (
    <AppShell profile={profile} title="Your draft">
      <p className="max-w-lg text-zinc-700">
        I filled what I heard. Tap the blanks, add a pic later, publish.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        These stay private until you hit publish on each rec.
      </p>

      {playbook ? (
        <section className="mt-8">
          <h2 className="font-semibold">Full layover</h2>
          <Link
            href={`/dashboard/playbooks/${playbook.id}/edit`}
            className="mt-2 inline-block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
          >
            {playbook.title}
            <span className="ml-2 text-sm text-zinc-400">({playbook.status})</span>
          </Link>
        </section>
      ) : null}

      {places.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-semibold">Places</h2>
          <ul className="mt-2 space-y-2">
            {places.map((p) => (
              <li key={p.id}>
                <Link
                  href={
                    p.author_id === profile.id
                      ? `/dashboard/places/${p.id}/edit`
                      : `/places/${p.id}`
                  }
                  className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
                >
                  {p.name}{" "}
                  <span className="text-sm text-zinc-400">
                    ({REC_KIND_LABEL[recKindFromCategory(p.category)]} · {p.status})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!playbook && places.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          Nothing new to file — I linked an existing rec. Check Dashboard.
        </p>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href="/share" className="underline">
          Dump another
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </p>
    </AppShell>
  );
}
