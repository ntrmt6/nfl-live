import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions governing your use of NFL Live Zone.",
  alternates: { canonical: absoluteUrl("/terms") },
  robots: { index: true, follow: true },
};

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Live Zone";

export default function TermsPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Terms and Conditions</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose-nfl">
        <p>
          Welcome to {SITE_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms and
          Conditions (&quot;Terms&quot;) govern your access to and use of our website,
          including any content, functionality, and services offered on or
          through the site (the &quot;Service&quot;). By accessing or using the
          Service, you agree to be bound by these Terms. If you do not agree,
          please do not use the Service.
        </p>

        <h2>1. Independent Fan Media</h2>
        <p>
          {SITE_NAME} is an independent, fan-operated media and news
          publication. We are not affiliated with, endorsed by, sponsored by,
          or in any way officially connected with the National Football
          League (NFL), its member clubs, or any of their subsidiaries or
          affiliates. All NFL team names, logos, and associated marks
          referenced on this site are trademarks of their respective owners
          and are used for identification and editorial purposes only.
        </p>

        <h2>2. Use of the Service</h2>
        <p>
          You agree to use the Service only for lawful purposes and in
          accordance with these Terms. You agree not to: (a) use the Service
          in any way that violates applicable law or regulation; (b) attempt
          to gain unauthorized access to any portion of the Service; (c)
          interfere with or disrupt the integrity or performance of the
          Service; or (d) scrape, harvest, or collect information from the
          Service using automated means without our prior written consent.
        </p>

        <h2>3. Third-Party Links and Streaming Partners</h2>
        <p>
          The Service may contain links to third-party websites, advertising
          networks, and streaming or broadcast partners that are not owned or
          controlled by {SITE_NAME}. Interacting with certain elements of the
          Service, including game-day &quot;watch&quot; interfaces, may direct you to
          a third-party partner site. We do not control, and assume no
          responsibility for, the content, privacy policies, or practices of
          any third-party sites or services. Some of these links may be
          affiliate links, meaning we may earn a commission if you make a
          purchase or take a qualifying action after clicking through. See
          our <a href="/disclaimer">Disclaimer</a> for more information.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          Unless otherwise noted, the text, graphics, logos, and original
          content on the Service (excluding third-party trademarks) are the
          property of {SITE_NAME} and are protected by applicable
          intellectual property laws. You may not reproduce, distribute, or
          create derivative works from our original content without prior
          written permission.
        </p>

        <h2>5. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis
          without warranties of any kind, whether express or implied,
          including but not limited to accuracy, completeness, timeliness, or
          fitness for a particular purpose. Game schedules, times, and scores
          are provided for informational purposes and may be subject to
          change without notice.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} and its owners,
          contributors, and affiliates shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising out
          of or related to your use of, or inability to use, the Service.
        </p>

        <h2>7. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Any changes will be
          posted on this page with an updated revision date. Continued use of
          the Service after changes are posted constitutes acceptance of the
          revised Terms.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please visit our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
