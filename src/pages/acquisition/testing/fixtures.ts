export const VISIT_ID = '12345678-aaaa-4bbb-8ccc-dddddddddddd';

const coverage = { observedConsentedVisits: 9, knownChannelVisits: 8, attributionCoverage: 8 / 9, totalSiteVisits: null, measurementCoverage: null };
const envelope = {
  generatedAt: '2026-11-18T15:00:00.000Z', timezone: 'America/Argentina/Tucuman', reportingMode: 'acquisition_cohort', outcomeWindowDays: 30,
  outcomesComplete: true, perspective: 'visit_touch', range: { from: '2026-10-20', to: '2026-11-18', fromUtc: '2026-10-20T03:00:00.000Z', toExclusiveUtc: '2026-11-19T03:00:00.000Z' },
};

export const overviewResponse = (overrides: Record<string, unknown> = {}) => ({
  ...envelope,
  coverage,
  data: {
    visits: 9, visitors: 8, attributableVisits: 8, leads: 4, purchases: 2, partialPayments: 1, revenue: 190000,
    leadRate: 4 / 9, purchaseRate: 2 / 9, averageTicket: 95000, unlinked: null, ...overrides,
  },
});

export const channelRows = [
  { channelGroup: 'direct', sourcePlatform: 'unknown', visits: 30, visitors: 25, leads: 1, purchases: 0, partialPayments: 0, revenue: 0, leadRate: 1 / 30, purchaseRate: 0, averageTicket: null, revenueShare: 0 },
  { channelGroup: 'meta_paid', sourcePlatform: 'instagram', visits: 10, visitors: 9, leads: 3, purchases: 1, partialPayments: 0, revenue: 100000, leadRate: 0.3, purchaseRate: 0.1, averageTicket: 100000, revenueShare: 0.5 },
  { channelGroup: 'google_paid', sourcePlatform: 'google', visits: 5, visitors: 5, leads: 1, purchases: 1, partialPayments: 0, revenue: 60000, leadRate: 0.2, purchaseRate: 0.2, averageTicket: 60000, revenueShare: 0.3 },
];

export const channelsResponse = (overrides: Record<string, unknown> = {}) => ({
  ...envelope,
  coverage,
  data: { channels: channelRows, totals: { visits: 45, visitors: 39, leads: 5, purchases: 2, partialPayments: 0, revenue: 160000, leadRate: 5 / 45, purchaseRate: 2 / 45, averageTicket: 80000 }, unlinked: null, ...overrides },
});

const STEPS = ['visit', 'course_detail_view', 'pricing_visible', 'cta_click', 'form_view', 'form_start', 'form_submit', 'lead', 'initiate_checkout', 'redirect_to_payment', 'purchase'];
export const funnelResponse = (independentCounts = false) => ({
  ...envelope,
  data: {
    independentCounts,
    steps: STEPS.map((step, index) => ({
      step,
      visits: Math.max(0, 100 - index * 9),
      conversionFromPrevious: independentCounts || index === 0 ? null : (100 - index * 9) / (100 - (index - 1) * 9),
      conversionFromTop: independentCounts ? null : (100 - index * 9) / 100,
    })),
  },
});

export const liveResponse = (windowMinutes = 15) => ({
  generatedAt: '2026-11-18T15:00:00.000Z',
  windowMinutes,
  data: {
    activeVisits: 3, eventsInWindow: 12,
    activeByChannel: [{ channelGroup: 'meta_paid', count: 2 }, { channelGroup: 'direct', count: 1 }],
    eventsPerMinute: [{ minute: '2026-11-18T14:58:00.000Z', count: 4 }, { minute: '2026-11-18T14:59:00.000Z', count: 8 }, { minute: '2026-11-18T15:00:00.000Z', count: 0 }],
    recentEvents: [{ name: 'cta_click', at: '2026-11-18T14:59:30.000Z', visit: 'abcd1234', channelGroup: 'meta_paid', path: '/lp/curso' }],
  },
});

export const qualityResponse = (rules: Array<typeof unknownRule> = []) => ({
  generatedAt: '2026-11-18T15:00:00.000Z', timezone: 'America/Argentina/Tucuman', range: envelope.range,
  data: {
    rules,
    evaluated: ['UNKNOWN_CHANNEL_RATE_HIGH', 'ORPHAN_EVENT', 'TRACKING_STALE'],
    capi: { accepted: 1, delivered: 20, pending: 0, retry: 2, exhausted: 1 },
    identifiers: { visits: 40, withFbc: 30, withFbp: 36, fbcCoverage: 0.75, fbpCoverage: 0.9 },
    tracking: { lastActivityAt: '2026-11-18T14:59:00.000Z', stale: false },
  },
});

export const unknownRule = {
  code: 'UNKNOWN_CHANNEL_RATE_HIGH', severity: 'warning' as 'info' | 'warning' | 'critical', affected: 12, universe: 40, percentage: 0.3,
  firstOccurrence: '2026-11-11T12:00:00.000Z', lastOccurrence: '2026-11-17T12:00:00.000Z',
  explanation: 'Una parte alta de las visitas no se pudo clasificar en ningún canal.', action: 'Revisá las UTMs de las campañas activas.',
};

export const journeysResponse = (page = 1, totalPages = 2) => ({
  generatedAt: '2026-11-18T15:00:00.000Z', timezone: 'America/Argentina/Tucuman', range: envelope.range,
  pagination: { page, limit: 20, total: 25, totalPages },
  data: {
    journeys: [
      { visitId: VISIT_ID, startedAt: '2026-11-18T15:00:00.000Z', lastActivityAt: '2026-11-18T15:10:00.000Z', channelGroup: 'meta_paid', sourcePlatform: 'instagram', landingSlug: 'curso', device: 'mobile', maxStep: 'purchase', hasLead: true, hasPurchase: true, revenue: 100000, eventCount: 4, truncated: false },
      { visitId: 'ffffffff-aaaa-4bbb-8ccc-dddddddddddd', startedAt: '2026-11-18T14:00:00.000Z', lastActivityAt: '2026-11-18T14:01:00.000Z', channelGroup: 'direct', sourcePlatform: 'unknown', device: 'desktop', maxStep: 'visit', hasLead: false, hasPurchase: false, revenue: 0, eventCount: 1, truncated: true },
    ],
  },
});

export const journeyDetailResponse = (campaign = 'black') => ({
  generatedAt: '2026-11-18T15:00:00.000Z',
  data: {
    visit: {
      visitId: VISIT_ID, startedAt: '2026-11-18T15:00:00.000Z', lastActivityAt: '2026-11-18T15:10:00.000Z', entryPath: '/lp/curso', landingSlug: 'curso',
      channelGroup: 'meta_paid', sourcePlatform: 'instagram', acquisitionType: 'paid', reason: 'paid_medium', device: 'mobile', hasFbc: true, hasFbp: false,
      rawAttribution: { source: 'instagram', medium: 'cpc', campaign },
    },
    events: [
      { name: 'course_detail_view', occurredAt: '2026-11-18T15:01:00.000Z', source: 'browser', path: '/lp/curso', courseId: 'c1' },
      { name: 'lead', occurredAt: '2026-11-18T15:05:00.000Z', source: 'server' },
    ],
    conversions: [{ inscriptionId: 'a'.repeat(24), paymentStatus: 'paid', collected: 100000 }],
    truncated: false,
  },
});
