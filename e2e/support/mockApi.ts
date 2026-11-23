import type { Page, Request } from '@playwright/test';
import { DEV_SERVER_ORIGIN, MOCK_API_ORIGIN } from './origins';
import { chats, enrollmentConfig, instruction, messages, templates } from '../../src/test/fixtures/botMessage';

/** A request the page sent to the fake API, as `METHOD /path`, plus its JSON body. */
interface RecordedCall {
  call: string;
  body: unknown;
}

/** What a test can inspect after the page ran against the fake API. */
export interface MockApi {
  calls: RecordedCall[];
  /** API routes the fake does not know: a new or changed call. Answered with 404. */
  unexpected: string[];
  /** Requests to any other origin (internet or another local port), except known static assets. All aborted. */
  blocked: string[];
  /** Makes the next manual send fail like a Meta error would. */
  failNextSend: () => void;
}

/** Static assets the admin loads from the internet. Aborted too, but not a failure. */
const STATIC_ASSET_ORIGINS = new Set([
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  // Background of the template preview (TemplatesTab). The redesign PR drops this external image.
  'https://user-images.githubusercontent.com',
]);

const MESSAGES_PATH = /^\/api\/chat\/(whatsapp|instagram)\/[^/]+$/;
const SEND_PATH = /^\/api\/chat\/(whatsapp|instagram)\/[^/]+\/messages$/;

/** Every call the Messages section makes today, with the fake answer. Anything else is unexpected. */
const answer = (method: string, path: string): unknown => {
  if (method === 'GET' && path === '/api/chat') return chats;
  if (method === 'GET' && path === '/api/chat/instructions') return [instruction];
  if (method === 'GET' && path === '/api/chat/enrollment-config') return enrollmentConfig;
  if (method === 'GET' && path === '/api/notifications/whatsapp/templates') return templates;
  if (method === 'GET' && path === '/api/dashboard/unread-messages') return { unreadCount: 2 };
  if (method === 'GET' && MESSAGES_PATH.test(path)) return messages;
  if (method === 'POST' && SEND_PATH.test(path)) return { _id: 'sent', direction: 'outbound', status: 'sent' };
  if (method === 'POST' && path === '/api/chat/read-all') return { message: 'ok', modifiedCount: 2 };
  return undefined;
};

const bodyOf = (request: Request) => {
  const raw = request.postData();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

/**
 * Logs in as an admin and answers every API call locally. Only the dev server itself is let through:
 * anything else (internet, or a real API on another local port) is aborted and recorded.
 * The route is set on the browser context so new tabs are covered too.
 */
export const mockApi = async (page: Page): Promise<MockApi> => {
  let sendFails = false;
  const api: MockApi = { calls: [], unexpected: [], blocked: [], failNextSend: () => (sendFails = true) };

  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 'e2e', name: 'Admin de prueba', email: 'admin@example.com', role: 'admin' }));
  });

  await page.routeWebSocket(/.*/, ws => ws.close());
  await page.context().route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.origin === DEV_SERVER_ORIGIN) return route.continue();
    if (url.origin !== MOCK_API_ORIGIN) {
      if (!STATIC_ASSET_ORIGINS.has(url.origin)) api.blocked.push(url.origin);
      return route.abort();
    }

    const method = request.method();
    // The query string is part of the call: a new filter or pagination param is an unexpected call.
    const call = `${method} ${url.pathname}${url.search}`;
    api.calls.push({ call, body: bodyOf(request) });
    if (sendFails && method === 'POST' && SEND_PATH.test(url.pathname)) {
      sendFails = false;
      return route.fulfill({ status: 500, json: { error: 'Meta rechazó el envío' } });
    }
    const json = url.search ? undefined : answer(method, url.pathname);
    if (json === undefined) {
      api.unexpected.push(call);
      return route.fulfill({ status: 404, json: { message: 'Ruta no prevista por el API falso' } });
    }
    return route.fulfill({ json });
  });

  return api;
};
