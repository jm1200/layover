import { expect, test } from "@playwright/test";

const LIMMAT = "/places/c1000000-0000-4000-8000-000000000001";

test.describe("public browse", () => {
  test("home has Eat / Do / Buy and no hotel leak", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Layover Intel" }),
    ).toBeVisible();
    await expect(page.getByText("Eat", { exact: true })).toBeVisible();
    await expect(page.getByText("Do", { exact: true })).toBeVisible();
    await expect(page.getByText("Buy", { exact: true })).toBeVisible();
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
    await page.goto(LIMMAT);
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
});
