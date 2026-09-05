import type { Metadata } from "next";
import { headers } from "next/headers";

export const SITE_NAME = "Layover Intel";
export const SITE_DESCRIPTION = "Layover Intel — For Crew, By Crew.";
export const DEFAULT_SHARE_IMAGE = "/landing/hero.jpg";
const DEFAULT_SHARE_SIZE = { width: 1280, height: 720 };

const DESC_MAX = 200;

export function siteUrl(): URL {
  const raw = siteOrigin();
  try {
    return new URL(new URL(raw).origin);
  } catch {
    return new URL("http://localhost:3000");
  }
}

/** Host the crawler actually hit. Apex currently 308s to www; Facebook drops redirected og:image. */
export async function publicSiteUrl(): Promise<URL> {
  try {
    const h = await headers();
    const raw = h.get("x-forwarded-host") || h.get("host");
    const host = raw?.split(",")[0]?.trim();
    if (host && !/^localhost(:\d+)?$/i.test(host) && !host.startsWith("127.0.0.1")) {
      const proto =
        h.get("x-forwarded-proto") ||
        (host.includes("localhost") ? "http" : "https");
      return new URL(`${proto}://${host}`);
    }
  } catch {
    /* build / static */
  }
  return siteUrl();
}

function withHttps(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isLocalhost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function vercelOrigin(): string | null {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return withHttps(prod);
  const deploy = process.env.VERCEL_URL?.trim();
  if (deploy) return withHttps(deploy);
  return null;
}

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = vercelOrigin();
  if (fromEnv) {
    const normalized = withHttps(fromEnv);
    const leftoverLocal =
      isLocalhost(normalized) && process.env.VERCEL_ENV === "production";
    if (!leftoverLocal) return normalized;
    if (vercel) return vercel;
  }
  if (vercel) return vercel;
  return "http://localhost:3000";
}

function clipShareText(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= DESC_MAX) return t;
  return `${t.slice(0, DESC_MAX - 1).trimEnd()}...`;
}

/** Title, blurb, and picture for iMessage / WhatsApp / Slack / X. */
export function shareCard(input: {
  title: string;
  description?: string | null;
  image?: string | null;
  path?: string;
}): Metadata {
  const title = input.title.trim() || SITE_NAME;
  const description = clipShareText(input.description) ?? SITE_DESCRIPTION;
  const image = input.image?.trim() || DEFAULT_SHARE_IMAGE;
  const sized =
    image === DEFAULT_SHARE_IMAGE || image.endsWith("/landing/hero.jpg");
  const images = sized
    ? [{ url: image, alt: title, ...DEFAULT_SHARE_SIZE }]
    : [{ url: image, alt: title }];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      ...(input.path ? { url: input.path } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
