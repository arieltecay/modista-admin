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
  { name: 'respuestas', tab: /entrenamiento|respuestas automáticas/i, ready: 'Curso camisa' },
  { name: 'plantillas', tab: /plantillas/i, ready: 'aviso_aprobado' },
  { name: 'inscripciones', tab: /inscripciones/i, ready: 'Pago completo' },
];

test('captures the inbox, a conversation and every tab', async ({ page }, info) => {
  const api = await mockApi(page);
  await page.goto('/admin/chat');
  await page.getByText(`+${WHATSAPP_ID}`).waitFor();
  await page.screenshot({ path: shot('1-bandeja', info.project.name) });

  await page.getByText(`+${WHATSAPP_ID}`).click();
  await page.getByText('Te escribimos por privado').waitFor();
  await page.screenshot({ path: shot('2-conversacion', info.project.name) });

  for (const [index, { name, tab, ready }] of tabs.entries()) {
    await page.getByRole('button', { name: tab }).first().click();
    await page.getByText(ready, { exact: true }).first().waitFor();
    await page.screenshot({ path: shot(`${index + 3}-${name}`, info.project.name), fullPage: true });
  }

  // Screenshots of a page that called an unknown route would show 404 errors as if they were the design.
  expect(api.unexpected).toEqual([]);
  expect(api.blocked).toEqual([]);
});
