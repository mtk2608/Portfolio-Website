import { describe, it, expect } from 'vitest';
import { SITE, NAV } from '../src/site';
import { EXPERIENCE, ROLES } from '../src/experience';

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
  it('lists Projects, Experience, About and Contact in order', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Projects', 'Experience', 'About', 'Contact']);
  });
  it('points every item at a landing-page section anchor', () => {
    NAV.forEach((n) => expect(n.href).toBe(`/#${n.section}`));
  });
  it('has unique section ids', () => {
    const ids = NAV.map((n) => n.section);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('EXPERIENCE', () => {
  it('has at least one company', () => expect(EXPERIENCE.length).toBeGreaterThan(0));
  it('has unique, URL-safe company and role ids', () => {
    const ids = [...EXPERIENCE.map((c) => c.id), ...ROLES.map((r) => r.id)];
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });
  it.each(EXPERIENCE.map((c) => [c.id, c] as const))('company %s is fully populated', (_id, c) => {
    for (const k of ['name', 'location', 'period', 'duration'] as const) expect(c[k], k).toBeTruthy();
    expect(c.roles.length).toBeGreaterThan(0);
  });
  it.each(ROLES.map((r) => [r.id, r] as const))('role %s is fully populated', (_id, r) => {
    for (const k of ['title', 'type', 'period', 'summary', 'company'] as const) expect(r[k], k).toBeTruthy();
    expect(r.details.length).toBeGreaterThan(0);
    expect(r.skills.length).toBeGreaterThan(0);
  });
  it('groups the three University of the Western Cape roles under one company', () => {
    const uwc = EXPERIENCE.find((c) => c.id === 'uwc')!;
    expect(uwc.name).toBe('University of the Western Cape');
    expect(uwc.roles.map((r) => r.title)).toEqual([
      'Web Development Intern',
      'Junior Front-End Developer',
      'Front-End Mobile Developer',
    ]);
  });
  it('lists Sedna as its own, most recent company', () => {
    expect(EXPERIENCE[0].name).toBe('Sedna Inc');
    expect(EXPERIENCE[0].period).toMatch(/Present$/);
  });
});
