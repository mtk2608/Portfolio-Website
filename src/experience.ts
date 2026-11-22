export interface Role {
  id: string;
  title: string;
  /** Optional department or faculty within the company, e.g. "Faculty of Sport" */
  unit?: string;
  /** e.g. "Full-time · On-site" */
  type: string;
  period: string;
  summary: string;
  details: string[];
  skills: string[];
}

/** One employer / organisation, with every role held there (newest role first). */
export interface Company {
  id: string;
  name: string;
  location: string;
  /** Overall span at the organisation, e.g. "May 2024 – Nov 2025" */
  period: string;
  /** e.g. "1 yr 7 mos" */
  duration: string;
  roles: Role[];
}

// Newest first. Add a role by adding it to its company's `roles`; add an employer by adding a Company.
export const EXPERIENCE: Company[] = [
  {
    id: 'sedna',
    name: 'Sedna Inc',
    location: 'Cape Town, South Africa',
    period: 'Nov 2025 – Present',
    duration: '1 yr 1 mo',
    roles: [
      {
        id: 'sedna-junior-dev',
        title: 'Junior Application Developer',
        type: 'Full-time',
        period: 'Nov 2025 – Present',
        summary: 'Mostly front-end: building features and keeping the client-facing side working, with back-end work when needed.',
        details: [
          'Work mainly as a front-end developer, building out new features for the client-facing side of the product.',
          'Make sure what users see and interact with works reliably and as expected.',
          'Step into the back-end when the team needs it, so I can follow a feature through from the screen to the server.',
          'Break down problems and work through them as part of a development team.',
        ],
        skills: ['ASP.NET Core', 'Blazor Hybrid', 'Front-End Development', 'Problem Solving'],
      },
    ],
  },
  {
    id: 'uwc',
    name: 'University of the Western Cape',
    location: 'Cape Town, South Africa',
    period: 'May 2024 – Nov 2025',
    duration: '1 yr 7 mos',
    roles: [
      {
        id: 'uwc-web-intern',
        title: 'Web Development Intern',
        unit: 'Innovation Hub',
        type: 'Full-time · On-site',
        period: 'Jul 2025 – Nov 2025',
        summary: 'Built parts of the UWC Immersive Zone website and a media portal for marketing staff.',
        details: [
          'Built out part of the UWC Immersive Zone website.',
          'Built the media portal where marketing staff can upload articles and posts, which then publish to the main website.',
          'Learned the basics of Unity alongside the web work.',
        ],
        skills: ['HTML', 'Google Cloud Platform', 'Unity'],
      },
      {
        id: 'uwc-frontend',
        title: 'Junior Front-End Developer',
        unit: 'Faculty of Sport',
        type: 'Part-time · Remote',
        period: 'Jul 2024 – Nov 2025',
        summary: 'Designed and built user interfaces across ASP.NET Core, Flutter and React, visualised data and integrated APIs.',
        details: [
          'Aided in the design of the UI/UX.',
          'Built user interfaces across a mix of technologies: ASP.NET Core, Flutter and React, along with HTML and CSS.',
          'Visualised data.',
          'Integrated APIs.',
        ],
        skills: ['ASP.NET Core', 'Flutter', 'React', 'HTML', 'CSS', 'C#'],
      },
      {
        id: 'sil-uwc',
        title: 'Front-End Mobile Developer',
        type: 'Samsung Innovation Lab',
        period: 'May 2024 – Aug 2024',
        summary: 'Built a mobile app tackling a Sustainable Development Goal, as part of a team.',
        details: [
          'As our final graduation project, my group built an application that addressed one of the Sustainable Development Goals.',
          'We worked in sprints using the Agile methodology, with some Waterfall methods as well.',
          'As Front-End Developer, I created the assigned UI pages and the logic that came with them.',
          'I learnt to work effectively in a team, the importance of meeting deadlines, and how to overcome issues as they arise.',
        ],
        skills: ['Mobile UI', 'Agile', 'Teamwork', 'C#'],
      },
    ],
  },
];

/** Flat list of every role with its company name, for dialogs and tests. */
export const ROLES = EXPERIENCE.flatMap((c) => c.roles.map((r) => ({ ...r, company: c.name, companyId: c.id })));
