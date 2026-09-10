import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ScrollProgress, ScrollToTop } from '@/components/ui/ScrollEffects';
import { StyledToaster } from '@/components/ui/StyledToaster';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { getSiteUrlForMetadata } from '@/lib/site-url';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  preload: true,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  preload: true,
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  preload: false,
});

const metadataBaseUrl = getSiteUrlForMetadata();
const SITE_URL = metadataBaseUrl.href.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: 'Robotix Institute Zambia | Robotics, Coding & STEM Learning',
    template: '%s | Robotix Institute',
  },
  description:
    'Robotix Institute Zambia is a Lusaka-based robotics, coding, and STEM education organization serving children, schools, camps, and community programs.',
  keywords: [
    'Robotix Institute Zambia', 'robotics Zambia', 'coding for kids Zambia', 'STEM education Zambia',
    'STEM operating system', 'innovation hub', 'smart agriculture', 'IoT education',
    'startup incubation', 'student innovation portfolio', 'AI builder platform', 'robotics lab',
  ],
  authors: [{ name: 'Robotix Institute Zambia' }],
  applicationName: 'Robotix Institute',
  category: 'technology',
  icons: {
    icon: '/favicon.png',
    apple: '/images/icon-color.png',
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZM',
    siteName: 'Robotix Institute',
    title: 'Robotix Institute Zambia | Robotics, Coding & STEM Learning',
    description: 'A premium digital headquarters for African innovators across AI, robotics, STEM, gaming, startups, IoT, and smart agriculture.',
    images: [{ url: '/images/logo-color.png', width: 1200, height: 630, alt: 'Robotix Institute' }],
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robotix Institute Zambia',
    description: 'Robotics, coding, and STEM learning for schools, children, camps, and community programs in Zambia.',
    images: ['/images/logo-color.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#1E4E8C',
  width: 'device-width',
  initialScale: 1,
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Robotix Institute',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-color.png`,
  description: 'Lusaka-based robotics, coding, and STEM learning organization for schools, children, camps, and community programs.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZM',
    addressLocality: 'Lusaka',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${manrope.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-brand-dark font-body antialiased text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-accent focus:text-brand-dark focus:rounded-lg focus:font-semibold"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <CustomCursor />
        <div id="main-content">{children}</div>
        <ScrollToTop />
        <StyledToaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
