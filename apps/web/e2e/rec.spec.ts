import { expect, test } from "@playwright/test";
import { login, stamp, STILL } from "./helpers";

test.describe("rec create / photos / save / delete", () => {
  test("author can post, zoom, edit Get this, and take it off", async ({
    page,
  }) => {
    await login(page);
    const name = `E2E · ham ${stamp()}`;
    let placeId = "";

    try {
      await page.goto("/dashboard/places/new?kind=eat");
      await page.locator('select[name="city_id"]').selectOption({
        label: "Zurich",
      });
      await page.getByRole("textbox", { name: "Name", exact: true }).fill(name);
      await page.getByLabel("Blurb").fill("Counter ham. E2E. Not a hotel.");
      await page.getByRole("button", { name: "Create" }).click();
      await page.waitForURL(/\/places\/[0-9a-f-]{36}/, { timeout: 20_000 });
      placeId = page.url().match(/\/places\/([0-9a-f-]{36})/)?.[1] ?? "";
      await expect(page.getByRole("heading", { name })).toBeVisible();

      await page.getByRole("link", { name: "Edit" }).click();
      await expect(page.getByRole("heading", { name: "Edit" })).toBeVisible();
      await expect(page.locator('input[type="file"]').first()).toHaveAttribute(
        "multiple",
      );
      await page
        .locator('input[type="file"]')
        .first()
        .setInputFiles([STILL, STILL]);
      await expect(
        page.getByRole("button", { name: "Remove photo" }),
      ).toHaveCount(2, { timeout: 30_000 });
      await page.getByRole("button", { name: "Remove photo" }).first().click();
      await expect(page.getByRole("button", { name: "Remove photo" })).toHaveCount(
        1,
      );
      await page.getByRole("button", { name: "Remove photo" }).click();
      await expect(page.getByRole("button", { name: "Remove photo" })).toHaveCount(
        0,
      );
      await expect(page.getByText("Add photos (max 3)").first()).toBeVisible();
      await page.locator('input[type="file"]').first().setInputFiles(STILL);
      await expect(page.getByText("Hero")).toBeVisible({ timeout: 30_000 });

      await page.getByPlaceholder("Filet, the dip…").fill("Ibérico");
      await page.getByRole("button", { name: "Add" }).click();
      await expect(
        page.getByRole("textbox", { name: "Get this name" }),
      ).toHaveValue("Ibérico");

      await page.getByLabel("Blurb").fill("Saved blurb from E2E.");
      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForURL(new RegExp(`/places/${placeId}`), {
        timeout: 20_000,
      });
      await expect(page.getByText("Saved blurb from E2E.")).toBeVisible();
      await expect(page.getByText("Ibérico")).toBeVisible();

      await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
      const thumbs = page.locator("main").getByRole("button", { name: /View / });
      await expect(thumbs).toHaveCount(1);
      await thumbs.first().click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toHaveCount(0);

      await page.goto("/dashboard");
      await expect(page.getByRole("link", { name })).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Limmat river float (DIY)" }),
      ).toHaveCount(0);

      await page.goto(`/places/${placeId}`);
      await page.getByRole("link", { name: "Edit" }).click();
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: "Take this off" }).click();
      await page.waitForURL(/\/cities/, { timeout: 20_000 });
      placeId = "";

      await page.goto("/dashboard");
      await expect(page.getByRole("link", { name })).toHaveCount(0);
    } finally {
      if (placeId) {
        await page.goto(`/dashboard/places/${placeId}/edit`);
        if (await page.getByRole("button", { name: "Take this off" }).count()) {
          page.once("dialog", (d) => d.accept());
          await page.getByRole("button", { name: "Take this off" }).click();
          await page.waitForURL(/\/cities/, { timeout: 20_000 }).catch(() => {});
        }
      }
    }
  });
});
