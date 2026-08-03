import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { updatePlaybookMeta } from "@/features/playbooks/actions";
import { PlaybookForm } from "@/features/playbooks/playbook-form";
import { getPlaybook } from "@/features/playbooks/queries";
import { listCities, listPublishedPlaces } from "@/features/places/queries";

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

  const [cities, places] = await Promise.all([
    listCities(),
    listPublishedPlaces(),
  ]);
  const bound = updatePlaybookMeta.bind(null, id);

  return (
    <AppShell profile={profile} title="Edit playbook">
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
      <p className="mt-6 max-w-xl text-sm text-zinc-500">
        Stop list editing is create-time only in this cut. To rebuild stops,
        create a new playbook version later.
      </p>
    </AppShell>
  );
}
