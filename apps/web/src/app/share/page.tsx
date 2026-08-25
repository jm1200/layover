import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireUser } from "@/features/auth/get-profile";
import { DumpBox } from "@/features/ai-import/dump-box";
import { getCityBySlug } from "@/features/places/queries";

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { profile, error } = await requireUser();
  if (error === "unauthenticated") redirect("/login?next=/share");
  if (error === "suspended" || !profile) redirect("/dashboard");

  const { city: slug } = await searchParams;
  const city = slug ? await getCityBySlug(slug) : null;

  return (
    <AppShell profile={profile} title="Share your intel">
      <p className="mb-6 max-w-lg text-zinc-600">
        Talk once. She looks up the places and fills the form. You tap the
        blanks and publish.
      </p>
      <DumpBox citySlug={city?.slug} cityName={city?.name} />
    </AppShell>
  );
}
