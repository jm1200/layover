import { expect, test } from "@playwright/test";
import { login, stamp, STILL } from "./helpers";

const LIMMAT = "/places/c1000000-0000-4000-8000-000000000001";
const ZRH_DAY = "/playbooks/e1000000-0000-4000-8000-000000000001";

test.describe("like, comment, byline", () => {
  test("public rec and day show a byline and comments", async ({ page }) => {
    await page.goto(LIMMAT);
    await expect(page.getByText(/^Posted by /)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
    await page.goto(ZRH_DAY);
    await expect(page.getByText(/^Posted by /)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
  });

  test("logged-in user can like, comment, edit, and add photos", async ({
    page,
  }) => {
    await login(page);
    const note = `E2E note ${stamp()}`;
    const edited = `E2E edited ${stamp()}`;

    await page.goto(LIMMAT);
    await page.getByRole("button", { name: "Like" }).click();
    const unlike = page.getByRole("button", { name: "Unlike" });
    const needSql = page.getByText(/018_social|019_comments/);
    await expect(unlike.or(needSql)).toBeVisible({ timeout: 15_000 });
    test.skip(
      (await needSql.count()) > 0,
      "Paste 018_social.sql then 019_comments.sql in the Supabase SQL Editor, then re-run.",
    );
    await expect(unlike).toBeVisible();
    await page.getByRole("button", { name: "Unlike" }).click();
    await expect(page.getByRole("button", { name: "Like" })).toBeVisible();

    const recComments = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Comments" }) });
    await recComments.getByPlaceholder("Been? Add a line.").fill(
      "Stay at the crew hotel.",
    );
    await recComments.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText("Zones, not hotels.")).toBeVisible({
      timeout: 15_000,
    });

    await recComments.getByPlaceholder("Been? Add a line.").fill(note);
    await recComments.locator("form input[type='file']").first().setInputFiles(STILL);
    await expect(recComments.getByRole("button", { name: "Remove photo" })).toBeVisible({
      timeout: 30_000,
    });
    await recComments.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText(note).or(needSql)).toBeVisible({
      timeout: 15_000,
    });
    test.skip(
      (await needSql.count()) > 0,
      "Paste 018_social.sql then 019_comments.sql in the Supabase SQL Editor, then re-run.",
    );
    await expect(page.getByText(note)).toBeVisible();
    await expect(
      recComments.getByRole("button", { name: "View photo" }).first(),
    ).toBeVisible();

    await recComments.getByRole("button", { name: "Edit note" }).last().click();
    await recComments.getByRole("textbox", { name: "Edit note" }).fill(edited);
    await recComments.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByText(edited)).toBeVisible({ timeout: 15_000 });
    await recComments.getByRole("button", { name: "Remove note" }).last().click();
    await expect(page.getByText(edited)).toHaveCount(0);

    await page.goto(ZRH_DAY);
    await page.getByRole("button", { name: "Like" }).click();
    await expect(page.getByRole("button", { name: "Unlike" })).toBeVisible({
      timeout: 15_000,
    });
    const dayComments = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Comments" }) });
    await dayComments.getByPlaceholder("Been? Add a line.").fill(note);
    await dayComments.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText(note)).toBeVisible({ timeout: 15_000 });
    await dayComments.getByRole("button", { name: "Remove note" }).last().click();
    await expect(page.getByText(note)).toHaveCount(0);
  });
});
