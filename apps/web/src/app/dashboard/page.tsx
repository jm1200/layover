import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import {
  recKindFromCategory,
  REC_KIND_LABEL,
} from "@/features/places/kind";
import { listCities } from "@/features/places/queries";
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

  const [myPlaybooks, myPlaces, cities] = await Promise.all([
    listMyPlaybooks(profile.id),
    listMyPlaces(profile.id),
    listCities(),
  ]);
  const cityName = (id: string) =>
    cities.find((c) => c.id === id)?.name ?? "";

  return (
    <AppShell profile={profile} title="Yours">
      <p className="text-zinc-600">What you put on the map.</p>

      <section className="mt-8">
        <h2 className="font-semibold">Your layovers</h2>
        {myPlaybooks.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No days yet. Dump one.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {myPlaybooks.map((pb) => (
              <li key={pb.id}>
                <Link
                  href={`/playbooks/${pb.id}`}
                  className="font-medium hover:underline"
                >
                  {pb.title}
                </Link>
                <p className="text-sm text-zinc-500">{cityName(pb.city_id)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Your recs</h2>
        {myPlaces.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No recs yet. Dump one.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {myPlaces.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/places/${p.id}`}
                  className="font-medium hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {cityName(p.city_id)} ·{" "}
                  {REC_KIND_LABEL[recKindFromCategory(p.category)]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm text-zinc-500">
        or type it yourself{" "}
        <Link href="/dashboard/places/new?kind=eat" className="underline">
          Eat
        </Link>
        {" · "}
        <Link href="/dashboard/places/new?kind=do" className="underline">
          Do
        </Link>
        {" · "}
        <Link href="/dashboard/places/new?kind=shop" className="underline">
          Buy
        </Link>
        {" · "}
        <Link href="/dashboard/playbooks/new" className="underline">
          Full layover
        </Link>
      </p>
    </AppShell>
  );
}
