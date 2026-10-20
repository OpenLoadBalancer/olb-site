import { test, expect } from "@playwright/test";

test("mouse tooltip remains hoverable and Escape dismisses pointer-only or keyboard help", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const button = page.locator(".motion-toggle");
  const tooltip = page.getByRole("tooltip");
  await expect(button).toBeEnabled();
  await button.focus();
  await expect(tooltip).toBeVisible();
  await button.hover();
  await page.mouse.move(0, 200);
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await page.locator("h1").click();
  await button.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await page.mouse.move(0, 200);
  await button.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 200);
  await expect(tooltip).toBeHidden();
});

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
  await page.mouse.click(10, 780);
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
  test(`${theme} off-state mouse icon keeps essential graphical contrast`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: theme,
      reducedMotion: "no-preference",
    });
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: "Disable mouse effects",
      exact: true,
    });
    await toggle.click();
    const disabledEffects = page.getByRole("button", {
      name: "Enable mouse effects",
      exact: true,
    });
    await expect(disabledEffects).toHaveAttribute("aria-pressed", "false");
    const contrast = await disabledEffects.evaluate((el) => {
      const icon = getComputedStyle(el.querySelector("svg")!);
      const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const background = rgb(getComputedStyle(document.body).backgroundColor);
      const alpha = Number(icon.opacity);
      const foreground = rgb(icon.color).map(
        (value, i) => value * alpha + background[i] * (1 - alpha),
      );
      const luminance = (values: number[]) =>
        values
          .slice(0, 3)
          .map((value) => value / 255)
          .map((value) =>
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
          )
          .reduce(
            (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
            0,
          );
      return (
        (Math.max(luminance(foreground), luminance(background)) + 0.05) /
        (Math.min(luminance(foreground), luminance(background)) + 0.05)
      );
    });
    expect(contrast).toBeGreaterThanOrEqual(3);
  });

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
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Docs" }),
    ).toHaveAttribute("aria-current", "page");
  });
}
