import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, ROUTES, loadPage, distFile } from './helpers';
import { SITE, NAV } from '../src/site';

describe.each(ROUTES)('page %s', (route) => {
  const doc = loadPage(route);

  it('has lang, charset, viewport, title and description', () => {
    expect(doc.documentElement.lang).toBe('en');
    expect(doc.querySelector('meta[charset]')).toBeTruthy();
    expect(doc.querySelector('meta[name=viewport]')).toBeTruthy();
    expect(doc.title.trim().length).toBeGreaterThan(0);
    expect(doc.querySelector('meta[name=description]')?.getAttribute('content')?.length).toBeGreaterThan(10);
  });

  it('has exactly one h1 and a main landmark', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
    expect(doc.querySelector('main#main')).toBeTruthy();
  });

  it('has a skip link targeting main', () => {
    expect(doc.querySelector('a[href="#main"]')).toBeTruthy();
  });

  it('shows every nav item and marks the current page', () => {
    const links = [...doc.querySelectorAll('nav[aria-label=Main] a')].filter((a) => a.getAttribute('href') !== '/' || a.textContent?.includes('Home'));
    const labels = links.map((a) => a.textContent?.trim());
    NAV.forEach((n) => expect(labels).toContain(n.label));
    const current = doc.querySelectorAll('nav[aria-label=Main] [aria-current=page]');
    const expected = NAV.filter((n) => (n.href === '/' ? route === '/' : route === n.href || route.startsWith(n.href + '/')));
    expect(current.length).toBe(expected.length);
  });

  it('gives every image an alt attribute', () => {
    doc.querySelectorAll('img').forEach((img) => expect(img.hasAttribute('alt')).toBe(true));
  });

  it('resolves every internal link to built output', () => {
    doc.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href')!;
      if (/^(https?:|mailto:|#)/.test(href)) return;
      expect(existsSync(distFile(href)), `${route} -> ${href}`).toBe(true);
    });
  });

  it('opens external links safely', () => {
    doc.querySelectorAll('a[href^="http"]').forEach((a) => {
      expect(a.getAttribute('rel') ?? '', a.getAttribute('href')!).toMatch(/noopener/);
    });
  });

  it('loads no inline scripts and no third-party assets', () => {
    doc.querySelectorAll('script').forEach((s) => {
      const src = s.getAttribute('src');
      expect(src, 'inline script found').toBeTruthy();
      expect(src!.startsWith('http')).toBe(false);
    });
    doc.querySelectorAll('link[rel=stylesheet]').forEach((l) => {
      expect(l.getAttribute('href')!.startsWith('http')).toBe(false);
    });
  });
});

describe('home page', () => {
  const doc = loadPage('/');
  it('shows the hero with the owner short name', () => {
    expect(doc.querySelector('h1')?.textContent).toContain(SITE.short);
  });
  it('links to projects, about, blog and the featured project', () => {
    const hrefs = [...doc.querySelectorAll('main a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/projects', '/about', '/blog', '/projects/hangman']));
  });
  it('has a contact mailto link and a #contact target', () => {
    expect(doc.querySelector(`a[href="mailto:${SITE.email}"]`)).toBeTruthy();
    expect(doc.querySelector('#contact')).toBeTruthy();
  });
  it('lists the toolbox skills', () => {
    const text = doc.body.textContent ?? '';
    ['C#', '.NET MAUI', 'Azure', 'SQLite'].forEach((s) => expect(text).toContain(s));
  });
});

describe('about page', () => {
  const doc = loadPage('/about');
  it('has experience, education and certificates sections', () => {
    const h2 = [...doc.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(h2).toEqual(expect.arrayContaining(['Experience', 'Education', 'Certificates']));
  });
  it('links the freeCodeCamp certificates', () => {
    const hrefs = [...doc.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.includes('foundational-c-sharp-with-microsoft'))).toBe(true);
    expect(hrefs.some((h) => h.includes('responsive-web-design'))).toBe(true);
  });
  it('has a portrait with alt text', () => {
    expect(doc.querySelector('aside img')?.getAttribute('alt')).toBeTruthy();
  });
});

describe('projects pages', () => {
  it('lists Hangman on the index', () => {
    expect(loadPage('/projects').body.textContent).toContain('Hangman');
  });
  it('shows the Hangman detail with its GitHub link', () => {
    const doc = loadPage('/projects/hangman');
    expect(doc.querySelector('h1')?.textContent).toBe('Hangman');
    expect(doc.querySelector('a[href="https://github.com/mtk2608/Hangman"]')).toBeTruthy();
  });
});

describe('blog pages', () => {
  it('lists the hello-world post', () => {
    expect(loadPage('/blog').querySelector('a[href="/blog/hello-world"]')).toBeTruthy();
  });
  it('renders the post with a datetime', () => {
    const doc = loadPage('/blog/hello-world');
    expect(doc.querySelector('article')?.textContent?.length).toBeGreaterThan(50);
    expect(doc.querySelector('time[datetime]')).toBeTruthy();
  });
});

describe('feeds and static files', () => {
  it('builds a sitemap index', () => expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true));
  it('builds an RSS feed containing the post', () => {
    const xml = readFileSync(join(DIST, 'rss.xml'), 'utf8');
    expect(xml).toContain('<rss');
    expect(xml).toContain('Hello, world');
  });
  it('ships a favicon', () => expect(existsSync(join(DIST, 'favicon.svg'))).toBe(true));
});
