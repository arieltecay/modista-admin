import { describe, expect, it } from 'vitest';
import { DEFAULT_TIMEZONE, defaultFilters, parseFilters, serializeFilters, toApiParams } from './filters';

const TODAY = new Date('2026-11-18T15:00:00.000Z');
const parse = (query: string) => parseFilters(new URLSearchParams(query), TODAY);

describe('default filters', () => {
  it('covers the last 30 local days in the default timezone with the documented defaults', () => {
    expect(defaultFilters(TODAY)).toEqual({
      from: '2026-10-20', to: '2026-11-18', timezone: DEFAULT_TIMEZONE, reportingMode: 'acquisition_cohort', outcomeWindowDays: 30, perspective: 'visit_touch',
    });
  });

  it('uses the local day, not the UTC day, near midnight', () => {
    const afterUtcMidnight = new Date('2026-11-19T01:30:00.000Z'); // still the 18th in Tucumán
    expect(defaultFilters(afterUtcMidnight).to).toBe('2026-11-18');
  });
});

describe('parseFilters', () => {
  it('reads every filter from the query string', () => {
    expect(parse('from=2026-11-01&to=2026-11-10&timezone=UTC&reportingMode=event_period&outcomeWindowDays=7&perspective=first_touch&channel=meta_paid&campaign=black&landing=curso&device=mobile')).toEqual({
      from: '2026-11-01', to: '2026-11-10', timezone: 'UTC', reportingMode: 'event_period', outcomeWindowDays: 7, perspective: 'first_touch',
      channel: 'meta_paid', campaign: 'black', landing: 'curso', device: 'mobile',
    });
  });

  it('falls back to defaults for anything invalid instead of breaking the page', () => {
    const parsed = parse('from=ayer&to=2026-13-40&timezone=Mars/Olympus&reportingMode=rolling&outcomeWindowDays=14&perspective=linear&device=fridge');
    expect(parsed).toEqual(defaultFilters(TODAY));
  });

  it('resets an inverted range to the default range', () => {
    const parsed = parse('from=2026-11-10&to=2026-11-01');
    expect([parsed.from, parsed.to]).toEqual(['2026-10-20', '2026-11-18']);
  });

  it('trims and bounds free text filters and drops empty ones', () => {
    const parsed = parse(`campaign=%20black%20&landing=&channel=${'x'.repeat(300)}`);
    expect(parsed.campaign).toBe('black');
    expect(parsed.landing).toBeUndefined();
    expect(parsed.channel).toHaveLength(120);
  });
});

describe('serializeFilters / toApiParams', () => {
  it('round-trips through the URL', () => {
    const filters = parse('from=2026-11-01&to=2026-11-10&perspective=last_non_direct&campaign=black&reportingMode=event_period');
    expect(parseFilters(serializeFilters(filters), TODAY)).toEqual(filters);
  });

  it('leaves out filters that are not set', () => {
    const serialized = serializeFilters(defaultFilters(TODAY)).toString();
    for (const key of ['channel', 'campaign', 'landing', 'device']) expect(serialized).not.toContain(key);
  });

  it('sends the outcome window only in cohort mode and never undefined values', () => {
    expect(toApiParams(defaultFilters(TODAY)).outcomeWindowDays).toBe(30);
    expect('outcomeWindowDays' in toApiParams({ ...defaultFilters(TODAY), reportingMode: 'event_period' })).toBe(false);
    expect(Object.values(toApiParams(defaultFilters(TODAY))).every((value) => value !== undefined)).toBe(true);
  });
});
