import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/features/auth/site-header";
import { getProfile } from "@/features/auth/get-profile";
import { FaceCircle } from "@/features/social/face";
import { authorCard } from "@/features/social/queries";
import {
  AuthorIntel,
  loadAuthorIntel,
} from "@/features/social/author-intel";
import { shareCard, SITE_NAME } from "@/lib/share-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = await authorCard(id);
  if (!card) return shareCard({ title: SITE_NAME });
  return shareCard({
    title: `${card.display_name} · ${SITE_NAME}`,
    description: "Where they've been.",
    path: `/u/${card.id}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [card, viewer] = await Promise.all([authorCard(id), getProfile()]);
  if (!card) notFound();

  const intel = await loadAuthorIntel(card.id);
  const mine = viewer?.id === card.id;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <SiteHeader profile={viewer} tone="light" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-4">
          <FaceCircle
            name={card.display_name}
            src={card.avatar_url}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {card.display_name}
            </h1>
            <p className="mt-1 text-zinc-600">Where they&apos;ve been.</p>
            {mine ? (
              <p className="mt-2 text-sm">
                <Link href={`/u/${card.id}/edit`} className="underline">
                  Edit
                </Link>
              </p>
            ) : null}
          </div>
        </div>

        {intel.cityIds.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-500">
            Nothing on the map yet.
          </p>
        ) : (
          <AuthorIntel {...intel} recsHeading={null} />
        )}
      </main>
    </div>
  );
}
