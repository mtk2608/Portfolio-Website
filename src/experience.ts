export interface Role {
  id: string;
  icon: string;
  title: string;
  org: string;
  period: string;
  summary: string;
  details: string[];
  skills: string[];
}

// Newest first. Add a new role by adding an object here.
export const EXPERIENCE: Role[] = [
  {
    id: 'sil-uwc',
    icon: '📱',
    title: 'Front-End Mobile Developer',
    org: 'University of the Western Cape · Samsung Innovation Lab',
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
];
