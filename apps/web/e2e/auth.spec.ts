import { expect, test } from "@playwright/test";
import { ensureE2eUser, HUMAN_E2E_USER, login, revealEmail } from "./helpers";

test.describe("email login", () => {
  test("Google is the door; email stays hidden until asked", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "In from a trip?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveCount(0);
    await revealEmail(page);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  test("signup is First time / Sign up, not Create account", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "First time?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create account" })).toHaveCount(
      0,
    );
    await revealEmail(page);
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("wrong password shows an error", async ({ page }) => {
    const user = await ensureE2eUser();
    test.skip(!user, HUMAN_E2E_USER);
    if (!user) return;

    await page.goto("/login");
    await revealEmail(page);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("not-the-password-xxx");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login lands on Your recommendations; seed recs are not yours", async ({
    page,
  }) => {
    await login(page);
    await expect(
      page.getByRole("heading", { name: "Your recommendations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Limmat river float (DIY)" }),
    ).toHaveCount(0);
    await page.getByLabel("Account").click();
    await expect(page.getByRole("link", { name: "Your recs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });

  test("plain user is kept off /admin", async ({ page }) => {
    await login(page);
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(
      page.getByRole("heading", { name: "Your recommendations" }),
    ).toBeVisible();
    await page.goto("/admin/people");
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test("share page is the dump box, not a CMS", async ({ page }) => {
    await login(page);
    await page.goto("/share");
    await expect(
      page.getByRole("heading", { name: "Share your intel" }),
    ).toBeVisible();
    await expect(page.getByText(/Type or dictate using your mic/i)).toBeVisible();
    await expect(page.getByText(/real name we can search/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Write it up" })).toBeVisible();
    // Do not click Write it up — that spends xAI.
  });

  test("new-intel forms redirect to Share your intel", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/places/new?kind=eat");
    await expect(page).toHaveURL(/\/share/);
    await expect(
      page.getByRole("heading", { name: "Share your intel" }),
    ).toBeVisible();
    await page.goto("/dashboard/playbooks/new");
    await expect(page).toHaveURL(/\/share/);
    await page.goto("/dashboard");
    await expect(page.getByText(/or type it yourself/i)).toHaveCount(0);
  });
});
