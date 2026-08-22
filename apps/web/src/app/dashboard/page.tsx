import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
} from "@/features/places/kind";
import {
  listMyPlaces,
  listMyPlaybooks,
} from "@/features/playbooks/queries";

const ADD_CARDS = [
  {
    href: "/dashboard/playbooks/new",
    title: "Full layover",
    body: "A stealable whole-day plan.",
  },
  {
    href: "/dashboard/places/new?kind=eat",
    title: "Eat",
    body: "Restaurant, bar, or a dish.",
  },
  {
    href: "/dashboard/places/new?kind=do",
    title: "Do",
    body: "An activity — float, climb, walk.",
  },
  {
    href: "/dashboard/places/new?kind=shop",
    title: "Buy",
    body: "A store or a thing to buy.",
  },
] as const;

export default async function DashboardPage() {
  const { profile, error } = await requireRole(["user", "sponsor", "admin"]);

  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended") {
    return <SuspendedPanel />;
  }
  if (error === "forbidden" || !profile) redirect("/login");

  const [myPlaybooks, myPlaces] = await Promise.all([
    listMyPlaybooks(profile.id),
    listMyPlaces(profile.id),
  ]);

  return (
    <AppShell profile={profile} title="Your dashboard">
      <p className="text-zinc-600">
        Browse cities. Add a full layover, or one eat / do / buy rec. Zones
        only — no crew hotels.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ADD_CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
          >
            <span className="font-medium">{c.title}</span>
            <p className="mt-1 text-sm text-zinc-500">{c.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/cities"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-medium"
        >
          Browse cities
        </Link>
        {profile.role === "admin" ? (
          <Link href="/admin" className="rounded-lg border px-3 py-2">
            Admin
          </Link>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="font-semibold">Your layover plans</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myPlaybooks.length === 0 ? (
            <li className="text-zinc-500">None yet.</li>
          ) : (
            myPlaybooks.map((pb) => (
              <li key={pb.id}>
                <Link href={`/playbooks/${pb.id}`} className="underline">
                  {pb.title}
                </Link>{" "}
                <span className="text-zinc-400">({pb.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Your recs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myPlaces.length === 0 ? (
            <li className="text-zinc-500">None yet.</li>
          ) : (
            myPlaces.map((p) => (
              <li key={p.id}>
                <Link href={`/places/${p.id}`} className="underline">
                  {p.name}
                </Link>{" "}
                <span className="text-zinc-400">
                  ({REC_KIND_LABEL[recKindFromCategory(p.category)]} · {p.status})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </AppShell>
  );
}
