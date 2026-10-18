import { test, expect, type Page } from "@playwright/test";

const key = "olb-background-motion";
const toggle = (page: Page) => page.locator(".motion-toggle");
const background = (page: Page) => page.locator(".site-background");
const feedback = (page: Page) => page.locator(".site-interactions");
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const log: string[] = [];
  errors.set(page, log);
  page.on("pageerror", (error) => log.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") log.push(message.text());
  });
});
test.afterEach(({ page }) => expect(errors.get(page)).toEqual([]));

async function open(page: Page) {
  await page.clock.install({ time: new Date("2026-10-18T18:00:00Z") });
  await page.goto("/");
  await expect(toggle(page)).toBeVisible();
  await expect(toggle(page)).toBeEnabled();
  await page.clock.pauseAt(new Date("2026-10-18T18:01:00Z"));
  await page.clock.runFor(1000);
}

test("mouse control clears feedback and pointer listeners while ambient animation continues without restarting", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript((key) => localStorage.setItem(key, "off"), key);
  await open(page);
  await page.evaluate(() => {
    const tracked: {
      target: EventTarget;
      kind: string;
      listener: EventListenerOrEventListenerObject | null;
      capture: boolean;
    }[] = [];
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const watched = (target: EventTarget, kind: string) =>
      (target === window &&
        [
          "pointermove",
          "pointerdown",
          "pointerup",
          "pointercancel",
          "blur",
          "scroll",
          "resize",
        ].includes(kind)) ||
      (target === document && kind === "visibilitychange") ||
      (target === document.documentElement && kind === "pointerleave");
    EventTarget.prototype.addEventListener = function (
      kind,
      listener,
      options,
    ) {
      const capture =
        typeof options === "boolean" ? options : !!options?.capture;
      if (
        watched(this, kind) &&
        !tracked.some(
          (r) =>
            r.target === this &&
            r.kind === kind &&
            r.listener === listener &&
            r.capture === capture,
        )
      )
        tracked.push({ target: this, kind, listener, capture });
      return add.call(this, kind, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (
      kind,
      listener,
      options,
    ) {
      const capture =
        typeof options === "boolean" ? options : !!options?.capture;
      const index = tracked.findIndex(
        (r) =>
          r.target === this &&
          r.kind === kind &&
          r.listener === listener &&
          r.capture === capture,
      );
      if (index >= 0) tracked.splice(index, 1);
      return remove.call(this, kind, listener, options);
    };
    const raf = requestAnimationFrame.bind(window),
      cancel = cancelAnimationFrame.bind(window);
    const pending = new Set<number>();
    window.requestAnimationFrame = (callback) => {
      const id = raf((time) => {
        pending.delete(id);
        callback(time);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      pending.delete(id);
      cancel(id);
    };
    let ambientMutations = 0,
      feedbackMutations = 0;
    new MutationObserver((records) => {
      for (const r of records)
        if (r.target instanceof Element && r.target.closest(".site-background"))
          ambientMutations++;
        else if (
          r.target instanceof Element &&
          r.target.closest(".site-interactions")
        )
          feedbackMutations++;
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["transform", "stroke-dashoffset"],
    });
    Object.assign(window, {
      backgroundProbe: () => ({
        listeners: tracked.length,
        pending: pending.size,
        ambientMutations,
        feedbackMutations,
      }),
    });
  });
  const probe = () =>
    page.evaluate(() =>
      (
        window as unknown as {
          backgroundProbe: () => {
            listeners: number;
            pending: number;
            ambientMutations: number;
            feedbackMutations: number;
          };
        }
      ).backgroundProbe(),
    );
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(toggle(page)).toHaveAccessibleName("Fare efektlerini aç");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
  await page.clock.runFor(100);
  const idle = await probe();
  expect(idle.pending).toBe(1);
  await toggle(page).focus();
  await expect(page.getByRole("tooltip")).toHaveText("Fare efektlerini aç");
  await toggle(page).press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await toggle(page).press("Enter");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(toggle(page)).toHaveAccessibleName("Fare efektlerini kapat");
  await page.mouse.click(700, 155);
  await page.clock.runFor(300);
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(
    feedback(page).locator('[data-burst][visibility="visible"]'),
  ).toHaveCount(1);
  const active = await probe();
  expect(active.listeners).toBeGreaterThan(idle.listeners);
  expect(active.pending).toBe(1);
  await toggle(page).focus();
  await toggle(page).press("Space");
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
  await expect(feedback(page).locator('[visibility="visible"]')).toHaveCount(0);
  await expect(feedback(page)).toHaveCSS("opacity", "0");
  await expect(background(page)).toHaveCSS("opacity", "1");
  await page.clock.runFor(100);
  const stopped = await probe();
  expect(stopped.listeners).toBe(idle.listeners);
  expect(stopped.pending).toBe(1);
  await page.mouse.move(800, 180);
  await page.mouse.click(800, 180);
  await page.evaluate(() => scrollTo({ top: 200, behavior: "instant" }));
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.clock.runFor(1500);
  const later = await probe();
  expect(later.feedbackMutations).toBe(stopped.feedbackMutations);
  expect(later.ambientMutations).toBeGreaterThan(stopped.ambientMutations);
  expect(later.listeners).toBe(stopped.listeners);
  expect(later.pending).toBe(1);
  // Product controls and traffic animations keep working independently.
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await expect(
    page.getByRole("button", { name: "Simulate failure" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page
      .locator(".packet-stream")
      .first()
      .evaluate((el) =>
        el.getAnimations().some((a) => a.playState === "running"),
      ),
  ).toBe(true);
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await page.getByRole("radio", { name: "Dark", exact: true }).press("Escape");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // UI automation may install its own listeners while exercising the product.
  // Compare each restart with the disabled baseline after those controls settle.
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
  const controlsIdle = await probe();
  for (let i = 0; i < 3; i++) {
    await toggle(page).click();
    await page.clock.runFor(150);
    await expect(background(page)).toHaveAttribute("data-motion", "running");
    expect((await probe()).listeners).toBe(
      controlsIdle.listeners + active.listeners - idle.listeners,
    );
    await toggle(page).click();
    await page.clock.runFor(100);
    expect((await probe()).listeners).toBe(controlsIdle.listeners);
    expect((await probe()).pending).toBe(1);
    await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
    await expect(background(page)).toHaveCSS("opacity", "1");
  }
});

test("system motion is the initial default and an explicit choice persists in both directions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await expect(background(page)).toHaveAttribute("data-motion", "reduced");
  await expect(toggle(page)).toHaveAccessibleName("Fare efektlerini aç");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(background(page)).toHaveAttribute("data-motion", "reduced");
  await toggle(page).click();
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await page.mouse.move(700, 155);
  await page.clock.runFor(300);
  await expect(feedback(page).locator("[data-pointer]")).toHaveAttribute(
    "visibility",
    "visible",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "on",
  );
  await page.reload();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await toggle(page).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "off",
  );
  await page.goto("/docs/");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
});

test("motion preference synchronizes across tabs and clearing it restores the system default", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const other = await context.newPage();
  try {
    await other.goto("/brand/");
    await expect(toggle(other)).toHaveAttribute("aria-pressed", "true");
    await toggle(other).click();
    await expect(background(page)).toHaveAttribute("data-motion", "disabled");
    await toggle(other).click();
    await expect(background(page)).toHaveAttribute("data-motion", "running");
    await other.evaluate(() => localStorage.clear());
    await expect(background(page)).toHaveAttribute("data-motion", "reduced");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    await other.evaluate((key) => localStorage.setItem(key, "invalid"), key);
    await expect(background(page)).toHaveAttribute("data-motion", "reduced");
  } finally {
    await other.close();
  }
});

test("the motion control works when local storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new DOMException("Blocked", "SecurityError");
        },
      });
  });
  await open(page);
  await toggle(page).click();
  await expect(background(page)).toHaveAttribute("data-motion", "running");
  await expect(feedback(page)).toHaveAttribute("data-motion", "disabled");
  await toggle(page).click();
  await expect(background(page)).toHaveAttribute("data-motion", "running");
});

test.describe("touch motion control", () => {
  test.use({ isMobile: true, hasTouch: true });
  test("44px touch target fits narrow headers and does not toggle the theme or navigation", async ({
    page,
  }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto("/");
      await expect(toggle(page)).toBeEnabled();
      const box = (await toggle(page).boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      const theme = await page.locator("html").getAttribute("data-theme");
      const before = await toggle(page).getAttribute("aria-pressed");
      await toggle(page).tap();
      await expect(toggle(page)).toHaveAttribute(
        "aria-pressed",
        before === "true" ? "false" : "true",
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toHaveAttribute("aria-expanded", "false");
      await page.screenshot({
        path: `test-results/screenshots/motion-toggle-${width}.png`,
      });
    }
  });
});
