export const SITE = {
  name: 'Mogamad Tayieb Kamaldien',
  short: 'Tayieb',
  // Online alias / domain name, shown in the nav as "thefit" + highlighted "dev"
  alias: { main: 'thefit', accent: 'dev' },
  role: 'Mobile Application Developer',
  location: 'Cape Town, South Africa',
  description:
    'Mogamad Tayieb Kamaldien: software developer from Cape Town, community member, Ironman chaser. Projects and experience.',
  github: 'https://github.com/mtk2608',
  email: 'kamaldientayieb@gmail.com',
};

// `section` = id of the landing-page section; `match` = detail-page path prefix that also highlights it.
export const NAV = [
  { href: '/#projects', label: 'Projects', section: 'projects', match: '/projects' },
  { href: '/#experience', label: 'Experience', section: 'experience', match: undefined },
  { href: '/#about', label: 'About', section: 'about', match: undefined },
  { href: '/#contact', label: 'Contact', section: 'contact', match: undefined },
];
