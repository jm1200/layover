import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ReviewQueue } from "@/features/ai-import/review-place";
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
          ? `I’ll file ${n} place${n === 1 ? "" : "s"} first — one at a time — then the layover that strings them.`
          : n > 0
            ? "This rec first. Edit the blurb if you want, then publish."
            : "I filled what I heard."}
      </p>
      {newCityLabel ? (
        <p className="mt-2 text-sm text-zinc-600">
          {newCityLabel} is on the map now. I’ll put a city hero up when you
          publish.
        </p>
      ) : null}
      <p className="mt-2 text-sm text-zinc-500">
        Nothing goes live until you hit Publish.
      </p>

      <ReviewQueue
        places={places}
        playbook={playbook}
        authorId={profile.id}
        logId={log.id}
      />

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
