import { test, expect, type Page } from "@playwright/test";

async function scene(page: Page) {
  await page.clock.install({ time: new Date("2026-10-18T10:00:00Z") });
  await page.addInitScript(() => {
    const probe = { frames: 0, strokes: 0, current: 0 };
    Object.assign(window, { heroPaint: probe });
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.matches(".hero-background")) {
        probe.frames++;
        probe.strokes = probe.current;
        probe.current = 0;
      }
      return clear.apply(this, args);
    };
    const stroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function (
      ...args: [] | [Path2D]
    ) {
      if (this.canvas.matches(".hero-background")) probe.current++;
      return Reflect.apply(stroke, this, args);
    };
  });
  await page.goto("/");
  await expect(page.locator(".hero-background")).toHaveAttribute(
    "data-motion",
    /running|reduced/,
  );
  await page.clock.pauseAt(new Date("2026-10-18T10:00:05Z"));
  await page.clock.runFor(1200);
}
const paints = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { heroPaint: { frames: number; strokes: number } })
        .heroPaint,
  );
const pixels = (page: Page) =>
  page
    .locator(".hero-background")
    .evaluate((el) => (el as HTMLCanvasElement).toDataURL());

test("full-width routing scene reacts to empty-space clicks, bounds bursts and lets them expire", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await scene(page);
  const canvas = page.locator(".hero-background");
  const bounds = (await canvas.boundingBox())!;
  expect(bounds.width).toBe(1440);
  expect(bounds.height).toBe(
    (await page.locator(".hero-stage").boundingBox())!.height,
  );
  const baseline = (await paints(page)).strokes;
  const blank = { x: 700, y: bounds.y + 70 };
  await page.mouse.move(600, 30);
  await page.mouse.move(blank.x, blank.y);
  await page.mouse.move(900, blank.y, { steps: 16 });
  await page.clock.runFor(100);
  expect((await paints(page)).strokes).toBeGreaterThan(baseline);
  expect((await paints(page)).strokes).toBeLessThanOrEqual(baseline + 16);
  await page.mouse.move(600, 30);
  await page.clock.runFor(1200);
  expect((await paints(page)).strokes).toBe(baseline);
  await page.mouse.move(blank.x, blank.y);
  for (let i = 0; i < 20; i++) await page.mouse.click(blank.x, blank.y);
  await page.clock.runFor(600);
  expect((await paints(page)).strokes).toBeGreaterThan(baseline + 40);
  expect((await paints(page)).strokes).toBeLessThan(baseline + 100);
  for (let i = 0; i < 20; i++)
    await page.mouse.click(blank.x + (i % 5) * 50, blank.y);
  await page.clock.runFor(200);
  expect((await paints(page)).strokes).toBeGreaterThan(baseline + 200);
  expect((await paints(page)).strokes).toBeLessThan(450);
  await page.screenshot({
    path: "test-results/screenshots/hero-routing-burst.png",
  });
  await page.mouse.move(600, 30);
  await page.clock.runFor(2200);
  expect((await paints(page)).strokes).toBe(baseline);
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await page.clock.runFor(250);
  expect((await paints(page)).strokes).toBe(baseline);
  await expect(
    page.getByRole("button", { name: "Simulate failure" }),
  ).toHaveAttribute("aria-pressed", "true");
  // The background never receives pointer hit tests or enters keyboard navigation.
  await expect(canvas).toHaveCSS("pointer-events", "none");
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/#quick-start$/);
});

test("scene stops offscreen and in hidden tabs, then resumes without a catch-up burst", async ({
  page,
}) => {
  await scene(page);
  const canvas = page.locator(".hero-background");
  await page.mouse.move(700, 130);
  const activeStart = (await paints(page)).frames;
  await page.clock.runFor(1000);
  const activeFrames = (await paints(page)).frames - activeStart;
  await page.mouse.move(600, 30);
  await page.clock.runFor(5000);
  const idleStart = (await paints(page)).frames;
  await page.clock.runFor(1000);
  expect((await paints(page)).frames - idleStart).toBeLessThan(activeFrames);
  await page.locator("#quick-start").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-motion", "paused");
  const before = (await paints(page)).frames;
  await page.clock.runFor(10_000);
  expect((await paints(page)).frames).toBe(before);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect((await paints(page)).frames).toBeGreaterThan(before);
  // Document visibility is a browser boundary; drive its event explicitly.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-motion", "paused");
  const hidden = (await paints(page)).frames;
  await page.clock.runFor(60_000);
  expect((await paints(page)).frames).toBe(hidden);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(300);
  await expect(canvas).toHaveAttribute("data-motion", "running");
  expect((await paints(page)).frames).toBeGreaterThan(hidden);
});

test("reduced motion keeps a static routing illustration, theme changes redraw it, motion preference updates live", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await scene(page);
  const canvas = page.locator(".hero-background");
  await expect(canvas).toHaveAttribute("data-motion", "reduced");
  const original = await pixels(page),
    before = (await paints(page)).frames;
  await page.mouse.click(650, 130);
  await page.mouse.move(700, 140);
  await page.clock.runFor(3000);
  expect((await paints(page)).frames).toBe(before);
  expect(await pixels(page)).toBe(original);
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  expect(await pixels(page)).not.toBe(original);
  await expect(canvas).toHaveAttribute("data-motion", "reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect((await paints(page)).frames).toBeGreaterThan(before);
});

test.describe("touch routing scene", () => {
  test.use({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  test("tap creates a short wave, drag does not, high-DPI canvas stays bounded", async ({
    page,
  }) => {
    await scene(page);
    const canvas = page.locator(".hero-background");
    const bounds = (await canvas.boundingBox())!;
    const bitmap = await canvas.evaluate((el) => ({
      width: (el as HTMLCanvasElement).width,
      height: (el as HTMLCanvasElement).height,
    }));
    expect(bitmap.width).toBeLessThanOrEqual(Math.ceil(bounds.width * 1.5));
    expect(bitmap.width * bitmap.height).toBeLessThanOrEqual(4_010_000);
    const baseline = (await paints(page)).strokes;
    await page.touchscreen.tap(180, bounds.y + 22);
    await page.clock.runFor(300);
    expect((await paints(page)).strokes).toBeGreaterThan(baseline + 30);
    await page.clock.runFor(2200);
    expect((await paints(page)).strokes).toBe(baseline);
    const stage = page.locator(".hero-stage");
    const init = {
      pointerId: 8,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      clientX: 180,
      clientY: bounds.y + 22,
    };
    await stage.dispatchEvent("pointerdown", init);
    await stage.dispatchEvent("pointermove", {
      ...init,
      clientY: bounds.y + 80,
    });
    await stage.dispatchEvent("pointerup", { ...init, clientY: bounds.y + 80 });
    await page.clock.runFor(300);
    expect((await paints(page)).strokes).toBe(baseline);
    // Native touchscreen scrolling must still work through the decorative layer.
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
  });
});
