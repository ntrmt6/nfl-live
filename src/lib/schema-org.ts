import { IGame } from "@/models/Game";
import { IPost } from "@/models/Post";
import { IPrediction } from "@/models/Prediction";
import { absoluteUrl } from "@/lib/utils";
import { getTeam } from "@/lib/teams";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "NFL Predictions Hub";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-192.png"),
      width: 192,
      height: 192,
    },
    description:
      "NFL fan hub featuring AI-powered game predictions, full schedule, matchup analysis, team stats, and expert blog coverage.",
    sameAs: [
      "https://twitter.com/nflpredictshub",
      "https://www.reddit.com/user/nflpredictshub",
      "https://www.facebook.com/nflpredictshub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/contact`,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "AI-powered NFL predictions, full 2026 schedule, matchup breakdowns, and expert fan coverage.",
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
    name: `${away.name} vs ${home.name} – Week ${game.week} Prediction & Analysis`,
    alternateName: `${away.abbr} at ${home.abbr} Week ${game.week}`,
    startDate: new Date(game.kickoff).toISOString(),
    eventStatus: mapEventStatus(game.status),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
      `AI-powered prediction and matchup analysis for ${away.name} at ${home.name}. ` +
      `Win probabilities, key stats, and model breakdown for NFL Week ${game.week} ` +
      `(${game.network || "TBD"}, ${game.venue || home.name + " Stadium"}).`,
    url: absoluteUrl(`/games/${game.slug}`),
  };
}

export function matchupPredictionSchema(game: IGame, pred: IPrediction) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const winner = pred.predictedWinner === game.homeTeam ? home.name : away.name;
  return {
    "@context": "https://schema.org",
    "@type": "AnalysisNewsArticle",
    headline: `${away.name} vs ${home.name} Week ${game.week} – AI Prediction & Matchup Breakdown`,
    description:
      `Our XGBoost model gives ${winner} a ${pred.confidence?.toFixed(0)}% confidence pick ` +
      `(${away.name} ${(pred.awayWinProbability ?? 0).toFixed(0)}% / ${home.name} ${(pred.homeWinProbability ?? 0).toFixed(0)}% win probability). ` +
      `Full stat comparison, radar chart, and key factor breakdown.`,
    url: absoluteUrl(`/games/${game.slug}`),
    dateModified: pred.generatedAt ? new Date(pred.generatedAt).toISOString() : undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-192.png") },
    },
    about: [
      { "@type": "SportsTeam", name: away.name, sport: "American Football" },
      { "@type": "SportsTeam", name: home.name, sport: "American Football" },
    ],
    keywords: [
      `${away.name} vs ${home.name} prediction`,
      `NFL Week ${game.week} picks`,
      `${away.name} ${home.name} odds`,
      "NFL AI prediction",
      "NFL matchup analysis",
    ].join(", "),
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
    articleSection: "NFL Analysis",
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
        width: 60,
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
      "@type": "SportsOrganization",
      name: "National Football League",
      url: "https://www.nfl.com",
      sport: "American Football",
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

export function itemListSchema(items: {
  name: string;
  url: string;
  description?: string;
}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function collectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
}: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(url),
    ...(numberOfItems ? { numberOfItems } : {}),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function sportsTeamSchema(team: { name: string; abbr: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "American Football",
    memberOf: {
      "@type": "SportsOrganization",
      name: "National Football League",
      url: "https://www.nfl.com",
    },
    url: absoluteUrl(`/teams/${team.slug}`),
    alternateName: team.abbr,
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
