import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { EditLayoverForm } from "@/features/playbooks/edit-layover-form";
import { getPlaybook, listStopsForPlaybook } from "@/features/playbooks/queries";
import { getPlace } from "@/features/places/queries";
import { stillForPlace } from "@/features/places/rec-media";

export default async function EditPlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const playbook = await getPlaybook(id);
  if (!playbook) notFound();
  if (profile.role !== "admin" && playbook.author_id !== profile.id) {
    redirect(`/playbooks/${id}`);
  }

  const stops = await listStopsForPlaybook(id);
  const stopRows = await Promise.all(
    stops.map(async (s) => {
      const rec = s.place_id ? await getPlace(s.place_id) : null;
      return {
        ...s,
        placeName: rec?.name ?? null,
        still: rec ? stillForPlace(rec)?.src ?? null : null,
      };
    }),
  );

  return (
    <AppShell profile={profile} title="Edit layover">
      <EditLayoverForm
        playbookId={id}
        defaults={{
          title: playbook.title,
          narrative: playbook.narrative,
          hours_available: playbook.hours_available,
        }}
        initialStops={stopRows}
      />
    </AppShell>
  );
}
