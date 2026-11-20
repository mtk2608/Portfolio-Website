import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { distFile, read } from './helpers';
import { EXPERIENCE } from '../src/experience';

/** Load the built About page in jsdom and run the real public/timeline.js against it. */
function setup() {
  const dom = new JSDOM(readFileSync(distFile('/about'), 'utf8'), { runScripts: 'outside-only' });
  const { window } = dom;
  // jsdom doesn't implement <dialog> methods, so emulate the open state.
  window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  window.eval(read('public/timeline.js'));
  return window.document;
}

describe('experience timeline (markup)', () => {
  const doc = setup();
  it('renders one entry and one dialog per role', () => {
    expect(doc.querySelectorAll('#timeline > li').length).toBe(EXPERIENCE.length);
    expect(doc.querySelectorAll('dialog.role-dialog').length).toBe(EXPERIENCE.length);
  });
  it('shows period, title and org for each role', () => {
    const text = doc.querySelector('#timeline')!.textContent!;
    EXPERIENCE.forEach((r) => {
      expect(text).toContain(r.period);
      expect(text).toContain(r.title);
      expect(text).toContain(r.org);
    });
  });
  it('gives the icon buttons accessible labels', () => {
    doc.querySelectorAll('button[data-open][aria-label]').forEach((b) => {
      expect(b.getAttribute('aria-label')).toMatch(/^Read more:/);
      expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    });
  });
  it('labels each dialog by its title', () => {
    doc.querySelectorAll('dialog').forEach((d) => {
      const id = d.getAttribute('aria-labelledby')!;
      expect(doc.getElementById(id)?.textContent).toBeTruthy();
    });
  });
});

describe('experience timeline (behaviour)', () => {
  let doc: Document;
  beforeEach(() => { doc = setup(); });

  it.each(EXPERIENCE.map((r) => r.id))('icon button opens the %s dialog', (id) => {
    const dlg = doc.getElementById(`role-${id}`)!;
    expect(dlg.hasAttribute('open')).toBe(false);
    (doc.querySelector(`button[data-open="${id}"]`) as HTMLElement).click();
    expect(dlg.hasAttribute('open')).toBe(true);
  });

  it('"Read more" link also opens the dialog', () => {
    const id = EXPERIENCE[0].id;
    const link = [...doc.querySelectorAll(`button[data-open="${id}"]`)].find((b) => b.textContent?.includes('Read more'))!;
    (link as HTMLElement).click();
    expect(doc.getElementById(`role-${id}`)!.hasAttribute('open')).toBe(true);
  });

  it('shows the full details inside the dialog', () => {
    const r = EXPERIENCE[0];
    const dlg = doc.getElementById(`role-${r.id}`)!;
    r.details.forEach((d) => expect(dlg.textContent).toContain(d));
    r.skills.forEach((s) => expect(dlg.textContent).toContain(s));
  });

  it('close button closes the dialog', () => {
    const id = EXPERIENCE[0].id;
    const dlg = doc.getElementById(`role-${id}`)!;
    (doc.querySelector(`button[data-open="${id}"]`) as HTMLElement).click();
    (dlg.querySelector('[data-close]') as HTMLElement).click();
    expect(dlg.hasAttribute('open')).toBe(false);
  });

  it('clicking outside the dialog box closes it, clicking inside does not', () => {
    const id = EXPERIENCE[0].id;
    const dlg = doc.getElementById(`role-${id}`)!;
    const open = () => (doc.querySelector(`button[data-open="${id}"]`) as HTMLElement).click();
    const click = (x: number, y: number) =>
      dlg.dispatchEvent(new (doc.defaultView as any).MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    // jsdom has no layout: getBoundingClientRect is all zeros, so (0,0) is "inside", (50,50) is outside.
    open(); click(0, 0);
    expect(dlg.hasAttribute('open')).toBe(true);
    click(50, 50);
    expect(dlg.hasAttribute('open')).toBe(false);
  });
});
