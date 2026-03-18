import Script from 'next/script'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

export default function Analytics() {
  if (!GA4_ID) return null

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>

      {/* Google AdSense */}
      {ADSENSE_ID && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}
