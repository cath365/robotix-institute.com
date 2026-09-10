/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const ContentSecurityPolicy = [
  // App-wide CSP. Pyodide & Monaco need 'unsafe-eval'; framer-motion needs 'unsafe-inline'
  // for some keyframes. We tighten where possible.
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://unavatar.io https://cdn.jsdelivr.net https://www.robotixinstitute.io https://i.ytimg.com https://resources.finalsite.net https://static.wixstatic.com https://lics.sch.zm https://bongohive.co.zm",
  "connect-src 'self' ws: wss: https: data:",
  "worker-src 'self' blob:",
  "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // In dev, omit upgrade-insecure-requests — it can rewrite http://localhost chunk URLs to
  // https:// while `next dev` only serves HTTP, causing ChunkLoadError (timeouts).
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'unavatar.io' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'bongohive.co.zm' },
      { protocol: 'https', hostname: 'www.robotixinstitute.io' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'resources.finalsite.net' },
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: 'lics.sch.zm' },
      { protocol: 'https', hostname: '**.r2.dev' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@react-three/drei',
      '@react-three/fiber',
    ],
  },

  // Don't ship the heavy mqtt browser bundle on routes that don't import it.
  // Next.js already tree-shakes; this is mostly defensive.
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      // Node 24 + Windows has been corrupting webpack's persistent dev cache in this repo,
      // which then surfaces as missing vendor chunks and fallback manifests.
      config.cache = false;
    }

    if (!isServer) {
      // Allow optional/native deps in mqtt to be skipped on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()',
        },
        ...(isProd
          ? [{
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            }]
          : []),
        { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      ],
    },
    {
      // Long cache for static images
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/patterns/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
};

module.exports = nextConfig;
