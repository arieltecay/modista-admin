import {
  channelsResponse, funnelResponse, journeyDetailResponse, journeysResponse, liveResponse, overviewResponse, qualityResponse, unknownRule, VISIT_ID,
} from '../../src/pages/acquisition/testing/fixtures';

const LONG_TITLE = 'Curso intensivo de moldería y confección de camisas, vestidos y sastrería femenina desde cero';
const LONG_VALUE = 'campania_de_noviembre_black_friday_remarketing_audiencia_similar_compradoras_2026';

const coupon = {
  id: 'c1', code: 'BLACKFRIDAYMODISTA2026', type: 'fixed', value: 125000, startsAt: '2026-11-01T03:00:00.000Z', endsAt: '2026-12-31T03:00:00.000Z',
  usedCount: 120, active: true, status: 'active', maxUses: 1000, courseId: 'course-1', courseTitle: LONG_TITLE, discountTotal: 12500000, netRevenue: 987654321,
};

const couponDetail = {
  ...coupon,
  stats: {
    started: 240, uses: 120, discountTotal: 12500000, netRevenue: 987654321,
    daily: [{ day: '2026-11-18', uses: 3 }, { day: '2026-11-19', uses: 120 }],
    recent: [{ name: 'Maximiliana G.', status: 'pending', date: '2026-11-19T12:00:00.000Z', price: 1250000 }],
  },
};

const journeys = journeysResponse();

/** Deliberately long fictional data: what breaks a phone layout when a section does not wrap. */
const ANSWERS: Record<string, unknown> = {
  '/api/coupons': { items: [coupon, { ...coupon, id: 'c2', code: 'HOLA10', type: 'percent', value: 10, active: false, status: 'paused', maxUses: null }], page: 1, limit: 10, total: 25 },
  '/api/coupons/c1': couponDetail,
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

/** Read-only answers for the sections other than Messages. Query strings are accepted: their services have their own tests. */
export const sectionsAnswer = (method: string, path: string): unknown => (method === 'GET' ? ANSWERS[path] : undefined);
