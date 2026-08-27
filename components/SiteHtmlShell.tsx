import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteLocaleUrl, getSiteOrigin } from "@/lib/i18n/seo";
import { montserrat } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { CategoriesProvider } from "@/lib/CategoriesProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import {
  OrganizationStructuredData,
  WebSiteStructuredData,
} from "@/components/shared/StructuredData";
import MainContent from "@/components/shared/MainContent";

type SiteHtmlShellProps = {
  locale: Locale;
  children: ReactNode;
};

export default function SiteHtmlShell({ locale, children }: SiteHtmlShellProps) {
  const baseUrl = getSiteOrigin();
  const dict = getDictionary(locale);
  const homeUk = absoluteLocaleUrl("/", "uk");
  const homeRu = absoluteLocaleUrl("/", "ru");
  const htmlLang = locale === "ru" ? "ru" : "uk";

  return (
    <html lang={htmlLang} className={montserrat.className}>
      <head>
        <Script id="gtm" strategy="beforeInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-N98NJ7ST');
        `}</Script>
        <OrganizationStructuredData url={baseUrl} baseUrl={baseUrl} />
        <WebSiteStructuredData
          baseUrl={locale === "ru" ? homeRu : homeUk}
          description={dict.meta.description}
          locale={locale === "ru" ? "ru-RU" : "uk-UA"}
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="text/plain" href="/ai.txt" title="AI context (ai.txt)" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="shortcut icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="preload" href="/images/browser-open.png" as="image" />
        <link
          rel="preload"
          href="/images/hf_20260222_063745_3c9c7bbc-82d2-4f3f-8c11-4216792e4995.jpeg"
          as="image"
        />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href={locale === "ru" ? "/ru/catalog" : "/catalog"} />
        <link rel="prefetch" href="/api/products?limit=12" />
        <link rel="dns-prefetch" href="//placehold.co" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N98NJ7ST"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1148656287371559&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <a href="#main-content" className="skip-link">
          {dict.a11y.skipToContent}
        </a>
        <ErrorBoundary>
          <AppProvider>
            <BasketProvider>
              <CategoriesProvider>
                <LocaleProvider initialLocale={locale}>
                  <Header />
                  <Suspense
                    fallback={
                      <main
                        id="main-content"
                        className="bg-[var(--background-warm-yellow)] min-h-screen"
                      />
                    }
                  >
                    <MainContent id="main-content">{children}</MainContent>
                  </Suspense>
                  <Footer />
                </LocaleProvider>
              </CategoriesProvider>
            </BasketProvider>
          </AppProvider>
        </ErrorBoundary>

        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(${registerServiceWorker.toString()})();`,
          }}
        />

        <WebVitals />
      </body>
    </html>
  );
}
