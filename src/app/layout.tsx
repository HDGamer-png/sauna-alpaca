import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Inter } from 'next/font/google';
import { AppShell } from '@/fe/components/layout/AppShell';
import { SITE_CONFIG } from '@/shared/lib/constants';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-heading',
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline} | Mua & Thuê tại Huế`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'máy xông hơi hồng ngoại xa',
    'sauna hồng ngoại Huế',
    'xông hơi tại nhà',
    'thiết bị chăm sóc sức khỏe',
    'suy thận mạn',
    'sauna alpaca',
    'xông hơi hồng ngoại xa',
    'thuê máy xông hơi Huế',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  robots: { index: true, follow: true },
  openGraph: {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 900,
        alt: 'Máy xông hơi hồng ngoại xa Sauna Alpaca trong không gian gia đình',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/images/logo-emblem.png',
    apple: '/images/logo-emblem.png',
  },
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE_CONFIG.language}
      className={`${beVietnamPro.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);`,
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

