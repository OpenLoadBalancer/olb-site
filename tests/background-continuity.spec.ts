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

async function ready(page: Page, theme: "light" | "dark" = "light") {
  await page.emulateMedia({ colorScheme: theme });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install({ time: new Date("2026-10-18T13:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".site-background")).toHaveAttribute(
    "data-motion",
    "running",
  );
  await page.clock.pauseAt(new Date("2026-10-18T13:01:00Z"));
  await page.clock.runFor(1200);
}

for (const theme of ["light", "dark"] as const)
  test(`${theme} interaction layer remains above text and clipped cards without masks or pointer hit tests`, async ({
    page,
  }) => {
    await ready(page, theme);
    const fx = page.locator("svg.site-interactions");
    await expect(fx).toHaveCount(1, { timeout: 1000 });
    const style = await fx.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        z: Number(s.zIndex),
        events: s.pointerEvents,
        position: s.position,
        mask: s.maskImage,
        masks: el.querySelectorAll("[mask]").length,
        clippedAncestor: [
          ...(function* () {
            for (let p = el.parentElement; p; p = p.parentElement) yield p;
          })(),
        ].some((p) =>
          ["hidden", "clip", "scroll"].includes(getComputedStyle(p).overflow),
        ),
      };
    });
    expect(style).toMatchObject({
      events: "none",
      position: "fixed",
      mask: "none",
      masks: 0,
      clippedAncestor: false,
    });
    expect(style.z).toBeGreaterThan(20);
    const card = page.locator(".traffic-console"),
      box = (await card.boundingBox())!;
    expect(await card.evaluate((el) => getComputedStyle(el).overflow)).toBe(
      "hidden",
    );
    await page.mouse.move(box.x + 10, box.y + 80);
    await page.clock.runFor(300);
    const halo = fx.locator("[data-pointer]");
    await expect(halo).toHaveAttribute("visibility", "visible");
    expect(Number(await halo.getAttribute("opacity"))).toBeGreaterThan(0.1);
    const lightBounds = (await halo.boundingBox())!;
    expect(lightBounds.x).toBeLessThan(box.x);
    expect(lightBounds.x + lightBounds.width).toBeGreaterThan(box.x);
    const highlighted = await fx
      .locator('[data-reactive][visibility="visible"]')
      .evaluateAll((els) =>
        els.map((el) => {
          const m = (el as SVGGraphicsElement).getScreenCTM()!;
          return { x: m.e, y: m.f };
        }),
      );
    expect(
      highlighted.some(
        (p) =>
          p.x > box.x &&
          p.x < box.x + box.width &&
          p.y > box.y &&
          p.y < box.y + box.height,
      ),
    ).toBe(true);
    expect(await halo.getAttribute("transform")).toBe(
      `translate(${(box.x + 10).toFixed(2)} ${(box.y + 80).toFixed(2)})`,
    );
    expect(
      await page.evaluate(
        ({ x, y }) =>
          document.elementFromPoint(x, y)?.closest(".traffic-console") !== null,
        { x: box.x + 10, y: box.y + 80 },
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/screenshots/interaction-card-boundary-${theme}.png`,
    });
    const title = (await page.locator("h1").boundingBox())!;
    const x = title.x + 100,
      y = title.y + 30;
    await page.mouse.move(x, y);
    await page.clock.runFor(300);
    await expect(halo).toHaveAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
    );
    await page.mouse.click(x, y);
    await page.clock.runFor(400);
    await expect(fx.locator('[data-burst][visibility="visible"]')).toHaveCount(
      1,
    );
    await page.screenshot({
      path: `test-results/screenshots/interaction-over-text-${theme}.png`,
    });
    await page.clock.runFor(2500);
    await expect(fx.locator('[data-burst][visibility="visible"]')).toHaveCount(
      0,
    );
  });

test("stationary pointer survives scrolling, and subsequent waves use viewport coordinates", async ({
  page,
}) => {
  await ready(page);
  const fx = page.locator("svg.site-interactions"),
    halo = fx.locator("[data-pointer]");
  const x = 700,
    y = 155;
  await page.mouse.move(x, y);
  await page.clock.runFor(300);
  await page.evaluate(() => scrollTo({ top: 950, behavior: "instant" }));
  await page.clock.runFor(300);
  await expect(halo).toHaveAttribute("visibility", "visible");
  await expect(halo).toHaveAttribute("transform", "translate(700.00 155.00)");
  await page.locator(".site-shell").dispatchEvent("pointerdown", {
    clientX: x,
    clientY: y,
    button: 0,
    pointerId: 91,
    isPrimary: true,
    pointerType: "mouse",
  });
  await page.locator(".site-shell").dispatchEvent("pointerup", {
    clientX: x,
    clientY: y,
    button: 0,
    pointerId: 91,
    isPrimary: true,
    pointerType: "mouse",
  });
  await page.clock.runFor(300);
  const wave = fx.locator('[data-burst][visibility="visible"]');
  await expect(wave).toHaveCount(1);
  await expect(wave).toHaveAttribute("transform", "translate(700.00 155.00)");
  await page.evaluate(() => scrollTo({ top: 1400, behavior: "instant" }));
  await page.clock.runFor(300);
  await expect(halo).toHaveAttribute("transform", "translate(700.00 155.00)");
  await expect(wave).toHaveAttribute("transform", "translate(700.00 155.00)");
  await page.screenshot({
    path: "test-results/screenshots/interaction-section-scroll.png",
  });
});

test("overlaid feedback preserves text selection and control clicks, and motion reduction clears it", async ({
  page,
}) => {
  await ready(page);
  const fx = page.locator("svg.site-interactions");
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await page.clock.runFor(300);
  await expect(fx.locator('[data-burst][visibility="visible"]')).toHaveCount(0);
  await expect(fx.locator("[data-pointer]")).toHaveAttribute(
    "visibility",
    "visible",
  );
  const h = (await page.locator("h1").boundingBox())!;
  await page.mouse.move(h.x + 10, h.y + 35);
  await page.mouse.down();
  await page.mouse.move(h.x + 330, h.y + 35, { steps: 12 });
  await page.mouse.up();
  expect(
    await page.evaluate(() => getSelection()?.toString().length ?? 0),
  ).toBeGreaterThan(0);
  await page.clock.runFor(300);
  await expect(fx.locator('[data-burst][visibility="visible"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(fx).toHaveAttribute("data-motion", "reduced");
  await expect(fx.locator("[data-pointer]")).toHaveAttribute(
    "visibility",
    "hidden",
  );
  await expect(fx.locator('[data-reactive][visibility="visible"]')).toHaveCount(
    0,
  );
});
