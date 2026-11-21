import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { read, DIST } from './helpers';

const headers = read('public/_headers');
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';
const directive = (name: string) =>
  csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' ')) ?? '';

/** Every built HTML file in dist/. */
function htmlFiles(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

describe('security headers (public/_headers)', () => {
  it('defines a CSP that only allows same-origin scripts', () => {
    expect(directive('script-src')).toBe("script-src 'self'");
    expect(csp).not.toContain('unsafe-eval');
  });
  it('allows no inline styles or scripts anywhere in the CSP', () => {
    expect(directive('style-src')).toBe("style-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
  });
  it('enforces Trusted Types to block DOM XSS sinks', () => {
    expect(csp).toContain("require-trusted-types-for 'script'");
    expect(csp).toContain("trusted-types 'none'");
  });
  it('blocks framing, plugins, workers and foreign form posts', () => {
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "frame-src 'none'", "worker-src 'none'", "form-action 'self'", "base-uri 'self'"]) {
      expect(csp).toContain(d);
    }
  });
  it.each([
    'Strict-Transport-Security: max-age=63072000',
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy: same-origin',
    'Cross-Origin-Resource-Policy: same-origin',
    'X-Permitted-Cross-Domain-Policies: none',
  ])('sets %s', (h) => expect(headers).toContain(h));
  it.each(['camera', 'microphone', 'geolocation', 'payment', 'usb', 'bluetooth', 'browsing-topics'])(
    'Permissions-Policy disables %s',
    (f) => expect(headers).toMatch(new RegExp(`Permissions-Policy:.*\\b${f}=\\(\\)`)),
  );
  it('ships _headers in the build output', () => {
    expect(existsSync(join(DIST, '_headers'))).toBe(true);
  });
});

describe('built HTML is compatible with the strict CSP', () => {
  const pages = htmlFiles();

  it('finds built pages', () => expect(pages.length).toBeGreaterThan(0));
  it.each(pages.map((p) => [p.slice(DIST.length), p]))('%s has no inline styles or scripts', (_, file) => {
    const html = readFileSync(file, 'utf8');
    expect(html).not.toMatch(/<style[\s>]/i);
    expect(html).not.toMatch(/\sstyle=/i);
    expect(html).not.toMatch(/\son[a-z]+=/i); // inline event handlers
    expect(html).not.toMatch(/href=["']?javascript:/i);
    // every <script> must load a same-origin file
    for (const tag of html.match(/<script\b[^>]*>/gi) ?? []) {
      expect(tag).toMatch(/\ssrc=["']?\//);
    }
  });
});

describe('security.txt (RFC 9116)', () => {
  const txt = read('public/.well-known/security.txt');

  it('has a Contact and is served from the build', () => {
    expect(txt).toMatch(/^Contact: https:\/\//m);
    expect(existsSync(join(DIST, '.well-known', 'security.txt'))).toBe(true);
  });
  it('has not expired and is not about to (renew 30 days ahead)', () => {
    const expires = new Date(txt.match(/^Expires: (.+)$/m)?.[1] ?? '');
    expect(expires.getTime()).toBeGreaterThan(Date.now() + 30 * 24 * 3600 * 1000);
  });
});
