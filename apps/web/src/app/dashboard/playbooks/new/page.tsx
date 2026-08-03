import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { createPlaybook } from "@/features/playbooks/actions";
import { PlaybookForm } from "@/features/playbooks/playbook-form";
import { listCities, listPublishedPlaces } from "@/features/places/queries";

export default async function NewPlaybookPage() {
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const [cities, places] = await Promise.all([
    listCities(),
    listPublishedPlaces(),
  ]);

  return (
    <AppShell profile={profile} title="New playbook">
      <PlaybookForm
        action={createPlaybook}
        cities={cities}
        places={places}
        submitLabel="Create playbook"
      />
    </AppShell>
  );
}
