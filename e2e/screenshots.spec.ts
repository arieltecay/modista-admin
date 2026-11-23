import { expect, test } from '@playwright/test';
import { mockApi } from './support/mockApi';
import { WHATSAPP_ID } from '../src/test/fixtures/botMessage';

// Screenshots of /admin/chat with fictional data, for the PR guide and before/after comparisons.
// Run with: SCREENSHOTS=<folder name> npm run test:e2e -- screenshots
const folder = process.env.SCREENSHOTS;

test.skip(!folder, 'set SCREENSHOTS=<folder> to capture');

const shot = (name: string, project: string) => `docs/screens/${folder}/${project}-${name}.png`;

/** Each tab with a text that only shows once its data is loaded. */
const tabs = [
  { name: 'respuestas', tab: 'Respuestas automáticas', ready: 'Curso camisa' },
  { name: 'plantillas', tab: 'Plantillas de WhatsApp', ready: 'aviso_aprobado' },
  { name: 'inscripciones', tab: 'Inscripciones', ready: 'Pago completo' },
];

test('captures the inbox, a conversation and every tab', async ({ page }, info) => {
  const api = await mockApi(page);
  await page.goto('/admin/chat');
  const whatsapp = page.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
  await whatsapp.waitFor();
  await page.screenshot({ path: shot('1-bandeja', info.project.name), animations: 'disabled' });

  await whatsapp.click();
  await page.getByText('Te escribimos por privado').waitFor();
  await page.screenshot({ path: shot('2-conversacion', info.project.name), animations: 'disabled' });

  for (const [index, { name, tab, ready }] of tabs.entries()) {
    await page.getByRole('tab', { name: tab }).click();
    await page.getByText(ready, { exact: true }).first().waitFor();
    await page.screenshot({ path: shot(`${index + 3}-${name}`, info.project.name), fullPage: true, animations: 'disabled' });
  }

  await page.getByRole('tab', { name: 'Respuestas automáticas' }).click();
  await page.getByRole('button', { name: 'Editar regla Precio del curso' }).click();
  // The dialog scrolls on its own: bring the reply mode into view instead of a full-page shot.
  await page.getByText('Cómo responde en Instagram').scrollIntoViewIfNeeded();
  await page.getByLabel('Mensaje que se enviará').waitFor();
  await page.screenshot({ path: shot('6-respuesta-fija', info.project.name), animations: 'disabled' });

  // Screenshots of a page that called an unknown route would show 404 errors as if they were the design.
  expect(api.unexpected).toEqual([]);
  expect(api.blocked).toEqual([]);
});
