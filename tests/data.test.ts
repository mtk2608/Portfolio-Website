import { describe, it, expect } from 'vitest';
import { SITE, NAV } from '../src/site';
import { EXPERIENCE } from '../src/experience';

describe('SITE config', () => {
  it('has the required identity fields', () => {
    for (const k of ['name', 'short', 'role', 'location', 'description', 'github', 'email'] as const) {
      expect(SITE[k], k).toBeTruthy();
    }
  });
  it('has a valid github URL and email', () => {
    expect(new URL(SITE.github).hostname).toBe('github.com');
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});

describe('NAV', () => {
  it('lists Home, Projects, Blog and About in order', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Home', 'Projects', 'Blog', 'About']);
  });
  it('uses root-relative, unique hrefs', () => {
    const hrefs = NAV.map((n) => n.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    hrefs.forEach((h) => expect(h.startsWith('/')).toBe(true));
  });
});

describe('EXPERIENCE', () => {
  it('has at least one role', () => expect(EXPERIENCE.length).toBeGreaterThan(0));
  it('has unique, URL-safe ids', () => {
    const ids = EXPERIENCE.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });
  it.each(EXPERIENCE.map((r) => [r.id, r] as const))('role %s is fully populated', (_id, r) => {
    for (const k of ['icon', 'title', 'org', 'period', 'summary'] as const) expect(r[k], k).toBeTruthy();
    expect(r.details.length).toBeGreaterThan(0);
    expect(r.skills.length).toBeGreaterThan(0);
  });
});
