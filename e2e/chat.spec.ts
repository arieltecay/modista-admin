import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockApi, type MockApi } from './support/mockApi';
import { INSTAGRAM_ID, WHATSAPP_ID } from '../src/test/fixtures/botMessage';

// Functional checks of /admin/chat in a real browser (desktop and mobile), against a fake API.
// They pin the requests the page sends, so the redesign cannot change them unnoticed.

let api: MockApi;
const calls = () => api.calls.map(({ call }) => call);
const whatsappChat = (page: Page) => page.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
const composer = (page: Page) => page.getByLabel('Respuesta manual');
const horizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  await page.goto('/admin/chat');
  // The first tests after starting Vite wait for it to compile the page on demand.
  await expect(whatsappChat(page)).toBeVisible({ timeout: 30_000 });
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

  await page.getByRole('button', { name: 'Instagram', exact: true }).click();
  await expect(whatsappChat(page)).toBeHidden();
  await expect(page.getByRole('button', { name: new RegExp(INSTAGRAM_ID) })).toBeVisible();

  expect(calls().length).toBe(before);
});

test('opens a conversation, labels comments and goes back on mobile', async ({ page, isMobile }) => {
  await whatsappChat(page).click();

  await expect(page.getByText('Comentario público')).toBeVisible();
  await expect(page.getByText('Respuesta privada al comentario · no enviada')).toBeVisible();
  expect(calls()).toContain(`GET /api/chat/whatsapp/${WHATSAPP_ID}`);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  if (isMobile) {
    await expect(whatsappChat(page)).toBeHidden();
    await page.getByRole('button', { name: 'Volver a conversaciones' }).click();
    await expect(whatsappChat(page)).toBeVisible();
  }
});

test('sends a manual reply with the same request as today', async ({ page }) => {
  await whatsappChat(page).click();

  await composer(page).fill('Te paso el link');
  await composer(page).press('Enter');

  await expect(composer(page)).toHaveValue('');
  const sends = api.calls.filter(({ call }) => call.startsWith('POST'));
  expect(sends).toEqual([{ call: `POST /api/chat/whatsapp/${WHATSAPP_ID}/messages`, body: { body: 'Te paso el link' } }]);
});

test('keeps the draft when the send fails', async ({ page }) => {
  api.failNextSend();
  await whatsappChat(page).click();

  await composer(page).fill('Te paso el link');
  await composer(page).press('Enter');

  await expect(page.getByText('No se pudo enviar el mensaje')).toBeVisible();
  await expect(composer(page)).toHaveValue('Te paso el link');
});

test('deletes a message through the real confirmation dialog', async ({ page }) => {
  await whatsappChat(page).click();
  await page.getByRole('button', { name: 'Borrar mensaje' }).first().click();

  // Headless UI's dialog root has no size (its children are fixed): check what the person sees inside it.
  const confirm = page.getByRole('dialog', { name: 'Eliminar mensaje' }).getByRole('button', { name: 'Eliminar' });
  await expect(confirm).toBeVisible();
  await confirm.click();

  await expect(confirm).toBeHidden();
  expect(calls()).toContain('DELETE /api/chat/messages/m1');
});

test('every tab renders its content', async ({ page }) => {
  await page.getByRole('tab', { name: 'Respuestas automáticas' }).click();
  await expect(page.getByRole('article', { name: 'Curso camisa' })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.getByRole('tab', { name: 'Plantillas de WhatsApp' }).click();
  await expect(page.getByRole('article', { name: 'aviso_aprobado' })).toBeVisible();
  await page.getByRole('tab', { name: 'Inscripciones' }).click();
  await expect(page.getByLabel('Responder consultas de inscripción por WhatsApp')).toBeVisible();
});

test('turns a rule into a fixed Instagram reply with enrollment lookup, apart from the Mila context', async ({ page }) => {
  await page.getByRole('tab', { name: 'Respuestas automáticas' }).click();
  await expect(page.getByRole('article', { name: 'Precio del curso' }).getByText('Se envía tal cual, sin Gemini.')).toBeVisible();

  await page.getByRole('button', { name: 'Editar regla Curso camisa' }).click();
  await page.getByRole('radio', { name: /Enviar respuesta fija/ }).check();
  await page.getByLabel('Mensaje que se enviará').fill('Hola 👋\nEl curso empieza el sábado.');
  await page.getByLabel('Permitir consulta de inscripciones en este tema').check();
  await page.getByRole('button', { name: 'Guardar regla' }).click();

  await expect(page.getByRole('button', { name: 'Guardar regla' })).toBeHidden();
  const puts = api.calls.filter(({ call }) => call.startsWith('PUT'));
  expect(puts).toEqual([{ call: 'PUT /api/chat/instructions/i1', body: expect.objectContaining({
    content: 'El curso comienza el 23 de noviembre.',
    instagramResponseMode: 'fixed',
    instagramFixedResponse: 'Hola 👋\nEl curso empieza el sábado.',
    instagramEnrollmentLookup: true,
  }) }]);
});

test('shows every tab on screen without horizontal scroll', async ({ page }) => {
  for (const name of ['Bandeja', 'Respuestas automáticas', 'Plantillas de WhatsApp', 'Inscripciones']) {
    await expect(page.getByRole('tab', { name })).toBeInViewport();
  }
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});
