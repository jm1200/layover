import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/features/auth/site-header";
import { getProfile } from "@/features/auth/get-profile";
import { NamePhotoForm } from "@/features/social/name-photo-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/u/${id}/edit`)}`);
  if (profile.id !== id) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = user?.user_metadata ?? {};
  const googlePic = String(meta.picture ?? meta.avatar_url ?? "").trim();
  const hasGooglePhoto = Boolean(googlePic) && !googlePic.startsWith("//");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <SiteHeader profile={profile} tone="light" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Name and photo</h1>
        <p className="mt-1 text-zinc-600">This is Posted by.</p>
        <NamePhotoForm
          userId={profile.id}
          name={profile.display_name ?? ""}
          avatarUrl={profile.avatar_url}
          hasGooglePhoto={hasGooglePhoto}
        />
      </main>
    </div>
  );
}
