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
    name: `${away.name} at ${home.name}`,
    startDate: new Date(game.kickoff).toISOString(),
    eventStatus: mapEventStatus(game.status),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: game.venue || `${home.name} Stadium`,
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: home.name,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: away.name,
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    description:
      game.description ||
      `Follow the live schedule, kickoff time, and viewing info for ${away.name} vs ${home.name} in week ${game.week}.`,
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
    image: post.coverImage ? [post.coverImage] : undefined,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
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
