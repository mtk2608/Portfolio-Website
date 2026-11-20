import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { read, DIST } from './helpers';

describe('security headers (public/_headers)', () => {
  const headers = read('public/_headers');
  const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';

  it('defines a CSP that only allows same-origin scripts', () => {
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
  });
  it('blocks framing, plugins and foreign form posts', () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
  });
  it.each([
    'Strict-Transport-Security',
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy',
    'Permissions-Policy',
  ])('sets %s', (h) => expect(headers).toContain(h));
  it('ships _headers in the build output', () => {
    expect(existsSync(join(DIST, '_headers'))).toBe(true);
  });
});
