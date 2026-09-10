import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotixinstitute.co.zm';

const STATIC_ROUTES = [
  '',
  'courses',
  'paths',
  'projects',
  'playground',
  'simulation',
  'iot',
  'arena',
  'competitions',
  'community',
  'blog',
  'ai-tutor',
  'about',
  'contact',
  'privacy',
  'terms',
  'faq',
  'docs',
  'events',
  'mentorship',
  'partners',
  'careers',
  'portfolio',
  'game-gallery',
  'login',
  'register',
  'forgot-password',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  return STATIC_ROUTES.map((p) => ({
    url: `${SITE_URL}/${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));
}
