import { expect, test } from '@playwright/test';
import { mockApi, type MockApi } from './support/mockApi';
import { INSTAGRAM_ID, WHATSAPP_ID } from '../src/test/fixtures/botMessage';

// Functional checks of /admin/chat in a real browser (desktop and mobile), against a fake API.
// They pin the requests the page sends, so the redesign cannot change them unnoticed.

let api: MockApi;
const calls = () => api.calls.map(({ call }) => call);

test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  await page.goto('/admin/chat');
  await expect(page.getByText(`+${WHATSAPP_ID}`)).toBeVisible();
});

test.afterEach(() => {
  expect(api.unexpected, 'the page called an API route that does not exist today').toEqual([]);
  expect(api.blocked, 'no request may leave the machine').toEqual([]);
});

test('opens the inbox with only the conversation list and the unread badge', async () => {
  expect(new Set(calls())).toEqual(new Set(['GET /api/chat', 'GET /api/dashboard/unread-messages']));
});

test('filters by channel without asking the server again', async ({ page }) => {
  const before = calls().length;

  await page.getByRole('button', { name: /instagram/i }).click();
  await expect(page.getByText(`+${WHATSAPP_ID}`)).toBeHidden();
  await expect(page.getByText(INSTAGRAM_ID)).toBeVisible();

  expect(calls().length).toBe(before);
});

test('opens a conversation, labels comments and goes back on mobile', async ({ page, isMobile }) => {
  await page.getByText(`+${WHATSAPP_ID}`).click();

  await expect(page.getByText('Comentario público')).toBeVisible();
  await expect(page.getByText('Respuesta privada al comentario · no enviada')).toBeVisible();
  expect(calls()).toContain(`GET /api/chat/whatsapp/${WHATSAPP_ID}`);

  if (isMobile) {
    await expect(page.getByText(`+${WHATSAPP_ID}`)).toBeHidden();
    // TEMP: the back button has no accessible name; the redesign PR replaces this with getByRole.
    await page.locator('button.md\\:hidden').click();
    await expect(page.getByText(`+${WHATSAPP_ID}`)).toBeVisible();
  }
});

test('sends a manual reply with the same request as today', async ({ page }) => {
  await page.getByText(`+${WHATSAPP_ID}`).click();
  const composer = page.getByPlaceholder('Escribe una respuesta manual...');

  await composer.fill('Te paso el link');
  await composer.press('Enter');

  await expect(composer).toHaveValue('');
  const sends = api.calls.filter(({ call }) => call.startsWith('POST'));
  expect(sends).toEqual([{ call: `POST /api/chat/whatsapp/${WHATSAPP_ID}/messages`, body: { body: 'Te paso el link' } }]);
});

test('keeps the draft when the send fails', async ({ page }) => {
  api.failNextSend();
  await page.getByText(`+${WHATSAPP_ID}`).click();
  const composer = page.getByPlaceholder('Escribe una respuesta manual...');

  await composer.fill('Te paso el link');
  await composer.press('Enter');

  await expect(page.getByText('No se pudo enviar el mensaje')).toBeVisible();
  await expect(composer).toHaveValue('Te paso el link');
});

test('every tab renders its content', async ({ page }) => {
  await page.getByRole('button', { name: /entrenamiento/i }).click();
  await expect(page.getByText('Curso camisa')).toBeVisible();
  await page.getByRole('button', { name: /plantillas/i }).click();
  await expect(page.getByText('aviso_aprobado', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /inscripciones/i }).click();
  await expect(page.getByLabel('Responder consultas de inscripción por WhatsApp')).toBeVisible();
});

test('fits the screen without horizontal scroll', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
