import { test, expect } from "@playwright/test";

test("mobile navigation supports Escape, focus return, outside dismissal and breakpoint reset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const toggle = page.locator(".mobile-toggle");
  await toggle.click();
  await expect(page.locator("#main-navigation a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator("h1").click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.setViewportSize({ width: 390, height: 800 });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeHidden();
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} short viewport keeps appearance and navigation controls reachable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 280 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /^Color theme:/ }).click();
    const panel = page.getByRole("dialog", { name: "Appearance" });
    const box = await panel.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(280);
    await panel.getByRole("radio", { name: "System", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    });
    const bounds = await navigation.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(281);
    await navigation.getByRole("link", { name: "Docs" }).focus();
    await expect(
      navigation.getByRole("link", { name: "Docs" }),
    ).toBeInViewport();
  });

  test(`${theme} copy controls have usable targets and code has visible keyboard focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/docs/");
    for (const button of await page
      .getByRole("button", { name: /^Copy / })
      .all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
    const code = page.locator("pre").first();
    await code.focus();
    const outline = await code.evaluate((el) => ({
      width: getComputedStyle(el).outlineWidth,
      offset: getComputedStyle(el).outlineOffset,
    }));
    expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
    expect(parseFloat(outline.offset)).toBeLessThan(0);
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Docs" }),
    ).toHaveAttribute("aria-current", "page");
  });
}
