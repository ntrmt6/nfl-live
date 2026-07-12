import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NFL Live Zone collects, uses, and protects your information.",
  alternates: { canonical: absoluteUrl("/privacy") },
  robots: { index: true, follow: true },
};

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Live Zone";

export default function PrivacyPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose-nfl">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, and discloses information about you when
          you use our website (the &quot;Service&quot;).
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Information you provide directly:</strong> such as your
            name, email address, subject, and message when you submit our
            Contact form.
          </li>
          <li>
            <strong>Automatically collected information:</strong> including
            IP address, browser type, device information, pages visited, and
            referring URLs, collected through cookies and similar
            technologies.
          </li>
          <li>
            <strong>Advertising and analytics data:</strong> collected by
            third-party providers such as Google AdSense and analytics
            services, which may use cookies to serve relevant ads and
            measure site performance.
          </li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>To operate, maintain, and improve the Service;</li>
          <li>To respond to inquiries submitted through our Contact form;</li>
          <li>To analyze usage trends and improve site performance;</li>
          <li>To serve relevant advertising through third-party ad networks;</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>

        <h2>3. Cookies and Advertising</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your
          experience. Third-party vendors, including Google, use cookies to
          serve ads based on your prior visits to this and other websites.
          Google&apos;s use of advertising cookies enables it and its
          partners to serve ads based on your visits to this site and/or
          other sites on the Internet. You may opt out of personalized
          advertising by visiting{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          .
        </p>

        <h2>4. Third-Party Links</h2>
        <p>
          Our Service may contain links to third-party websites, including
          streaming and affiliate partners. We are not responsible for the
          privacy practices or content of these third-party sites. We
          encourage you to review the privacy policy of any site you visit.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain information submitted via our Contact form only as long
          as necessary to respond to your inquiry and for legitimate
          business or legal purposes.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to access,
          correct, delete, or restrict the use of your personal information.
          To exercise these rights, please contact us via our{" "}
          <a href="/contact">Contact page</a>.
        </p>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          The Service is not directed to children under 13, and we do not
          knowingly collect personal information from children under 13.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will
          be posted on this page with a revised &quot;last updated&quot; date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out
          through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
