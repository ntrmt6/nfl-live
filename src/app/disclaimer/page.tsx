import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Affiliate, editorial, and trademark disclaimers for NFL Live Zone.",
  alternates: { canonical: absoluteUrl("/disclaimer") },
  robots: { index: true, follow: true },
};

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Live Zone";

export default function DisclaimerPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Disclaimer</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose-nfl">
        <h2>Trademark Disclaimer</h2>
        <p>
          {SITE_NAME} is an independent fan media publication. We are not
          affiliated with, endorsed by, sponsored by, or officially connected
          with the National Football League (NFL), NFL Properties LLC, any
          of its 32 member clubs, or any related entity. All team names,
          logos, uniforms, and other indicia are registered trademarks of
          their respective owners and are referenced here solely for
          editorial and identification purposes under fair use.
        </p>

        <h2>Affiliate Disclosure</h2>
        <p>
          {SITE_NAME} participates in affiliate marketing programs. This
          means that certain links on our site — including elements of our
          game-day &quot;watch&quot; pages — may direct you to third-party
          streaming or broadcast partners, and we may earn a referral
          commission if you click through and take a qualifying action. This
          comes at no additional cost to you. Our editorial content and
          schedule information are not influenced by these partnerships,
          though our decision to feature a given partner may be. We label
          these interactions as &quot;Sponsored Stream Partner&quot; wherever they
          appear so you always know when you are leaving our site.
        </p>

        <h2>No Official Streaming Rights</h2>
        <p>
          {SITE_NAME} does not host, broadcast, or provide any live NFL game
          video streams directly. We do not claim any broadcast rights to
          NFL games. Any &quot;watch&quot; or &quot;live player&quot; element on this site
          is a promotional interface that connects you with a third-party
          partner; it is not a licensed broadcast of the game itself.
        </p>

        <h2>Editorial Accuracy</h2>
        <p>
          We make reasonable efforts to keep schedule information, kickoff
          times, and scores accurate and up to date, but we do not guarantee
          the accuracy, completeness, or timeliness of any information on
          this site. Always confirm official game information with the NFL
          or your local broadcast provider.
        </p>

        <h2>Professional Advice Disclaimer</h2>
        <p>
          Content on this site, including blog articles and analysis, is
          provided for general informational and entertainment purposes only
          and does not constitute professional, betting, or financial advice
          of any kind.
        </p>

        <h2>Questions</h2>
        <p>
          If you have questions about this Disclaimer, please contact us via
          our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
