import { test, expect, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const log: string[] = [];
  errors.set(page, log);
  page.on("pageerror", (e) => log.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") log.push(m.text());
  });
});
test.afterEach(({ page }) => expect(errors.get(page)).toEqual([]));

const svg = (page: Page) => page.locator("svg.site-background");
const waves = (page: Page) =>
  page.locator('svg.site-interactions [data-burst][visibility="visible"]');
const poses = (page: Page) =>
  svg(page)
    .locator('[data-object][visibility="visible"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("transform")));
async function setup(page: Page, path = "/") {
  await page.clock.install({ time: new Date("2026-10-18T12:00:00Z") });
  await page.addInitScript(() => {
    Object.assign(window, { backgroundMutations: 0 });
    new MutationObserver((records) => {
      for (const r of records)
        if (
          r.target instanceof Element &&
          r.target.closest("svg.site-background")
        ) {
          const target = window as unknown as { backgroundMutations: number };
          target.backgroundMutations++;
        }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["transform", "stroke-dashoffset"],
    });
  });
  await page.goto(path);
  await expect(svg(page)).toHaveAttribute("data-motion", /running|reduced/);
  // Keep the pause target beyond the entire test timeout, including slow loads.
  await page.clock.pauseAt(new Date("2026-10-18T12:01:00Z"));
  await page.clock.runFor(1200);
}
const updates = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { backgroundMutations: number })
        .backgroundMutations,
  );

test("one SVG continues from hero through sections and footer on every page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setup(page);
  await expect(svg(page)).toHaveCount(1);
  await expect(page.locator("svg.site-interactions")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(svg(page)).toHaveCSS("pointer-events", "none");
  await expect(svg(page)).toHaveAttribute("aria-hidden", "true");
  const handle = await svg(page).elementHandle();
  const original = await poses(page);
  for (const target of [
    "#features",
    "#architecture",
    "#quick-start",
    ".footer",
  ]) {
    await page.locator(target).scrollIntoViewIfNeeded();
    await page.clock.runFor(150);
    expect(await handle!.evaluate((el) => el.isConnected)).toBe(true);
    expect(await svg(page).boundingBox()).toEqual({
      x: 0,
      y: 0,
      width: 1440,
      height: 1000,
    });
    expect((await poses(page)).length).toBeGreaterThan(5);
    await expect(svg(page)).toHaveAttribute("data-motion", "running");
  }
  expect(await poses(page)).not.toEqual(original);
  for (const path of ["/docs/", "/brand/"]) {
    await page.goto(path);
    await expect(svg(page)).toHaveCount(1);
    await page.clock.runFor(1000);
    expect((await poses(page)).length).toBeGreaterThan(5);
    await page.locator(".footer").scrollIntoViewIfNeeded();
    await page.clock.runFor(150);
    expect((await poses(page)).length).toBeGreaterThan(5);
  }
});

test("nearby pointer response, merged waves and dispersed clicks expire without growing the SVG", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setup(page);
  const count = await page.locator("svg.site-interactions *").count();
  const before = await poses(page);
  await page.mouse.move(700, 155);
  await page.clock.runFor(300);
  expect(await poses(page)).not.toEqual(before);
  for (let i = 0; i < 20; i++) await page.mouse.click(700, 155);
  await page.clock.runFor(300);
  await expect(waves(page)).toHaveCount(1);
  for (let i = 0; i < 30; i++) await page.mouse.click(700 + (i % 5) * 50, 155);
  await page.clock.runFor(300);
  expect(await waves(page).count()).toBeLessThanOrEqual(5);
  expect(await page.locator("svg.site-interactions *").count()).toBe(count);
  await page.screenshot({
    path: "test-results/screenshots/svg-background-bursts.png",
  });
  await page.mouse.move(600, 30);
  await page.clock.runFor(2300);
  await expect(waves(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await page.clock.runFor(100);
  await expect(waves(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Simulate failure" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await page.clock.runFor(100);
  await expect(waves(page)).toHaveCount(0);
  await page.getByRole("radio", { name: "Dark", exact: true }).press("Escape");
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/#quick-start$/);
  await expect(waves(page)).toHaveCount(0);
});

test("idle reduces updates and hidden or offscreen SVG suspends animation, then resumes", async ({
  page,
}) => {
  await setup(page);
  await page.mouse.move(700, 150);
  const a = await updates(page);
  await page.clock.runFor(1000);
  const active = (await updates(page)) - a;
  await page.mouse.move(600, 30);
  await page.clock.runFor(5000);
  const b = await updates(page);
  await page.clock.runFor(1000);
  expect((await updates(page)) - b).toBeLessThan(active);
  // A reusable background also stops if its host hides or moves outside the viewport.
  await svg(page).evaluate((el) => (el.style.display = "none"));
  await expect(svg(page)).toHaveAttribute("data-motion", "paused");
  const offscreen = await updates(page);
  await page.clock.runFor(10000);
  expect(await updates(page)).toBe(offscreen);
  await svg(page).evaluate((el) => el.style.removeProperty("display"));
  await expect(svg(page)).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect(await updates(page)).toBeGreaterThan(offscreen);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(svg(page)).toHaveAttribute("data-motion", "paused");
  const hidden = await updates(page);
  await page.clock.runFor(60_000);
  expect(await updates(page)).toBe(hidden);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(300);
  await expect(svg(page)).toHaveAttribute("data-motion", "running");
  expect(await updates(page)).toBeGreaterThan(hidden);
});

test("reduced motion is static, inherits both theme colors, and responds to preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await setup(page);
  await expect(svg(page)).toHaveAttribute("data-motion", "reduced");
  const initial = await poses(page),
    before = await updates(page);
  await page.mouse.click(700, 155);
  await page.mouse.move(720, 170);
  await page.clock.runFor(3000);
  expect(await poses(page)).toEqual(initial);
  expect(await updates(page)).toBe(before);
  await expect(waves(page)).toHaveCount(0);
  const dark = await svg(page).evaluate((el) => getComputedStyle(el).color);
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  expect(await svg(page).evaluate((el) => getComputedStyle(el).color)).not.toBe(
    dark,
  );
  await expect(svg(page)).toHaveAttribute("data-motion", "reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(svg(page)).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect(await updates(page)).toBeGreaterThan(before);
});

test.describe("mobile SVG field", () => {
  test.use({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  test("reduced density, tap waves and drag cancellation preserve native scrolling", async ({
    page,
  }) => {
    await setup(page);
    expect((await poses(page)).length).toBeLessThanOrEqual(12);
    await page.touchscreen.tap(180, 95);
    await page.clock.runFor(300);
    await expect(waves(page)).toHaveCount(1);
    await expect(
      page.locator("svg.site-interactions [data-pointer]"),
    ).toHaveAttribute("visibility", "hidden");
    await page.clock.runFor(2300);
    await expect(waves(page)).toHaveCount(0);
    const host = page.locator(".site-shell"),
      init = {
        pointerId: 8,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        clientX: 180,
        clientY: 95,
      };
    await host.dispatchEvent("pointerdown", init);
    await host.dispatchEvent("pointermove", { ...init, clientY: 180 });
    await host.dispatchEvent("pointerup", { ...init, clientY: 180 });
    await page.clock.runFor(300);
    await expect(waves(page)).toHaveCount(0);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 180, y: 650 }],
    });
    for (const y of [570, 480, 380, 250])
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 180, y }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await cdp.detach();
    await expect(waves(page)).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(375);
  });
});
