import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { updatePlaybookMeta } from "@/features/playbooks/actions";
import { DeleteLayoverButton } from "@/features/playbooks/delete-layover-button";
import { PlaybookForm } from "@/features/playbooks/playbook-form";
import { StopsEditor } from "@/features/playbooks/stops-editor";
import { getPlaybook, listStopsForPlaybook } from "@/features/playbooks/queries";
import { getPlace, listCities, listPublishedPlaces } from "@/features/places/queries";
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

  const [cities, places, stops] = await Promise.all([
    listCities(),
    listPublishedPlaces(),
    listStopsForPlaybook(id),
  ]);
  const bound = updatePlaybookMeta.bind(null, id);
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
    <AppShell profile={profile} title="Edit layover plan">
      <PlaybookForm
        action={bound}
        cities={cities}
        places={places}
        defaults={{
          city_id: playbook.city_id,
          title: playbook.title,
          narrative: playbook.narrative,
          hours_available: playbook.hours_available,
          status: playbook.status,
        }}
        submitLabel="Save"
        allowHidden={profile.role === "admin"}
        metaOnly
      />
      <StopsEditor playbookId={id} initial={stopRows} />
      <DeleteLayoverButton playbookId={id} />
    </AppShell>
  );
}
