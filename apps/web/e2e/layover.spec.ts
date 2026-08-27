import { expect, test } from "@playwright/test";
import { login, stamp } from "./helpers";

test.describe("layover day", () => {
  test("publish a day, then delete the day (recs stay)", async ({ page }) => {
    await login(page);
    const title = `E2E · day ${stamp()}`;
    let playbookId = "";

    try {
      await page.goto("/dashboard/playbooks/new");
      await page.locator('select[name="city_id"]').selectOption({
        label: "Zurich",
      });
      await page.locator('input[name="title"]').fill(title);
      await page.getByLabel("The day — story").fill("Walk, eat, go. E2E.");
      await page
        .getByRole("group", { name: "Stop 1" })
        .getByLabel("Title")
        .fill("First walk");
      await page
        .getByRole("button", { name: "Publish — live on the city" })
        .click();
      await page.waitForURL(/\/playbooks\/[0-9a-f-]{36}/, { timeout: 20_000 });
      playbookId = page.url().match(/\/playbooks\/([0-9a-f-]{36})/)?.[1] ?? "";
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByText("First walk")).toBeVisible();

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
