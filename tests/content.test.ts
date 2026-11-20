import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { read, files, frontmatter, ROOT } from './helpers';

describe('projects content', () => {
  const list = files('src/content/projects', '.md');
  it('has at least one project', () => expect(list.length).toBeGreaterThan(0));
  it.each(list)('%s has valid frontmatter', (f) => {
    const fm = frontmatter(read('src/content/projects', f));
    expect(fm.title).toBeTruthy();
    expect(fm.summary).toBeTruthy();
    expect(fm.stack).toMatch(/^\[.+\]$/);
    expect(['Live', 'In progress', 'Archived']).toContain(fm.status);
    if (fm.repo) expect(new URL(fm.repo).protocol).toBe('https:');
    if (fm.demo) expect(new URL(fm.demo).protocol).toBe('https:');
  });
  it.each(list)('%s cover image exists', (f) => {
    const { cover } = frontmatter(read('src/content/projects', f));
    if (cover) expect(existsSync(join(ROOT, 'src/content/projects', cover))).toBe(true);
  });
  it('includes the Hangman project pointing at its GitHub repo', () => {
    const fm = frontmatter(read('src/content/projects/hangman.md'));
    expect(fm.title).toBe('Hangman');
    expect(fm.repo).toBe('https://github.com/mtk2608/Hangman');
  });
});

describe('blog content', () => {
  const list = files('src/content/blog', '.md');
  it('has at least one post', () => expect(list.length).toBeGreaterThan(0));
  it.each(list)('%s has valid frontmatter', (f) => {
    const fm = frontmatter(read('src/content/blog', f));
    expect(fm.title).toBeTruthy();
    expect(fm.description).toBeTruthy();
    expect(Number.isNaN(Date.parse(fm.date))).toBe(false);
  });
  it('has a non-empty body for every post', () => {
    for (const f of list) {
      const body = read('src/content/blog', f).replace(/^---[\s\S]*?---/, '').trim();
      expect(body.length, f).toBeGreaterThan(20);
    }
  });
});

describe('album content', () => {
  const list = files('src/content/album', '.json');
  it('has entries', () => expect(list.length).toBeGreaterThan(0));
  it.each(list)('%s is valid JSON with caption and category', (f) => {
    const j = JSON.parse(read('src/content/album', f));
    expect(j.caption).toBeTruthy();
    expect(j.category).toBeTruthy();
  });
});
