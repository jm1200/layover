import { expect, test } from "@playwright/test";
import { insertPublishedDay, login, stamp } from "./helpers";

test.describe("layover day", () => {
  test("publish a day, then delete the day (recs stay)", async ({ page }) => {
    await login(page);
    const title = `E2E · day ${stamp()}`;
    const day = await insertPublishedDay(title);
    test.skip(!day, "Need an email user and Zurich to file a test day.");
    if (!day) return;
    let playbookId = day.id;

    try {
      await page.goto(`/playbooks/${playbookId}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByText("First walk")).toBeVisible();

      await page.getByRole("link", { name: "Edit" }).click();
      await expect(page.getByRole("heading", { name: "Edit layover" })).toBeVisible();
      await page.getByRole("button", { name: "Down" }).first().click();
      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForURL(/\/playbooks\/[0-9a-f-]{36}/, { timeout: 20_000 });
      const stopTitles = page.locator("main h2");
      await expect(stopTitles.nth(0)).toHaveText("Second coffee");
      await expect(stopTitles.nth(1)).toHaveText("First walk");

      await page.goto("/dashboard");
      await expect(page.getByRole("link", { name: title })).toBeVisible();

      await page.goto(`/dashboard/playbooks/${playbookId}/edit`);
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: "Take this day off" }).click();
      await page.waitForURL(/\/cities/, { timeout: 20_000 });
      playbookId = "";

      await page.goto("/dashboard");
      await expect(page.getByRole("link", { name: title })).toHaveCount(0);
    } finally {
      if (playbookId) {
        await page.goto(`/dashboard/playbooks/${playbookId}/edit`);
        if (await page.getByRole("button", { name: "Take this day off" }).count()) {
          page.once("dialog", (d) => d.accept());
          await page.getByRole("button", { name: "Take this day off" }).click();
          await page.waitForURL(/\/cities/, { timeout: 20_000 }).catch(() => {});
        }
      }
    }
  });
});
