import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ReviewPlaceCard } from "@/features/ai-import/review-place";
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
      "id, user_id, created_place_ids, created_playbook_id, success, payload",
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
  const payload = (log.payload ?? {}) as {
    city_name?: string | null;
    city_airport?: string | null;
  };
  const newCityLabel =
    payload.city_name && payload.city_airport
      ? `${payload.city_name} (${String(payload.city_airport).toUpperCase()})`
      : null;
  const n = places.length;

  return (
    <AppShell profile={profile} title="File this layover">
      <p className="max-w-lg text-zinc-700">
        {n > 0 && playbook
          ? `I’ll file ${n} place${n === 1 ? "" : "s"} first, then the layover that strings them. Each rec needs a photo — yours, or I generate one if it’s worth a still.`
          : n > 0
            ? "This rec first. Photo from you, or I generate one if it sells."
            : "I filled what I heard."}
      </p>
      {newCityLabel ? (
        <p className="mt-2 text-sm text-zinc-600">
          {newCityLabel} is on the map now. City hero later — I don’t spend on
          that without you.
        </p>
      ) : null}
      <p className="mt-2 text-sm text-zinc-500">
        Drafts stay private until you publish each rec.
      </p>

      {places.length > 0 ? (
        <section className="mt-8 space-y-4">
          <h2 className="font-semibold">1. Places</h2>
          {places.map((p, i) => (
            <ReviewPlaceCard
              key={p.id}
              place={p}
              authorId={profile.id}
              index={i + 1}
              total={places.length}
            />
          ))}
        </section>
      ) : null}

      {playbook ? (
        <section className="mt-10">
          <h2 className="font-semibold">2. Then the layover</h2>
          <p className="mt-1 text-sm text-zinc-600">
            After the places have photos, save the day that strings them.
          </p>
          <Link
            href={`/dashboard/playbooks/${playbook.id}/edit`}
            className="mt-3 block rounded-2xl border border-zinc-200 bg-white px-4 py-4 hover:border-zinc-400"
          >
            <span className="font-medium">{playbook.title}</span>
            <span className="ml-2 text-sm text-zinc-400">({playbook.status})</span>
            {playbook.narrative ? (
              <p className="mt-2 text-sm text-zinc-600">{playbook.narrative}</p>
            ) : null}
          </Link>
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
