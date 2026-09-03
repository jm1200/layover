import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asRole, homeForRole } from "@/features/auth/get-profile";
import { touchLastSeen } from "@/features/auth/touch-last-seen";
import { safeNextPath } from "@/features/auth/paths";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let path = "/dashboard";
  if (user) {
    await touchLastSeen(supabase, user.id);
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.role) {
      path = homeForRole(asRole(data.role));
    }
  }

  return NextResponse.redirect(`${origin}${path}`);
}
