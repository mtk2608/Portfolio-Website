import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { distFile, read } from './helpers';
import { EXPERIENCE, ROLES } from '../src/experience';

/** Load the built landing page in jsdom and run the real public/timeline.js against it. */
function setup() {
  const dom = new JSDOM(readFileSync(distFile('/'), 'utf8'), { runScripts: 'outside-only' });
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
    expect(doc.querySelectorAll('#timeline li[data-role]').length).toBe(ROLES.length);
    expect(doc.querySelectorAll('dialog.role-dialog').length).toBe(ROLES.length);
  });
  it('shows each company with its duration and each role with period and title', () => {
    const text = doc.querySelector('#timeline')!.textContent!;
    EXPERIENCE.forEach((c) => {
      expect(text).toContain(c.name);
      expect(text).toContain(c.duration);
    });
    ROLES.forEach((r) => {
      expect(text).toContain(r.period);
      expect(text).toContain(r.title);
    });
  });
  it('shows no emoji icons on the timeline', () => {
    expect(doc.querySelector('#timeline')!.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
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

describe('experience timeline (grouping)', () => {
  const doc = setup();
  it('nests the three University of the Western Cape roles under a single company entry', () => {
    const company = doc.querySelector('#timeline > li[data-company="uwc"]')!;
    expect(company.querySelector('h3')?.textContent).toBe('University of the Western Cape');
    const roles = [...company.querySelectorAll('li[data-role] h4')].map((h) => h.textContent);
    expect(roles).toEqual(['Web Development Intern', 'Junior Front-End Developer', 'Front-End Mobile Developer']);
  });
  it('does not repeat the company name on each nested role', () => {
    const company = doc.querySelector('#timeline > li[data-company="uwc"]')!;
    company.querySelectorAll('li[data-role]').forEach((li) => {
      expect(li.textContent).not.toContain('University of the Western Cape');
    });
  });
  it('shows the Faculty of Sport next to the University of the Western Cape in the front-end role dialog', () => {
    const dlg = doc.getElementById('role-uwc-frontend')!;
    expect(dlg.textContent).toContain('University of the Western Cape · Faculty of Sport · Part-time · Remote');
  });
  it('shows the Innovation Hub next to the University of the Western Cape in the intern role dialog', () => {
    const dlg = doc.getElementById('role-uwc-web-intern')!;
    expect(dlg.textContent).toContain('University of the Western Cape · Innovation Hub · Full-time · On-site');
  });
  it('shows each unit on its own role only', () => {
    const intern = doc.querySelector('li[data-role="uwc-web-intern"]')!.textContent!;
    const frontend = doc.querySelector('li[data-role="uwc-frontend"]')!.textContent!;
    expect(frontend).toContain('Faculty of Sport');
    expect(frontend).not.toContain('Innovation Hub');
    expect(intern).toContain('Innovation Hub');
    expect(intern).not.toContain('Faculty of Sport');
  });
  it('keeps Sedna as a separate company', () => {
    expect(doc.querySelector('#timeline > li[data-company="sedna"] li[data-role="sedna-junior-dev"]')).toBeTruthy();
  });
});

describe('experience timeline (behaviour)', () => {
  let doc: Document;
  beforeEach(() => { doc = setup(); });

  it.each(ROLES.map((r) => r.id))('icon button opens the %s dialog', (id) => {
    const dlg = doc.getElementById(`role-${id}`)!;
    expect(dlg.hasAttribute('open')).toBe(false);
    (doc.querySelector(`button[data-open="${id}"]`) as HTMLElement).click();
    expect(dlg.hasAttribute('open')).toBe(true);
  });

  it('"Read more" link also opens the dialog', () => {
    const id = ROLES[0].id;
    const link = [...doc.querySelectorAll(`button[data-open="${id}"]`)].find((b) => b.textContent?.includes('Read more'))!;
    (link as HTMLElement).click();
    expect(doc.getElementById(`role-${id}`)!.hasAttribute('open')).toBe(true);
  });

  it('shows the full details inside the dialog', () => {
    const r = ROLES[0];
    const dlg = doc.getElementById(`role-${r.id}`)!;
    r.details.forEach((d) => expect(dlg.textContent).toContain(d));
    r.skills.forEach((s) => expect(dlg.textContent).toContain(s));
  });

  it('close button closes the dialog', () => {
    const id = ROLES[0].id;
    const dlg = doc.getElementById(`role-${id}`)!;
    (doc.querySelector(`button[data-open="${id}"]`) as HTMLElement).click();
    (dlg.querySelector('[data-close]') as HTMLElement).click();
    expect(dlg.hasAttribute('open')).toBe(false);
  });

  it('clicking outside the dialog box closes it, clicking inside does not', () => {
    const id = ROLES[0].id;
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
