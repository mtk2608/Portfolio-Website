import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { distFile, read } from './helpers';
import { NAV } from '../src/site';

/** Run the real public/nav.js with a controllable IntersectionObserver stub. */
function setup() {
  const dom = new JSDOM(readFileSync(distFile('/'), 'utf8'), { runScripts: 'outside-only' });
  const w = dom.window as any;
  let callback: (e: any[]) => void = () => {};
  w.IntersectionObserver = class {
    constructor(cb: any) { callback = cb; }
    observe() {}
  };
  w.eval(read('public/nav.js'));
  const show = (id: string) => callback([{ isIntersecting: true, intersectionRatio: 1, target: w.document.getElementById(id) }]);
  const current = () =>
    [...w.document.querySelectorAll('nav[aria-label=Main] [aria-current]')].map((a: any) => a.dataset.section);
  return { show, current };
}

describe('nav scroll-spy', () => {
  it('starts with nothing highlighted on the landing page', () => {
    expect(setup().current()).toEqual([]);
  });
  it.each(NAV.map((n) => n.section))('highlights only "%s" when that section is in view', (id) => {
    const { show, current } = setup();
    show(id);
    expect(current()).toEqual([id]);
  });
  it('moves the highlight as the visible section changes', () => {
    const { show, current } = setup();
    show('projects');
    show('about');
    expect(current()).toEqual(['about']);
  });
});
