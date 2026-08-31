import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/features/auth/get-profile";
import { SiteHeader } from "@/features/auth/site-header";

export const metadata: Metadata = {
  title: "Privacy · Layover Intel",
};

export default async function PrivacyPage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <SiteHeader profile={profile} tone="light" />
      <main className="mx-auto max-w-xl px-4 py-12 text-sm leading-relaxed text-zinc-700">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Privacy
        </h1>
        <p className="mt-4">
          Layover Intel is a site for crew layover tips: where to eat, what to
          do, what to buy, and full days.
        </p>
        <p className="mt-4">
          If you continue with Google, we get your email and name so we can
          sign you in. We may store a profile photo if you choose to use your
          Google photo. We do not read your Gmail. We do not post as you. We
          do not sell that.
        </p>
        <p className="mt-4">
          Recs, notes, and pictures you upload are stored so they can show on
          the site. Notes and dumps are checked so crew hotels and adult
          content stay off the public pages.
        </p>
        <p className="mt-4">
          You can take your recs and notes off. Questions: the support email
          on the Google sign-in screen.
        </p>
        <p className="mt-8">
          <Link href="/" className="underline">
            Layover
          </Link>
        </p>
      </main>
    </div>
  );
}
