import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./critical.css";
import "./globals.css";
import "./mobile-optimizations.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { CategoriesProvider } from "@/lib/CategoriesProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildSeoMetadata, getSiteOrigin, absoluteLocaleUrl } from "@/lib/i18n/seo";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/shared/StructuredData";
import MainContent from "@/components/shared/MainContent";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-montserrat",
  adjustFontFallback: true,
  // Optimize: only load weights that are actually used
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    ...buildSeoMetadata({
      locale,
      path: "/",
      title: dict.meta.title,
      description: dict.meta.description,
      keywords: dict.meta.keywords,
      ogType: "website",
      imageAlt: dict.hero.imageAlt,
    }),
    icons: {
      icon: "/images/choice-features/open-browser.png",
      shortcut: "/images/choice-features/open-browser.png",
      apple: "/images/choice-features/open-browser.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getSiteOrigin();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const homeUk = absoluteLocaleUrl("/", "uk");
  const homeRu = absoluteLocaleUrl("/", "ru");

  return (
    <html lang={locale === "ru" ? "ru" : "uk"} className={montserrat.className}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="beforeInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-N98NJ7ST');
        `}</Script>
        {/* End Google Tag Manager */}
        <OrganizationStructuredData url={baseUrl} baseUrl={baseUrl} />
        <WebSiteStructuredData
          baseUrl={locale === "ru" ? homeRu : homeUk}
          description={dict.meta.description}
          locale={locale === "ru" ? "ru-RU" : "uk-UA"}
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="text/plain" href="/ai.txt" title="AI context (ai.txt)" />
        {/* hreflang uk/ru/x-default — через Metadata.alternates на кожній сторінці */}
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="shortcut icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/browser-open.png" as="image" />
        {/* Hero image preload */}
        <link rel="preload" href="/images/hf_20260222_063745_3c9c7bbc-82d2-4f3f-8c11-4216792e4995.jpeg" as="image" />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        
        {/* Mobile-specific prefetch */}
        <link rel="prefetch" href="/catalog" />
        <link rel="prefetch" href="/api/products?limit=12" />
        
        {/* DNS prefetch and preconnect */}
        <link rel="dns-prefetch" href="//placehold.co" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        
        {/* Resource hints for better performance */}
        <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
        <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        
        {/* Mobile-specific optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N98NJ7ST"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel - loaded asynchronously after page interactive */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1148656287371559');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1148656287371559&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        
        <a href="#main-content" className="skip-link">
          Перейти до основного контенту
        </a>
        <ErrorBoundary>
          <AppProvider>
            <BasketProvider>
              <CategoriesProvider>
                <LocaleProvider initialLocale={locale}>
                  <Header />
                  <Suspense fallback={<main id="main-content" className="bg-[var(--background-warm-yellow)] mt-[var(--site-header-offset)] min-h-screen" />}>
                    <MainContent id="main-content">{children}</MainContent>
                  </Suspense>
                  <Footer />
                </LocaleProvider>
              </CategoriesProvider>
            </BasketProvider>
          </AppProvider>
        </ErrorBoundary>
        
        {/* Service Worker registration - loaded after interactive */}
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(${registerServiceWorker.toString()})();`
          }}
        />
        
        <WebVitals />
      </body>
    </html>
  );
}
