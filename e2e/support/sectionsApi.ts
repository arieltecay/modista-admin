import {
  channelsResponse, funnelResponse, journeyDetailResponse, journeysResponse, liveResponse, overviewResponse, qualityResponse, unknownRule, VISIT_ID,
} from '../../src/pages/acquisition/testing/fixtures';

const LONG_TITLE = 'Curso intensivo de moldería y confección de camisas, vestidos y sastrería femenina desde cero';
const LONG_VALUE = 'campania_de_noviembre_black_friday_remarketing_audiencia_similar_compradoras_2026';

const coupon = {
  id: 'c1', code: 'BLACKFRIDAYMODISTA2026', type: 'fixed', value: 125000, startsAt: '2026-11-01T03:00:00.000Z', endsAt: '2026-12-31T03:00:00.000Z',
  usedCount: 120, active: true, status: 'active', maxUses: 1000, courseId: 'course-1', courseTitle: LONG_TITLE, discountTotal: 12500000, netRevenue: 987654321,
};

export const couponDetail = {
  ...coupon,
  stats: {
    started: 240, uses: 120, discountTotal: 12500000, netRevenue: 987654321,
    daily: [{ day: '2026-11-18', uses: 3 }, { day: '2026-11-19', uses: 120 }],
    recent: [{ name: 'Maximiliana G.', status: 'pending', date: '2026-11-19T12:00:00.000Z', price: 1250000 }],
  },
};

const journeys = journeysResponse();

const invoice = {
  id: 'i1', status: 'authorized', environment: 'production', pointOfSale: 3, number: 128, total: 125000, attempts: 1,
  receiver: { name: 'Maximiliana Guadalupe Fernández Etchegaray', email: 'maximiliana.fernandez.etchegaray@example.com' },
  createdAt: '2026-11-19T12:00:00.000Z', issuedAt: '2026-11-19T12:00:00.000Z', courseTitle: LONG_TITLE,
  emailSentAt: '2026-11-19T12:01:00.000Z', publicUrl: 'https://modista-app.com/factura/a',
};

/** One invoice of each shape: with nothing to do yet, credited, and refused by ARCA. */
const invoices = [
  invoice,
  {
    ...invoice, id: 'i2', number: 129,
    creditNote: { status: 'authorized', pointOfSale: 3, number: 7, reason: `Baja del curso: ${LONG_VALUE}`, emailSentAt: '2026-11-20T12:00:00.000Z', publicUrl: 'https://modista-app.com/factura/b' },
  },
  { ...invoice, id: 'i3', status: 'failed', number: 130, publicUrl: undefined, emailSentAt: undefined, lastError: `10015: ${LONG_VALUE}` },
];

/** Deliberately long fictional data: what breaks a phone layout when a section does not wrap. */
const ANSWERS: Record<string, unknown> = {
  '/api/coupons': { items: [coupon, { ...coupon, id: 'c2', code: 'HOLA10', type: 'percent', value: 10, active: false, status: 'paused', maxUses: null }], page: 1, limit: 10, total: 25 },
  '/api/coupons/c1': couponDetail,
  '/api/invoices': { items: invoices, page: 1, limit: 20, total: 3 },
  '/api/coupons/summary': { activeCoupons: 12, uses: 340, discountTotal: 12500000, netRevenue: 987654321 },
  '/api/courses': [{ _id: 'm1', uuid: 'course-1', id: 'course-1', title: LONG_TITLE, price: 125000 }],
  '/api/admin/acquisition/overview': overviewResponse({ revenue: 987654321, unlinked: { leads: 1, purchases: 1, partialPayments: 0, revenue: 5000 } }),
  '/api/admin/acquisition/channels': channelsResponse({ unlinked: { leads: 1, purchases: 1, partialPayments: 0, revenue: 5000 } }),
  '/api/admin/acquisition/funnel': funnelResponse(),
  '/api/admin/acquisition/quality': qualityResponse([unknownRule]),
  '/api/admin/acquisition/live': liveResponse(),
  '/api/admin/acquisition/journeys': { ...journeys, data: { journeys: journeys.data.journeys.map((journey) => ({ ...journey, landingSlug: LONG_VALUE })) } },
  [`/api/admin/acquisition/journeys/${VISIT_ID}`]: journeyDetailResponse(LONG_VALUE),
};

const FILTERS = ['from', 'to', 'timezone'];
const REPORT = [...FILTERS, 'reportingMode', 'perspective', 'outcomeWindowDays'];
/** Query params each path sends today; any other makes the call unexpected. */
const PARAMS: Record<string, string[]> = {
  '/api/coupons': ['page', 'limit'],
  '/api/invoices': ['page', 'limit'],
  '/api/admin/acquisition/overview': REPORT,
  '/api/admin/acquisition/channels': REPORT,
  '/api/admin/acquisition/funnel': REPORT,
  '/api/admin/acquisition/quality': FILTERS,
  '/api/admin/acquisition/live': ['windowMinutes'],
  '/api/admin/acquisition/journeys': [...FILTERS, 'page', 'limit'],
};

/** Read-only answers for the sections other than Messages. */
export const sectionsAnswer = (method: string, path: string, params: string[]): unknown =>
  method === 'GET' && params.every((param) => (PARAMS[path] ?? []).includes(param)) ? ANSWERS[path] : undefined;
