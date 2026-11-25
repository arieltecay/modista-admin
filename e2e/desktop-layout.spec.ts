import { expect as baseExpect, test } from '@playwright/test';
import { mockApi, type MockApi } from './support/mockApi';
import { sectionsAnswer } from './support/sectionsApi';

// What the phone layout must not change on a computer.

const expect = baseExpect.configure({ timeout: 30_000 });
test.describe.configure({ timeout: 90_000 });

let api: MockApi;

test.beforeEach(async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout only');
  api = await mockApi(page, sectionsAnswer);
});

test.afterEach(() => {
  expect(api?.unexpected ?? []).toEqual([]);
  expect(api?.blocked ?? []).toEqual([]);
});

test('tables are still tables', async ({ page }) => {
  for (const path of ['/admin/acquisition', '/admin/coupons', '/admin/coupons/c1']) {
    await page.goto(path);
    for (const width of [768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const cell = page.locator('.stacked-table td').first();
      await expect(cell).toHaveCSS('display', 'table-cell');
      expect(await cell.evaluate((element) => getComputedStyle(element, '::before').content)).toBe('none');
    }
  }
});

test('metric help opens by hover and by focus, inside its card, and stays closed after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await page.goto('/admin/acquisition');
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Cobertura de atribución' }) });
  const button = card.getByRole('button');
  const tip = card.getByRole('tooltip');

  await button.hover();
  await expect(tip).toBeVisible();
  const [tipBox, cardBox] = [await tip.boundingBox(), await card.boundingBox()];
  expect(tipBox?.x ?? 0).toBeGreaterThanOrEqual(cardBox?.x ?? 0);
  expect((tipBox?.x ?? 0) + (tipBox?.width ?? 0)).toBeLessThanOrEqual((cardBox?.x ?? 0) + (cardBox?.width ?? 0));
  expect(Math.abs((tipBox?.y ?? 0) - (cardBox?.y ?? 0))).toBeLessThan(80);
  const buttonBox = await button.boundingBox();
  expect((buttonBox?.y ?? 0) + (buttonBox?.height ?? 0)).toBeLessThanOrEqual(tipBox?.y ?? 0);
  await page.mouse.move(700, 100);
  await expect(tip).toBeHidden();

  await button.focus();
  await expect(tip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await button.hover();
  await page.mouse.move(700, 100);
  await expect(tip).toBeHidden();
});

test('on a tablet only the table box scrolls, never the page', async ({ page }) => {
  for (const path of ['/admin/acquisition', '/admin/coupons', '/admin/coupons/c1']) {
    await page.goto(path);
    await expect(page.locator('.stacked-table').last()).toBeVisible();
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.locator('main.custom-scrollbar').evaluate((main) => main.scrollWidth - main.clientWidth);
      expect.soft(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});
