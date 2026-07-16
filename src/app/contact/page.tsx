import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the NFL Predictions Hub editorial and support team.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Contact <span className="text-gradient">Us</span>
        </h1>
        <p className="text-muted-foreground">
          Questions, feedback, or partnership inquiries? Send us a message and
          our team will get back to you shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="space-y-4">
          <InfoCard icon={<Mail className="h-5 w-5" />} title="Email" value="contact@nfllivezone.com" />
          <InfoCard icon={<Clock className="h-5 w-5" />} title="Response Time" value="1-2 business days" />
          <InfoCard icon={<MapPin className="h-5 w-5" />} title="Location" value="Remote-first editorial team" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
