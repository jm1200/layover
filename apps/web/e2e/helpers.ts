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

export async function login(page: Page) {
  const user = await ensureE2eUser();
  test.skip(!user, HUMAN_E2E_USER);
  if (!user) return;

  await page.goto("/login");
  if (/\/dashboard/.test(page.url())) return;

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Yours" })).toBeVisible({
    timeout: 20_000,
  });
}

export function stamp() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

export const STILL = path.join(process.cwd(), "e2e/fixtures/still.jpg");
