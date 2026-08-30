import { expect, test } from "@playwright/test";
import { login, stamp } from "./helpers";

const LIMMAT = "/places/c1000000-0000-4000-8000-000000000001";
const ZRH_DAY = "/playbooks/e1000000-0000-4000-8000-000000000001";

test.describe("like, comment, byline", () => {
  test("public rec and day show a byline", async ({ page }) => {
    await page.goto(LIMMAT);
    await expect(page.getByText(/^Posted by /)).toBeVisible();
    await page.goto(ZRH_DAY);
    await expect(page.getByText(/^Posted by /)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
  });

  test("logged-in user can like a rec and comment on a day", async ({
    page,
  }) => {
    await login(page);
    const note = `E2E note ${stamp()}`;

    await page.goto(LIMMAT);
    await page.getByRole("button", { name: "Like" }).click();
    const unlike = page.getByRole("button", { name: "Unlike" });
    const needSql = page.getByText(/018_social/);
    await expect(unlike.or(needSql)).toBeVisible({ timeout: 15_000 });
    test.skip(
      (await needSql.count()) > 0,
      "Paste 018_social.sql in the Supabase SQL Editor, then re-run.",
    );
    await expect(unlike).toBeVisible();
    await page.getByRole("button", { name: "Unlike" }).click();
    await expect(page.getByRole("button", { name: "Like" })).toBeVisible();

    await page.goto(ZRH_DAY);
    await page.getByRole("button", { name: "Like" }).click();
    await expect(page.getByRole("button", { name: "Unlike" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByPlaceholder("Been? Add a line.").fill(note);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(note)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Take off" }).last().click();
    await expect(page.getByText(note)).toHaveCount(0);
  });
});
