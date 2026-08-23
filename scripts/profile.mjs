/**
 * Single source of truth for everything the generated artwork says.
 *
 * Rule for this file: nothing goes in that is not verifiable from the GitHub
 * profile, the repositories, or their manifests. The stack list below was read
 * out of real package.json files, not assembled from memory.
 */

export const IDENTITY = {
  name: 'Pema Wangchuk',
  handle: 'pemawangchuk2023',
  eyebrow: 'PUBLIC FINANCE  ×  SOFTWARE ENGINEERING',
  role: 'Deputy Chief Finance Officer · Cluster Finance Services, Bhutan',
  lede: [
    'Public-sector finance by day, production software by night. I care about',
    'the same thing in both: systems that stay honest when nobody is watching.',
  ],
  status: 'OPEN TO COLLABORATE',
  chips: ['Thimphu, Bhutan', 'Building in public since 2023', 'TypeScript · Solidity · Next.js'],
  links: {
    linkedin: 'https://linkedin.com/in/pema-wangchuk-5561aa224',
    repos: 'https://github.com/pemawangchuk2023?tab=repositories',
    stars: 'https://github.com/pemawangchuk2023?tab=stars',
  },
};

export const DOMAINS = [
  {
    n: '01',
    icon: 'ledger',
    accent: 'accent',
    title: 'Public finance',
    body: 'Deputy Chief Finance Officer for cluster finance services — budgets, controls and accountability at ministry scale.',
    meta: 'BUDGETS · CONTROLS · ASSURANCE',
  },
  {
    n: '02',
    icon: 'code',
    accent: 'accent2',
    title: 'Software engineering',
    body: 'Full-stack TypeScript. Next.js applications with real auth, real databases and interfaces that survive actual users.',
    meta: 'NEXT.JS · TYPESCRIPT · POSTGRES',
  },
  {
    n: '03',
    icon: 'chain',
    accent: 'accent4',
    title: 'Open protocols',
    body: "Bitcoin's history and cypherpunk roots, plus the Solidity contracts that let strangers coordinate without a middleman.",
    meta: 'BITCOIN · SOLIDITY · CYPHERPUNK',
  },
];

/** Dot colours are the projects' own brand marks; `null` falls back to ink. */
export const STACK = [
  {
    label: 'INTERFACE',
    items: [
      ['TypeScript', '#3178C6'],
      ['React', '#61DAFB'],
      ['Next.js', null],
      ['Tailwind CSS', '#38BDF8'],
      ['shadcn/ui', null],
      ['Radix UI', '#6E56CF'],
      ['GSAP', '#0AE448'],
      ['Three.js', null],
    ],
  },
  {
    label: 'DATA & AUTH',
    items: [
      ['Node.js', '#5FA04E'],
      ['PostgreSQL', '#4169E1'],
      ['MongoDB', '#47A248'],
      ['Mongoose', '#B03A2E'],
      ['Better Auth', null],
      ['Clerk', '#6C47FF'],
      ['NextAuth', '#A855F7'],
      ['AWS S3', '#FF9900'],
    ],
  },
  {
    label: 'PROTOCOLS & AI',
    items: [
      ['Solidity', '#8C8C8C'],
      ['OpenAI', '#10A37F'],
      ['Vercel AI SDK', null],
      ['Zod', '#3E67B1'],
      ['Inngest', '#6366F1'],
      ['Vite', '#A259FF'],
      ['Vercel', null],
    ],
  },
];

/** Bodies are kept short enough to wrap to two lines at the stage column width. */
export const LOOP = [
  { n: '01', title: 'Understand', body: 'Find the financial question under the request.' },
  { n: '02', title: 'Model', body: 'Map incentives, data and failure modes first.' },
  { n: '03', title: 'Build', body: 'Ship a clear interface over auditable logic.' },
  { n: '04', title: 'Explain', body: 'If it cannot be explained, it is not done.' },
];

/** Rendered as self-hosted button images, each wrapped in a real <a> tag. */
export const LINKS = [
  { id: 'repos', label: 'Repositories', icon: 'grid', accent: 'accent', href: IDENTITY.links.repos },
  { id: 'linkedin', label: 'LinkedIn', icon: 'arrow', accent: 'accent2', href: IDENTITY.links.linkedin },
  { id: 'stars', label: 'Reading list', icon: 'star', accent: 'accent4', href: IDENTITY.links.stars },
];

export const FOOTER = {
  eyebrow: 'GET IN TOUCH',
  headline: "Let's compare notes.",
  sub: 'Public finance  ·  Bitcoin history  ·  Web engineering  ·  Smart contracts',
};
