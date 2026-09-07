import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const CREDS_PATH = path.join(process.cwd(), "e2e/.auth/creds.json");

export const HUMAN_E2E_USER = [
  "Playwright needs an email/password user (not Google).",
  "Either turn OFF Confirm email in Supabase → Authentication → Providers → Email, then re-run `npm run test:e2e`,",
  "or sign up a throwaway at http://localhost:3000/signup and put it in apps/web/.env.local:",
  "  E2E_EMAIL=you+e2e@whatever.com",
  "  E2E_PASSWORD=at-least-8-chars",
].join("\n");

type Creds = { email: string; password: string };

function readCredsFile(): Creds | null {
  if (!fs.existsSync(CREDS_PATH)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(CREDS_PATH, "utf8")) as Creds;
    if (parsed.email && parsed.password) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCreds(creds: Creds) {
  fs.mkdirSync(path.dirname(CREDS_PATH), { recursive: true });
  fs.writeFileSync(CREDS_PATH, JSON.stringify(creds, null, 2));
}

function wantedCreds(): Creds {
  const fromEnv =
    process.env.E2E_EMAIL && process.env.E2E_PASSWORD
      ? {
          email: process.env.E2E_EMAIL,
          password: process.env.E2E_PASSWORD,
        }
      : null;
  return fromEnv ?? readCredsFile() ?? {
    email: "layover.e2e.local@example.com",
    password: `LayoverE2E-${crypto.randomUUID().slice(0, 10)}aA1`,
  };
}

let cached: Creds | null | "missing" = null;

/** Sign in, or sign up once, a dedicated test user. Null = John has to help. */
export async function ensureE2eUser(): Promise<Creds | null> {
  if (cached === "missing") return null;
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    cached = "missing";
    return null;
  }

  const creds = wantedCreds();
  const supabase = createClient(url, anon);
  const signedIn = await supabase.auth.signInWithPassword(creds);
  if (signedIn.data.session) {
    writeCreds(creds);
    cached = creds;
    return creds;
  }

  const signedUp = await supabase.auth.signUp({
    email: creds.email,
    password: creds.password,
  });
  if (signedUp.data.session) {
    writeCreds(creds);
    cached = creds;
    return creds;
  }

  cached = "missing";
  return null;
}

export async function revealEmail(page: Page) {
  const toggle = page.getByRole("button", { name: /use email instead/i });
  if (await toggle.count()) await toggle.click();
}

export async function login(page: Page) {
  const user = await ensureE2eUser();
  test.skip(!user, HUMAN_E2E_USER);
  if (!user) return;

  await page.goto("/login");
  if (/\/dashboard/.test(page.url())) return;

  await revealEmail(page);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(
    page.getByRole("heading", { name: "Your recommendations" }),
  ).toBeVisible({
    timeout: 20_000,
  });
}

function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

/** New rec without the dead create form. Null = skip. */
export async function insertPublishedPlace(name: string): Promise<{
  id: string;
  name: string;
} | null> {
  const user = await ensureE2eUser();
  const supabase = supabaseAnon();
  if (!user || !supabase) return null;
  const signed = await supabase.auth.signInWithPassword(user);
  const uid = signed.data.user?.id;
  if (!uid) return null;
  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", "zurich")
    .maybeSingle();
  if (!city) return null;
  const { data: place, error } = await supabase
    .from("places")
    .insert({
      city_id: city.id,
      name,
      blurb: "Counter ham. E2E. Not a hotel.",
      category: "eat",
      status: "published",
      author_id: uid,
    })
    .select("id")
    .single();
  if (error || !place) {
    throw new Error(error?.message ?? "Could not insert test rec.");
  }
  return { id: place.id, name };
}

/** New day without the dead create form. Null = skip. */
export async function insertPublishedDay(title: string): Promise<{
  id: string;
  title: string;
} | null> {
  const user = await ensureE2eUser();
  const supabase = supabaseAnon();
  if (!user || !supabase) return null;
  const signed = await supabase.auth.signInWithPassword(user);
  const uid = signed.data.user?.id;
  if (!uid) return null;
  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", "zurich")
    .maybeSingle();
  if (!city) return null;
  const { data: pb, error } = await supabase
    .from("playbooks")
    .insert({
      city_id: city.id,
      title,
      narrative: "Walk, eat, go. E2E.",
      status: "published",
      author_id: uid,
    })
    .select("id")
    .single();
  if (error || !pb) {
    throw new Error(error?.message ?? "Could not insert test day.");
  }
  const { error: stopErr } = await supabase.from("playbook_stops").insert([
    {
      playbook_id: pb.id,
      position: 1,
      title: "First walk",
      body: null,
      place_id: null,
    },
    {
      playbook_id: pb.id,
      position: 2,
      title: "Second coffee",
      body: null,
      place_id: null,
    },
  ]);
  if (stopErr) {
    await supabase.from("playbooks").delete().eq("id", pb.id);
    throw new Error(stopErr.message);
  }
  return { id: pb.id, title };
}

/** Seed recs from 003/005. After 021 wipe these 404 — skip, don't fail the suite. */
export async function gotoSeed(page: Page, url: string) {
  const res = await page.goto(url);
  if (res?.status() === 404) {
    test.skip(
      true,
      "Demo recs were wiped (021). This test needs a published rec.",
    );
  }
}

export function stamp() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

export const STILL = path.join(process.cwd(), "e2e/fixtures/still.jpg");
