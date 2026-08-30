import { expect, test } from "@playwright/test";
import { login, stamp, STILL } from "./helpers";

const LIMMAT = "/places/c1000000-0000-4000-8000-000000000001";

test.describe("author page", () => {
  test("seed rec byline is Crew and not a link", async ({ page }) => {
    await page.goto(LIMMAT);
    await expect(page.getByText(/^Posted by /)).toBeVisible();
    await expect(page.getByRole("link", { name: "Crew" })).toHaveCount(0);
  });

  test("logged-in user can name themselves and open their page from the byline", async ({
    page,
  }) => {
    await login(page);
    const name = `E2E ${stamp()}`;

    await page.getByLabel("Account").click();
    await page.getByRole("link", { name: "Profile" }).click();
    await page.waitForURL(/\/u\/[0-9a-f-]{36}/, { timeout: 15_000 });
    await expect(page.getByText("Where they've been.")).toBeVisible();

    await page.getByRole("link", { name: "Edit" }).click();
    await expect(
      page.getByRole("heading", { name: "Name and photo" }),
    ).toBeVisible();
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save" }).click();

    const needSql = page.getByText(/020_author/);
    await expect(
      page.getByRole("heading", { name }).or(needSql),
    ).toBeVisible({ timeout: 15_000 });
    test.skip(
      (await needSql.count()) > 0,
      "Paste 020_author.sql in the Supabase SQL Editor, then re-run.",
    );

    await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.getByRole("link", { name: "Edit" }).click();
    await page.locator('input[type="file"]').first().setInputFiles(STILL);
    await expect(page.getByRole("button", { name: "Remove" })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible({
      timeout: 15_000,
    });
  });
});
