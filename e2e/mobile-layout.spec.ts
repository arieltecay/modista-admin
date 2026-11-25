import { expect as baseExpect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockApi, type MockApi } from './support/mockApi';
import { couponDetail, sectionsAnswer } from './support/sectionsApi';
import { chats, fixedInstruction, instruction, template, templates, WHATSAPP_ID } from '../src/test/fixtures/botMessage';

// No section may move sideways on a phone. The admin scrolls inside <main>, not in the document,
// so every scrollable box is measured, not only the document.

// The first tests after starting Vite wait for it to compile the page on demand.
const expect = baseExpect.configure({ timeout: 30_000 });
test.describe.configure({ timeout: 90_000 });

const WIDTHS = [320, 375, 412, 767];
const folder = process.env.SCREENSHOTS;
const LONG_URL = `https://ejemplo.com/${'ruta-larga'.repeat(20)}`;

const longMessages = [
  { _id: 'l1', direction: 'inbound', body: LONG_URL, timestamp: '2026-11-22T12:00:00.000Z', status: 'delivered' },
  { _id: 'l2', direction: 'outbound', kind: 'private_reply', body: LONG_URL, timestamp: '2026-11-22T12:02:00.000Z', status: 'failed' },
];
const longTemplates = templates.map((item) => ({ ...item, components: item.components.map((part) => ({ ...part, text: LONG_URL })) }));
const longNameTemplate = template('confirmacion_inscripcion_curso_moldes_noviembre'.repeat(4), 'APPROVED');
const answerWith = (method: string, path: string, params: string[]) => {
  if (path.startsWith('/api/chat') && params.length > 0) return undefined;
  if (path === '/api/chat') return chats.map((chat) => ({ ...chat, lastMessage: LONG_URL }));
  if (path === `/api/chat/whatsapp/${WHATSAPP_ID}`) return longMessages;
  if (method === 'GET' && path === '/api/chat/instructions') return [{ ...instruction, content: LONG_URL }, { ...fixedInstruction, instagramFixedResponse: LONG_URL }];
  if (method === 'GET' && path === '/api/notifications/whatsapp/templates') return [...longTemplates, longNameTemplate];
  return sectionsAnswer(method, path, params);
};

/** Boxes a person can drag sideways, described so a failure names the culprit. */
const sidewaysScroll = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('*'))
      .filter((element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
      .filter((element) => element === document.documentElement || ['auto', 'scroll'].includes(getComputedStyle(element).overflowX))
      .filter((element) => !element.matches('textarea, input, select'))
      .map((element) => `${element.tagName}.${element.className} +${element.scrollWidth - element.clientWidth}px`),
  );

let api: MockApi;

test.beforeEach(async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout only');
  api = await mockApi(page, answerWith);
});

test.afterEach(() => {
  expect(api?.unexpected ?? []).toEqual([]);
  expect(api?.blocked ?? []).toEqual([]);
});

const expectNoSidewaysScroll = async (page: Page, name: string) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    if (folder && width === 375) await page.screenshot({ path: `${folder}/${name}.png`, animations: 'disabled' });
    expect.soft(await sidewaysScroll(page), `${name} at ${width}px`).toEqual([]);
  }
};

test('acquisition does not move sideways', async ({ page }) => {
  await page.goto('/admin/acquisition');
  await page.getByRole('button', { name: 'Ver recorrido 12345678' }).click();
  await expect(page.getByRole('heading', { name: 'Recorrido 12345678' })).toBeVisible();
  await expectNoSidewaysScroll(page, 'acquisition-journeys');
  await page.getByRole('heading', { name: 'Canales' }).scrollIntoViewIfNeeded();
  await expectNoSidewaysScroll(page, 'acquisition-channels');
});

test('an open metric help stays on screen', async ({ page }) => {
  await page.goto('/admin/acquisition');
  const tips = page.getByRole('button', { name: /^Cómo se calcula/ });
  await expect(tips.first()).toBeVisible();
  for (const width of [320, 412]) {
    await page.setViewportSize({ width, height: 800 });
    for (const tip of await tips.all()) {
      await tip.click();
      const box = await page.getByRole('tooltip').filter({ visible: true }).boundingBox();
      expect.soft(box?.x).toBeGreaterThanOrEqual(0);
      expect.soft((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
      expect.soft(await sidewaysScroll(page)).toEqual([]);
      await tip.press('Escape');
    }
  }
});

test('coupons do not move sideways', async ({ page }) => {
  await page.goto('/admin/coupons');
  await expect(page.getByText('HOLA10')).toBeVisible();
  await expectNoSidewaysScroll(page, 'coupons');
  await page.getByText('HOLA10').scrollIntoViewIfNeeded();
  await expectNoSidewaysScroll(page, 'coupons-list');
  await page.getByRole('button', { name: 'Nuevo cupón' }).click();
  await expect(page.getByLabel('Código')).toBeVisible();
  await expectNoSidewaysScroll(page, 'coupons-form');
});

test('a coupon detail does not move sideways', async ({ page }) => {
  await page.goto('/admin/coupons/c1');
  await expect(page.getByText('Maximiliana G.')).toBeVisible();
  await expectNoSidewaysScroll(page, 'coupon-detail');
});

test('messages do not move sideways in the inbox, a conversation or any tab', async ({ page }) => {
  await page.goto('/admin/chat');
  const chat = page.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
  await expect(chat).toBeVisible();
  await expectNoSidewaysScroll(page, 'messages-inbox');
  await chat.click();
  await expect(page.getByText('Respuesta privada al comentario · no enviada')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Mensajes' }).getByRole('listitem').last()).toBeInViewport();
  await expectNoSidewaysScroll(page, 'messages-thread');
  for (const [tab, ready] of [['Respuestas automáticas', 'Curso camisa'], ['Plantillas de WhatsApp', 'aviso_aprobado'], ['Inscripciones', 'Pago completo']]) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByText(ready, { exact: true }).first()).toBeVisible();
    await expectNoSidewaysScroll(page, `messages-${tab}`);
  }
});

test('a closed metric help does not reopen by focus, and the first tap always opens it', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/admin/acquisition');
  const tips = page.getByRole('button', { name: /^Cómo se calcula/ });
  const open = page.getByRole('tooltip').filter({ visible: true });
  await expect(tips.first()).toBeVisible();

  await tips.first().click();
  await expect(open).toHaveCount(1);
  await tips.first().click();
  await page.mouse.move(5, 400);
  await expect(open).toHaveCount(0);

  // A touch that becomes a scroll sends pointerdown but never moves the focus.
  await tips.first().click();
  await page.mouse.move(5, 400);
  await page.getByRole('heading', { name: 'Resumen' }).dispatchEvent('pointerdown');
  await expect(open).toHaveCount(0);

  await tips.nth(1).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(tips.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(open).toHaveCount(0);
});

test('each card label matches its column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const [path, tables] of [['/admin/acquisition', 2], ['/admin/coupons', 1], ['/admin/coupons/c1', 1]] as const) {
    await page.goto(path);
    await expect(page.locator('.stacked-table')).toHaveCount(tables);
    for (const table of await page.locator('.stacked-table').all()) {
      const headers = (await table.locator('th').allTextContents()).map((text) => text.trim());
      for (const row of await table.locator('tbody tr').all()) {
        expect(await row.locator('td').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-label')))).toEqual(headers);
        await expect(row.locator('td').first()).toHaveCSS('display', 'flex');
      }
    }
    for (const role of ['table', 'columnheader', 'cell'] as const) expect(await page.getByRole(role).count()).toBeGreaterThan(0);
  }
});

test('a template with a long name keeps its status apart and its dialogs readable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/admin/chat');
  await page.getByRole('tab', { name: 'Plantillas de WhatsApp' }).click();
  const card = page.getByRole('article', { name: longNameTemplate.name });
  const title = await card.getByRole('heading').boundingBox();
  const status = await card.getByText('Aprobada').boundingBox();
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(status?.x ?? 0);

  await card.getByRole('button', { name: /^Enviar prueba/ }).click();
  const heading = page.getByRole('heading', { name: /^Probar/ });
  await expect(heading).toBeVisible();
  const close = page.getByRole('dialog').getByRole('button').first();
  await expect(close).toBeInViewport({ ratio: 1 });
  expect(await heading.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await close.click();

  await card.getByRole('button', { name: /^Eliminar/ }).click();
  const message = page.getByRole('dialog').getByText(longNameTemplate.name);
  await expect(message).toBeVisible();
  expect(await message.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
});

test('unbroken text does not widen coupons, their errors or the overview', async ({ page }) => {
  const word = 'M'.repeat(150);
  await page.route('**/api/coupons/c1', (route) => route.fulfill({ json: { ...couponDetail, courseTitle: word } }));
  await page.goto('/admin/coupons/c1');
  await expect(page.getByText(word)).toBeVisible();
  await expectNoSidewaysScroll(page, 'coupon-long-title');

  for (const [url, path] of [['**/api/coupons/c1', '/admin/coupons/c1'], ['**/api/coupons?*', '/admin/coupons']]) {
    await page.route(url, (route) => route.fulfill({ status: 500, json: { message: word, error: word } }));
    await page.goto(path);
    const alert = page.getByRole('alert').filter({ has: page.getByRole('button') });
    await expect(alert).toBeVisible();
    await expectNoSidewaysScroll(page, 'coupon-error');
    expect(await alert.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  }

  await page.goto('/admin/acquisition');
  await page.setViewportSize({ width: 320, height: 800 });
  const tip = page.getByRole('button', { name: 'Cómo se calcula Visita→compra' });
  await expect(tip).toBeVisible();
  const inside = await tip.evaluate((element) => element.getBoundingClientRect().right <= (element.closest('article')?.getBoundingClientRect().right ?? 0) - 1);
  expect(inside).toBe(true);
});
