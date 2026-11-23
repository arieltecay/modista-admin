export const DEV_SERVER_PORT = 5179;
/** The Vite dev server: the only origin the browser may reach besides the fake API. */
export const DEV_SERVER_ORIGIN = `http://127.0.0.1:${DEV_SERVER_PORT}`;
/** Fake API origin: every request to it is answered by mockApi.ts. */
export const MOCK_API_ORIGIN = 'http://127.0.0.1:4599';
