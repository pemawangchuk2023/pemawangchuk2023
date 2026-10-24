/**
 * Single source of truth for everything the generated artwork says.
 *
 * Rule for this file: nothing goes in that is not verifiable from the GitHub
 * profile, the repositories, their manifests or the live sites. The stack list
 * was read out of real package.json files, not assembled from memory.
 */

export const IDENTITY = {
  name: 'Pema Wangchuk',
  handle: 'pemawangchuk2023',
  place: 'THIMPHU, BHUTAN',
  coords: '27.47° N   89.64° E   ·   2,334 M',
  role: 'Deputy Chief Finance Officer, Cluster Finance Services',
  lede: [
    'Public-sector finance by day, production software by night.',
    'I build systems that stay honest when nobody is watching.',
  ],
  status: 'OPEN TO COLLABORATE',
  links: {
    linkedin: 'https://linkedin.com/in/pema-wangchuk-5561aa224',
    repos: 'https://github.com/pemawangchuk2023?tab=repositories',
    stars: 'https://github.com/pemawangchuk2023?tab=stars',
  },
};

/** Bhutan's fiscal year runs 1 July to 30 June; the hero ridge spans one. */
export const FY = ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];

/** Each row becomes its own image so the README can wrap it in a link. */
export const WORK = [
  {
    id: 'fdh',
    year: '2026',
    name: 'Finance’s Document Hub',
    href: 'https://www.search-here.space/',
    body: 'Public finance rules, from pay scales to GST, filed into 17 categories with protected PDF access.',
    tags: ['NEXT.JS', '17 CATEGORIES', 'PROTECTED PDFS'],
  },
  {
    id: 'recorder',
    year: '2026',
    name: 'Recorder',
    href: 'https://recorder-murex-rho.vercel.app',
    body: 'A private, Loom-style screen recorder that runs entirely in the browser. Nothing is uploaded.',
    tags: ['WEBCODECS', 'NO BACKEND', 'NEXT.JS'],
  },
];

export const PRACTICE = [
  { when: 'BY DAY', title: 'Public finance', body: 'Budgets, controls and accountability at ministry scale, as Deputy Chief Finance Officer.' },
  { when: 'BY NIGHT', title: 'Software', body: 'Full-stack TypeScript: Next.js apps with real auth, real databases and real users.' },
  { when: 'IN BETWEEN', title: 'Open protocols', body: "Bitcoin's history, its cypherpunk roots, and contracts that remove the middleman." },
];

export const STACK = [
  ['INTERFACE', ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'shadcn/ui', 'Radix UI', 'GSAP', 'Three.js']],
  ['DATA & AUTH', ['Node.js', 'PostgreSQL', 'Drizzle', 'MongoDB', 'Better Auth', 'Clerk', 'NextAuth', 'AWS S3']],
  ['PROTOCOLS & AI', ['Solidity', 'OpenAI', 'Vercel AI SDK', 'Zod', 'Inngest', 'Vercel']],
];

/** A real sequence, so the step numbers carry meaning. */
export const LOOP = [
  ['01', 'Understand', 'Find the financial question under the request.'],
  ['02', 'Model', 'Map incentives, data and failure modes first.'],
  ['03', 'Build', 'Ship a clear interface over auditable logic.'],
  ['04', 'Explain', 'If it cannot be explained, it is not done.'],
];

/** Rendered as self-hosted button images, each wrapped in a real <a> tag. */
export const LINKS = [
  { id: 'repos', label: 'REPOSITORIES', primary: true, href: IDENTITY.links.repos },
  { id: 'linkedin', label: 'LINKEDIN', href: IDENTITY.links.linkedin },
  { id: 'stars', label: 'READING LIST', href: IDENTITY.links.stars },
];

export const FOOTER = {
  eyebrow: 'CARRIED FORWARD',
  local: 'THIMPHU  ·  UTC+6',
  headline: 'Let’s compare notes.',
  sub: 'Public finance  ·  Bitcoin history  ·  Web engineering  ·  Smart contracts',
};
