import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { unstable_cache } from "next/cache";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/toast";
import Script from "next/script";
import { AdSenseScript } from "@/components/AdSenseScript";
import { UserProvider } from "@/context/UserContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { CookieConsent } from "@/components/CookieConsent";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

const getAdsenseClientId = unstable_cache(
  async (): Promise<string> => {
    try {
      await connectDB();
      const settings = await Settings.findOne().lean() as { adsenseClientId?: string } | null;
      return settings?.adsenseClientId ?? "";
    } catch {
      return "";
    }
  },
  ["adsense-client-id"],
  { revalidate: 3600 }
);

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Predictions Hub";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | NFL Predictions, Schedule & Fan Hub 2026`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "AI-powered NFL game predictions, full 2026 schedule, matchup breakdowns, team stats, expert blog, and fan hub — everything you need for every NFL week.",
  keywords: [
    "NFL predictions 2026",
    "NFL AI picks",
    "NFL game predictions",
    "NFL schedule 2026",
    "NFL matchup analysis",
    "NFL win probability",
    "NFL games today",
    "NFL kickoff times",
    "NFL week by week schedule",
    "NFL team stats",
    "NFL game preview",
    "NFL fan hub",
    "NFL blog",
    "football predictions 2026",
    "NFL Predictions Hub",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | NFL Predictions, Schedule & Fan Hub 2026`,
    description:
      "AI-powered NFL predictions, full 2026 schedule, matchup analysis, and expert fan coverage — all in one place.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | NFL Predictions & Schedule 2026`,
    description:
      "AI-powered NFL game predictions, win probabilities, key stats, and full 2026 schedule coverage.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = await getAdsenseClientId();
  return (
    <html lang="en" className={roboto.variable}>
      <head />
      <body className="font-sans min-h-screen flex flex-col">
        <Script
          id="gtm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MVKM38K9');`,
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MVKM38K9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AdSenseScript clientId={adsenseClientId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <CookieConsentProvider>
          <ToastProvider>
            <UserProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
            </UserProvider>
          </ToastProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
