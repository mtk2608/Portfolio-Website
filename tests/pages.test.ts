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

  it('shows every nav item as a section link, and the logo links home', () => {
    const links = [...doc.querySelectorAll('nav[aria-label=Main] a[data-section]')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(NAV.map((n) => n.label));
    links.forEach((a, i) => expect(a.getAttribute('href')).toBe(NAV[i].href));
    expect(doc.querySelector('nav[aria-label=Main] a[href="/"]')).toBeTruthy();
  });

  it('shows the thefitdev wordmark as the logo', () => {
    const logo = doc.querySelector('nav[aria-label=Main] a[href="/"]')!;
    expect(logo.textContent).toBe('thefitdev');
    expect(logo.getAttribute('aria-label')).toBe('thefitdev home');
  });

  it('marks the matching nav item on detail pages only', () => {
    const current = [...doc.querySelectorAll('nav[aria-label=Main] [aria-current=page]')].map((a) => a.textContent?.trim());
    const expected = NAV.filter((n) => n.match && route.startsWith(n.match + '/')).map((n) => n.label);
    expect(current).toEqual(expected);
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

describe('landing page', () => {
  const doc = loadPage('/');

  it('shows the hero with the owner short name', () => {
    expect(doc.querySelector('h1')?.textContent).toContain(SITE.short);
  });

  it('has a section for every nav item, in nav order, with a heading', () => {
    const ids = [...doc.querySelectorAll('main > section[id]')].map((s) => s.id);
    expect(ids).toEqual(NAV.map((n) => n.section));
    ids.forEach((id) => {
      const labelled = doc.getElementById(id)!.getAttribute('aria-labelledby');
      expect(doc.getElementById(labelled!)?.textContent?.trim(), id).toBeTruthy();
    });
  });

  it('hero buttons jump to the projects and contact sections', () => {
    expect(doc.querySelector('a[href="#projects"]')).toBeTruthy();
    expect(doc.querySelector('a[href="#contact"]')).toBeTruthy();
  });

  describe('projects section', () => {
    const s = doc.getElementById('projects')!;
    it('lists Hangman linking to its detail page', () => {
      expect(s.querySelector('a[href="/projects/hangman"]')?.textContent).toContain('Hangman');
    });
  });

  describe('experience section', () => {
    it('contains the timeline', () => {
      expect(doc.querySelector('#experience #timeline')).toBeTruthy();
    });
  });

  describe('hero portrait', () => {
    it('shows your photo in the hero with alt text, and not again in About', () => {
      const hero = doc.querySelector('section[aria-label=Introduction]')!;
      expect(hero.querySelector('img')?.getAttribute('alt')).toBeTruthy();
      expect(doc.querySelectorAll('#about img').length).toBe(0);
    });
  });

  describe('about section', () => {
    const s = doc.getElementById('about')!;
    it('shows the community, endurance and hustle cards', () => {
      const cards = [...s.querySelectorAll('ul[aria-label="Beyond code"] > li h3')].map((h) => h.textContent);
      expect(cards).toEqual(['Community', 'Endurance', 'Hustle']);
      expect(s.textContent).toContain('CPT Microsoft Developer User Group');
      expect(s.textContent).toContain('Ironman');
    });
    it('has toolbox, education and certificates', () => {
      const h3 = [...s.querySelectorAll('h3')].map((h) => h.textContent?.trim());
      expect(h3).toEqual(expect.arrayContaining(['Toolbox', 'Education', 'Certificates']));
      ['C#', '.NET MAUI', 'Azure', 'SQLite'].forEach((t) => expect(s.textContent).toContain(t));
      ['Samsung Innovation Lab', 'Northlink College'].forEach((t) => expect(s.textContent).toContain(t));
    });
    it('links the freeCodeCamp certificates', () => {
      const hrefs = [...s.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
      expect(hrefs.some((h) => h.includes('foundational-c-sharp-with-microsoft'))).toBe(true);
      expect(hrefs.some((h) => h.includes('responsive-web-design'))).toBe(true);
    });
  });

  describe('contact section', () => {
    it('has a mailto link to the owner', () => {
      expect(doc.querySelector(`#contact a[href="mailto:${SITE.email}"]`)).toBeTruthy();
    });
  });

  it('no longer has an album', () => {
    expect(doc.body.textContent?.toLowerCase()).not.toContain('life album');
    expect(existsSync(distFile('/life'))).toBe(false);
  });
});

describe('old page URLs redirect to landing sections', () => {
  it.each([
    ['/about', '#about'],
    ['/projects', '#projects'],
  ])('%s -> /%s', (path, hash) => {
    const html = readFileSync(distFile(path), 'utf8');
    expect(html).toContain(`url=/${hash}`);
  });
});

describe('project detail page', () => {
  const doc = loadPage('/projects/hangman');
  it('shows Hangman with its GitHub link and a way back', () => {
    expect(doc.querySelector('h1')?.textContent).toBe('Hangman');
    expect(doc.querySelector('a[href="https://github.com/mtk2608/Hangman"]')).toBeTruthy();
    expect(doc.querySelector('a[href="/#projects"]')).toBeTruthy();
  });
});

describe('blog post page', () => {
  const doc = loadPage('/blog/hello-world');
  it('renders the post with a datetime and a way back', () => {
    expect(doc.querySelector('article')?.textContent?.length).toBeGreaterThan(50);
    expect(doc.querySelector('time[datetime]')).toBeTruthy();
    expect(doc.querySelector('a[href="/"]')).toBeTruthy();
  });
});

describe('feeds and static files', () => {
  it('builds a sitemap index', () => expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true));
  it('builds an RSS feed containing the post', () => {
    const xml = readFileSync(join(DIST, 'rss.xml'), 'utf8');
    expect(xml).toContain('<rss');
    expect(xml).toContain('Hello, world');
  });
  it('ships a favicon and the nav script', () => {
    expect(existsSync(join(DIST, 'favicon.svg'))).toBe(true);
    expect(existsSync(join(DIST, 'nav.js'))).toBe(true);
  });
});
