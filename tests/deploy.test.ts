import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { read, DIST } from './helpers';

describe('Netlify deploy config (netlify.toml)', () => {
  const toml = read('netlify.toml');
  it('builds with npm run build', () => {
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
  });
  it('publishes the dist folder', () => {
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
  });
  it('pins a Node version that satisfies the package engines (>= 22)', () => {
    const v = Number(toml.match(/NODE_VERSION\s*=\s*"(\d+)/)?.[1]);
    expect(v).toBeGreaterThanOrEqual(22);
  });
  it('matches the folder the build actually produces', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });
});

describe('astro.config.mjs hosting detection', () => {
  const cfg = read('astro.config.mjs');
  it('recognises Netlify production builds and URLs', () => {
    expect(cfg).toContain('CONTEXT');
    expect(cfg).toContain('env.URL');
    expect(cfg).toContain('DEPLOY_PRIME_URL');
  });
  it('still supports an explicit SITE_URL override', () => {
    expect(cfg).toContain('env.SITE_URL');
  });
});
