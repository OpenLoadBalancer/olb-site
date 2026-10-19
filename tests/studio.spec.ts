import { test, expect } from "@playwright/test";

// Measurements from the live Mammoth banner at these viewports, 2026-10-19.
for (const theme of ["light", "dark"] as const)
  for (const width of [375, 1440])
    test(`Mammoth Oxog banner matches reference geometry in ${theme} at ${width}px and is the footer's last content`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      const banner = page.locator("a.studio");
      await banner.scrollIntoViewIfNeeded();
      // Load the banner's faces explicitly before measuring its narrow layout.
      await page.evaluate(async () => {
        await Promise.all([
          document.fonts.load('400 9px "Manrope Variable"'),
          document.fonts.load('500 25px "Space Grotesk Variable"'),
        ]);
        await document.fonts.ready;
      });
      await expect(banner).toHaveAttribute("href", "https://oxog.net");
      await expect(banner.locator(".eyebrow")).toHaveText(
        "PART OF A BIGGER PICTURE",
      );
      await expect(banner.locator("h2")).toHaveText("Small studio. Big ideas.");
      await expect(banner.locator("p")).toHaveText(
        "Explore the tools and infrastructure from Oxog.",
      );
      await expect(banner.locator(".studio-link")).toHaveText("Meet oxog.net");
      await expect(page.locator(".studio-projects,.footer-bottom")).toHaveCount(
        0,
      );
      expect(
        await banner.evaluate(
          (el) => el.parentElement?.lastElementChild === el,
        ),
      ).toBe(true);
      const metrics = await banner.evaluate((el) => {
        const box = el.getBoundingClientRect(),
          logo = el.querySelector("svg")!.getBoundingClientRect();
        const heading = el.querySelector("h2")!,
          css = getComputedStyle(heading),
          r = heading.getBoundingClientRect();
        const paragraph = el.querySelector("p")!,
          paragraphBox = paragraph.getBoundingClientRect(),
          paragraphCss = getComputedStyle(paragraph);
        return {
          width: box.width,
          height: box.height,
          logoWidth: logo.width,
          logoX: logo.x - box.x,
          headingX: r.x - box.x,
          headingY: r.y - box.y,
          font: css.fontFamily,
          size: css.fontSize,
          border: getComputedStyle(el).borderRadius,
          color: css.color,
          paragraphHeight: paragraphBox.height,
          paragraphY: paragraphBox.y - box.y,
          paragraphSize: paragraphCss.fontSize,
          paragraphFont: paragraphCss.fontFamily,
        };
      });
      const reference =
        width === 375
          ? {
              width: 331,
              // Keep the reference spacing while allowing native line wrapping.
              height: 175.59375 + metrics.paragraphHeight,
              logoWidth: 65,
              logoX: 26,
              headingX: 113,
              headingY: 44.59375,
            }
          : {
              width: 1310.390625,
              height: 160.671875,
              logoWidth: 105,
              logoX: 46,
              headingX: 208.59375,
              headingY: 57.796875,
            };
      for (const [key, value] of Object.entries(reference))
        expect(metrics[key as keyof typeof reference]).toBeCloseTo(value, 1);
      expect(metrics.font).toBe('"Space Grotesk Variable", sans-serif');
      expect(metrics.size).toBe(width === 375 ? "25px" : "35px");
      expect(metrics.paragraphSize).toBe(width === 375 ? "9px" : "11px");
      expect(metrics.paragraphFont).toBe('"Manrope Variable", sans-serif');
      expect(metrics.paragraphY).toBeCloseTo(
        width === 375 ? 109.59375 : 105.984375,
        1,
      );
      expect(metrics.border).toBe("7px");
      expect(metrics.color).toBe(
        theme === "light" ? "rgb(25, 28, 50)" : "rgb(246, 240, 228)",
      );
      await expect(banner.locator(".oxog-mark path")).toHaveCount(4);
      await expect(banner.locator(".oxog-mark path").first()).toHaveAttribute(
        "d",
        "M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await banner.screenshot({
        path: `test-results/screenshots/oxog-${theme}-${width}.png`,
      });
    });
