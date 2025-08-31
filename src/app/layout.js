// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { AppProvider } from '../context/AppProvider';
import { ClientThemeProvider } from '../components/ClientThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NewsShare - Earn While You Read',
  description: 'Get personalized, location-based news and earn money through our innovative ad revenue sharing program.',
  keywords: 'news, revenue sharing, location-based news, earn money reading, personalized news',
  authors: [{ name: 'NewsShare Team' }],
  openGraph: {
    title: 'NewsShare - Earn While You Read',
    description: 'Get personalized, location-based news and earn money through our innovative ad revenue sharing program.',
    url: 'https://newsshare.com',
    siteName: 'NewsShare',
    images: [
      {
        url: 'https://newsshare.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsShare - Earn While You Read',
    description: 'Get personalized, location-based news and earn money through our innovative ad revenue sharing program.',
    images: ['https://newsshare.com/twitter-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxx"
          crossOrigin="anonymous"
        />
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <AppProvider>
          <ClientThemeProvider fontFamily={inter.style.fontFamily}>
            {children}
          </ClientThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}