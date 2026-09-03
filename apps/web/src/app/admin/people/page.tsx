import { People } from "@/features/admin/people";
import { WhatsNew } from "@/features/admin/whats-new";
import { requireRole } from "@/features/auth/get-profile";

export default async function AdminPeoplePage() {
  const { profile, error } = await requireRole(["admin"]);
  if (error || !profile) return null;

  return (
    <>
      <People />
      <WhatsNew />
    </>
  );
}
