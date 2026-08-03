import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import {
  listMyPlaces,
  listMyPlaybooks,
} from "@/features/playbooks/queries";

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
        Browse cities, add places, write playbooks. Zones only — no crew hotels.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/cities"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-medium"
        >
          Browse cities
        </Link>
        <Link
          href="/dashboard/places/new"
          className="rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white"
        >
          Add place
        </Link>
        <Link
          href="/dashboard/playbooks/new"
          className="rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white"
        >
          New playbook
        </Link>
        {profile.role === "admin" ? (
          <Link href="/admin" className="rounded-lg border px-3 py-2">
            Admin
          </Link>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="font-semibold">Your playbooks</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myPlaybooks.length === 0 ? (
            <li className="text-zinc-500">None yet.</li>
          ) : (
            myPlaybooks.map((pb) => (
              <li key={pb.id}>
                <Link
                  href={`/playbooks/${pb.id}`}
                  className="underline"
                >
                  {pb.title}
                </Link>{" "}
                <span className="text-zinc-400">({pb.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Your places</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myPlaces.length === 0 ? (
            <li className="text-zinc-500">None yet.</li>
          ) : (
            myPlaces.map((p) => (
              <li key={p.id}>
                <Link href={`/places/${p.id}`} className="underline">
                  {p.name}
                </Link>{" "}
                <span className="text-zinc-400">({p.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </AppShell>
  );
}
