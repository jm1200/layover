import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { getProfile } from "@/features/auth/get-profile";
import { DumpBox } from "@/features/ai-import/dump-box";
import { guestHandle } from "@/features/ai-import/guest";
import { getCityBySlug } from "@/features/places/queries";

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  // No account to start. Signing in waits for Publish.
  const profile = await getProfile();
  if (profile?.status === "suspended") redirect("/dashboard");
  // Signed in with a guest write-up still waiting: file that one first.
  if (profile && (await guestHandle())) redirect("/share/claim");

  const { city: slug } = await searchParams;
  const city = slug ? await getCityBySlug(slug) : null;

  return (
    <AppShell profile={profile} title="Share your intel">
      <p className="mb-6 max-w-lg text-zinc-600">
        Talk it out — one place, a few, or the whole day. Doesn’t have
        to be pretty. City, plus a real name we can search. We’ll look
        it up and write it up. You check, then publish.
      </p>
      {profile ? null : (
        <p className="-mt-3 mb-6 text-sm text-zinc-500">
          No account needed to start. You’ll sign in when you publish.
        </p>
      )}
      <DumpBox citySlug={city?.slug} cityName={city?.name} />
    </AppShell>
  );
}
