import { IGame } from "@/models/Game";
import { IPost } from "@/models/Post";
import { absoluteUrl } from "@/lib/utils";
import { getTeam } from "@/lib/teams";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Live Zone";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function sportsEventSchema(game: IGame) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${away.name} vs ${home.name}`,
    alternateName: `${away.abbr} at ${home.abbr} Week ${game.week}`,
    startDate: new Date(game.kickoff).toISOString(),
    eventStatus: mapEventStatus(game.status),
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    location: {
      "@type": "Place",
      name: game.venue || `${home.name} Stadium`,
      address: { "@type": "PostalAddress", addressCountry: "US" },
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: home.name,
      sport: "American Football",
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: away.name,
      sport: "American Football",
    },
    sport: "American Football",
    organizer: {
      "@type": "Organization",
      name: "National Football League",
      url: "https://www.nfl.com",
    },
    description:
      game.description ||
      `Watch ${away.name} at ${home.name} live. Kickoff time, TV network (${game.network || "TBD"}), venue, and live stream coverage for NFL Week ${game.week}.`,
    url: absoluteUrl(`/games/${game.slug}`),
  };
}

function mapEventStatus(status: IGame["status"]) {
  switch (status) {
    case "final":
      return "https://schema.org/EventCompleted" as const;
    case "live":
      return "https://schema.org/EventScheduled" as const;
    default:
      return "https://schema.org/EventScheduled" as const;
  }
}

export function blogPostingSchema(post: IPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage
      ? [{ "@type": "ImageObject", url: post.coverImage, width: 1200, height: 675 }]
      : undefined,
    keywords: post.tags?.join(", "),
    articleSection: "NFL Game Previews",
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
        width: 200,
        height: 60,
      },
    },
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Blog`,
      url: `${SITE_URL}/blog`,
    },
    about: {
      "@type": "SportsEvent",
      sport: "American Football",
      organizer: {
        "@type": "Organization",
        name: "National Football League",
        url: "https://www.nfl.com",
      },
    },
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return {
    __html: JSON.stringify(data),
  };
}
