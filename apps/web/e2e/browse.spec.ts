import { expect, test } from "@playwright/test";
import { gotoSeed } from "./helpers";

const LIMMAT = "/places/c1000000-0000-4000-8000-000000000001";

test.describe("public browse", () => {
  test("home has pitch and no hotel leak", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Layover Intel" }),
    ).toBeVisible();
    await expect(page.getByText("For Crew, By Crew.")).toBeVisible();
    await expect(page.getByText("Baseball steak in Santiago")).toHaveCount(0);
    await expect(page.getByText("Float the Limmat in Zurich")).toHaveCount(0);
    await expect(page.getByAltText(/floating the Limmat/i)).toHaveCount(0);
    await expect(page.getByText(/crew hotel/i)).toHaveCount(0);
  });

  test("cities and Zurich use zones, not hotels", async ({ page }) => {
    await page.goto("/cities");
    await expect(page.getByRole("heading", { name: "Cities" })).toBeVisible();
    await page.getByRole("link", { name: /Zurich/i }).first().click();
    await expect(page).toHaveURL(/\/cities\/zurich/);
    await expect(page.getByText("Full layover")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eat" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Buy" })).toBeVisible();
    await expect(page.getByText(/crew hotel/i)).toHaveCount(0);
    await expect(page.getByText(/airline hotel/i)).toHaveCount(0);
  });

  test("rec Photos includes the hero; tap blows it up; X closes", async ({
    page,
  }) => {
    await gotoSeed(page, LIMMAT);
    await expect(
      page.getByRole("heading", { name: /Limmat/i }),
    ).toBeVisible();
    const photos = page.getByRole("heading", { name: "Photos" });
    await expect(photos).toBeVisible();
    await page.getByRole("button", { name: /View / }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("share while logged out sends you to login", async ({ page }) => {
    await page.goto("/share");
    await expect(page).toHaveURL(/\/login/);
  });

  test("homepage share card has picture and pitch", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Layover Intel/,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      /For Crew, By Crew/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/landing\/hero\.jpg/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("city share card uses the city hero", async ({ page }) => {
    const res = await page.goto("/cities/zurich");
    if (res?.status() === 404) {
      test.skip(true, "Zurich isn’t on this database.");
    }
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /hero-zurich/,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      /River in summer/,
    );
  });
});
