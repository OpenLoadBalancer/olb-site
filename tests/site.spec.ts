import { test, expect } from "@playwright/test";
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560, 3840];
for (const theme of ["light", "dark"])
  for (const width of widths) {
    test(`${theme} layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(
        (t) => localStorage.setItem("olb-theme", t),
        theme,
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("response", (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      for (const path of ["/", "/docs/", "/brand/"]) {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const dimensions = await page.evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          container: document
            .querySelector(".container")!
            .getBoundingClientRect().width,
        }));
        expect(dimensions.scroll).toBeLessThanOrEqual(width);
        expect(dimensions.container).toBeLessThanOrEqual(1750);
        if (width >= 1920)
          expect(dimensions.container).toBeGreaterThanOrEqual(1680);
        await expect(page.locator("h1")).toBeVisible();
        await page.screenshot({
          path: `test-results/screenshots/${theme}-${width}-${path === "/" ? "home" : path.replaceAll("/", "")}.png`,
          fullPage: true,
        });
      }
      await page.goto("/");
      await page.getByRole("button", { name: /^Color theme:/ }).click();
      const panel = page.getByRole("dialog", { name: "Appearance" });
      await expect(panel).toBeVisible();
      await expect(
        panel.getByRole("radio", {
          name: theme === "light" ? "Light" : "Dark",
          exact: true,
        }),
      ).toBeFocused();
      await page.evaluate(() => document.fonts.ready);
      const bounds = await panel.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y).toBeGreaterThanOrEqual(
        await page
          .locator(".theme-trigger")
          .evaluate((el) => el.getBoundingClientRect().bottom),
      );
      if (width > 680) expect(bounds!.width).toBe(328);
      await page.screenshot({
        path: `test-results/screenshots/theme-menu-${theme}-${width}.png`,
      });
      expect(errors).toEqual([]);
    });
  }
test("theme persists, follows system, and closes with Escape", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("radio", { name: "Light", exact: true }).press("Escape");
  await expect(
    page.getByRole("button", { name: /^Color theme:/ }),
  ).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "System", exact: true }).check();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("Cobalt-style appearance dialog supports radio keys and outside dismissal", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Color theme: System",
    exact: true,
  });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Appearance" });
  await expect(
    panel.getByRole("radio", { name: "System", exact: true }),
  ).toBeFocused();
  await panel
    .getByRole("radio", { name: "System", exact: true })
    .press("ArrowLeft");
  await expect(
    page.getByRole("button", { name: "Color theme: Dark", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("radio", { name: "Dark", exact: true }),
  ).toBeChecked();
  await expect(
    panel.getByText("Dark mode, just how you like it."),
  ).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(panel).toHaveCount(0);
  await page
    .getByRole("button", { name: "Color theme: Dark", exact: true })
    .click();
  await panel.getByRole("radio", { name: "Dark", exact: true }).press("Escape");
  await expect(
    page.getByRole("button", { name: "Color theme: Dark", exact: true }),
  ).toBeFocused();
});
test("theme trigger stays synchronized across tabs and storage clearing", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await expect(
    other.getByRole("button", { name: "Color theme: Dark", exact: true }),
  ).toBeVisible();
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.evaluate(() => localStorage.clear());
  await expect(
    page.getByRole("button", { name: "Color theme: System", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("theme selection works when persistent storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("storage unavailable");
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /^Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("button", { name: "Color theme: Light", exact: true }),
  ).toBeVisible();
});
test("traffic explorer updates algorithm and failover state", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Load balancing algorithm")
    .selectOption("least_connections");
  await expect(
    page.getByText("Prefer the backend with the fewest active connections."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await expect(
    page.getByRole("button", { name: "Simulate failure" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Backend 02 removed from rotation. Traffic keeps flowing."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate failure" }).click();
  await page.getByLabel("Load balancing algorithm").selectOption("ip_hash");
  await expect(
    page.getByText(
      "Keep requests from the same client IP on the same backend.",
    ),
  ).toBeVisible();
});
test("installation tabs and copy buttons deliver the displayed code", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Windows", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Copy Install · Windows", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "irm https://openloadbalancer.dev/install.ps1 | iex",
  );
  await page
    .getByRole("button", { name: "Copy olb.yaml", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "algorithm: round_robin",
  );
  await page.getByRole("button", { name: "Docker", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Copy Install · Docker", exact: true }),
  ).toBeVisible();
  await page.goto("/docs/");
  await page
    .getByRole("button", { name: "Copy Homebrew", exact: true })
    .click();
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).replaceAll(
      "\r\n",
      "\n",
    ),
  ).toBe("brew tap openloadbalancer/olb\nbrew install olb");
});
test("denied clipboard provides a visible recovery instruction", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Copy olb.yaml", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Copy olb.yaml", exact: true }),
  ).toHaveText("Select code to copy");
});
test("mobile navigation opens, follows docs and closes on selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Docs" })
    .click();
  await expect(page).toHaveURL("/docs/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your first route.",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your first route.",
  );
});
test("reduced motion disables traffic and signature animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".studio").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: /PART OF A BIGGER PICTURE/ }),
  ).toBeVisible();
  expect(
    await page
      .locator(".packet-stream")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".oxog-mark path")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
test("Oxog logo repeats Mammoth's six-second drawing animation when visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    localStorage.setItem("olb-background-motion", "off"),
  );
  await page.goto("/");
  await page.locator(".studio").scrollIntoViewIfNeeded();
  const paths = page.locator(".oxog-mark path");
  await expect
    .poll(() =>
      paths
        .first()
        .evaluate(
          (el) =>
            el
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
    )
    .toBeGreaterThan(0);
  const timing = await paths.evaluateAll((elements) =>
    elements.map((el) => {
      const css = getComputedStyle(el);
      return {
        duration: css.animationDuration,
        easing: css.animationTimingFunction,
        repeat: css.animationIterationCount,
        delay: css.animationDelay,
        dash: css.strokeDasharray,
      };
    }),
  );
  expect(timing).toEqual(
    [0, 0.15, 0.3, 0.45].map((delay) => ({
      duration: "6s",
      easing: "ease-in-out",
      repeat: "infinite",
      delay: `${delay}s`,
      dash: "400px",
    })),
  );
  const offsets = await paths.first().evaluate((el) => {
    const animation = el.getAnimations()[0];
    animation.pause();
    return [1000, 3000, 6500].map((time) => {
      animation.currentTime = time;
      return parseFloat(getComputedStyle(el).strokeDashoffset);
    });
  });
  expect(offsets[0]).toBeGreaterThan(0);
  expect(offsets[1]).toBe(0);
  expect(offsets[2]).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: /PART OF A BIGGER PICTURE/ }),
  ).toHaveAttribute("href", "https://oxog.net");
  await expect(page.getByRole("list", { name: "More from Oxog" })).toHaveCount(
    0,
  );
});
test("all in-page navigation targets exist", async ({ page }) => {
  for (const path of ["/", "/docs/"]) {
    await page.goto(path);
    const missing = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .map((a) => a.getAttribute("href")!)
          .filter((href) => !document.getElementById(href.slice(1))),
      );
    expect(missing).toEqual([]);
  }
});
