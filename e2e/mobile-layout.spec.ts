import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockApi, type MockApi } from './support/mockApi';
import { sectionsAnswer } from './support/sectionsApi';
import { chats, fixedInstruction, instruction, templates, WHATSAPP_ID } from '../src/test/fixtures/botMessage';

// No section may move sideways on a phone. The admin scrolls inside <main>, not in the document,
// so every scrollable box is measured, not only the document.

const WIDTHS = [320, 375, 412, 767];
const folder = process.env.SCREENSHOTS;
const LONG_URL = `https://ejemplo.com/${'ruta-larga'.repeat(20)}`;

const longMessages = [
  { _id: 'l1', direction: 'inbound', body: LONG_URL, timestamp: '2026-11-22T12:00:00.000Z', status: 'delivered' },
  { _id: 'l2', direction: 'outbound', kind: 'private_reply', body: LONG_URL, timestamp: '2026-11-22T12:02:00.000Z', status: 'failed' },
];
const withLongBody = (value: typeof templates): unknown => JSON.parse(JSON.stringify(value).replace(/"text":"[^"]*"/g, `"text":"${LONG_URL}"`));
const answerWith = (method: string, path: string) => {
  if (path === '/api/chat') return chats.map((chat) => ({ ...chat, lastMessage: LONG_URL }));
  if (path === `/api/chat/whatsapp/${WHATSAPP_ID}`) return longMessages;
  if (method === 'GET' && path === '/api/chat/instructions') return [{ ...instruction, content: LONG_URL }, { ...fixedInstruction, instagramFixedResponse: LONG_URL }];
  if (method === 'GET' && path === '/api/notifications/whatsapp/templates') return withLongBody(templates);
  return sectionsAnswer(method, path);
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
  await page.waitForTimeout(700); // the thread scrolls smoothly to its last message
  await expectNoSidewaysScroll(page, 'messages-thread');
  for (const [tab, ready] of [['Respuestas automáticas', 'Curso camisa'], ['Plantillas de WhatsApp', 'aviso_aprobado'], ['Inscripciones', 'Pago completo']]) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByText(ready, { exact: true }).first()).toBeVisible();
    await expectNoSidewaysScroll(page, `messages-${tab}`);
  }
});
