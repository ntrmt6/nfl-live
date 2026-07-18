import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/toast";
import { AdSenseScript } from "@/components/AdSenseScript";
import { UserProvider } from "@/context/UserContext";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

async function getAdsenseClientId(): Promise<string> {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean() as { adsenseClientId?: string } | null;
    return settings?.adsenseClientId ?? "";
  } catch {
    return "";
  }
}

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
      <head>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <AdSenseScript clientId={adsenseClientId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <ToastProvider>
          <UserProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
