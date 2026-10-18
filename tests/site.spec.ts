import { test, expect } from "@playwright/test";
const widths = [375, 768, 1024, 1440, 1920, 2560, 3840];
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
      expect(errors).toEqual([]);
    });
  }
test("theme persists, follows system, and closes with Escape", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Choose theme" }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("radio", { name: "Light", exact: true }).press("Escape");
  await expect(
    page.getByRole("button", { name: "Choose theme" }),
  ).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Choose theme" }).click();
  await page.getByRole("radio", { name: "System", exact: true }).check();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
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
    page.getByRole("link", { name: "OXOGNET", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".packet-stream")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".studio-symbol path")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
test("studio signature draws when it enters view and finishes fully visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator(".studio").scrollIntoViewIfNeeded();
  const paths = page.locator(".studio-symbol path");
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
  await expect
    .poll(() =>
      paths.evaluateAll((elements) =>
        elements.every(
          (el) => parseFloat(getComputedStyle(el).strokeDashoffset) === 0,
        ),
      ),
    )
    .toBe(true);
  await expect(
    page.getByRole("link", { name: "OXOGNET", exact: true }),
  ).toHaveAttribute("href", "https://oxog.net");
  await expect(
    page.getByRole("list", { name: "More from Oxog" }).getByRole("link"),
  ).toHaveCount(4);
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
