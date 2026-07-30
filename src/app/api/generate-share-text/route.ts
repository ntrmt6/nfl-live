import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  x:         "Write a punchy X/Twitter post under 240 characters. Use 1-2 emojis, 2-3 hashtags like #NFL #NFLPicks #SportsPrediction. No line breaks. Make it exciting and shareable.",
  facebook:  "Write an engaging Facebook post, 2-4 sentences. Be conversational and enthusiastic. Use emojis naturally. End with a question or call-to-action to drive comments.",
  tumblr:    "Write a creative Tumblr caption with personality, 2-4 sentences. Use emojis and add 4-5 relevant hashtags at the end on a new line. Make it fun and blog-friendly.",
  reddit:    "Write a Reddit submission: first line is the post title (analytical, no hype, no emojis, under 100 characters), then a blank line, then a 2-3 sentence body that reads like a genuine fan analysis with stats.",
  youtube:   "Write a YouTube community post, 2-3 sentences. Enthusiastic, includes emojis, ends with 'Link in bio!' and relevant hashtags.",
  whatsapp:  "Write a WhatsApp message to share with friends, 2-3 sentences. Casual, friendly tone, use emojis. Include the key prediction stat. No hashtags.",
  telegram:  "Write a Telegram message, 2-3 sentences. Mix casual and informative. Use emojis and bold key phrases by wrapping them in *asterisks*.",
  linkedin:  "Write a professional LinkedIn post, 3-4 sentences. Highlight the AI/data angle. Use professional tone, minimal emojis (1-2 max), end with relevant hashtags like #SportsTech #AIAnalytics #NFL.",
  bluesky:   "Write a Bluesky post under 300 characters. Similar to Twitter but slightly more thoughtful. Use 1-2 emojis and 1-2 hashtags.",
  threads:   "Write a Threads post, 2-3 sentences. Conversational Instagram-like vibe. Use emojis, no hashtags needed. Make it feel personal.",
  pinterest: "Write a Pinterest pin description, 2-3 sentences. Descriptive and keyword-rich for discovery. Mention the sport, teams, and prediction. End with 3-4 hashtags.",
  instagram: "Write an Instagram caption, 2-4 sentences. Engaging, emoji-rich, end with 8-10 relevant hashtags on a new line (e.g. #NFL #NFLPicks #SportsBetting #AIPrediction #Football).",
  tiktok:    "Write a TikTok caption under 150 characters. Super punchy and hype. Use 3-4 trending hashtags like #NFL #SportsTok #AIprediction #fyp.",
  discord:   "Write a Discord message to post in a sports server. Casual, uses Discord-style formatting like **bold** and maybe an emoji or two. Sounds like a real community member sharing a hot take.",
  snapchat:  "Write a Snapchat caption under 80 characters. Short, punchy, fun with 1-2 emojis. No hashtags.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, gameData, blogData } = body as {
      platform: string;
      gameData?: {
        awayFull: string;
        homeFull: string;
        winner: string;
        confidence: number;
        week?: string | number;
        league?: string;
        awayProb?: number;
        homeProb?: number;
        awayPPG?: string;
        homePPG?: string;
        gameUrl: string;
      };
      blogData?: {
        title: string;
        excerpt: string;
        tags: string[];
        url: string;
      };
    };

    const instructions = PLATFORM_INSTRUCTIONS[platform];
    if (!instructions) {
      return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
    }

    let contentDesc: string;
    let promptContext: string;

    if (blogData) {
      contentDesc = `Blog article titled "${blogData.title}". Summary: ${blogData.excerpt}. Tags: ${blogData.tags.join(", ")}. URL: ${blogData.url}`;
      promptContext = `You are a sports social media expert. Generate a unique social post to share this NFL blog article.

Article info: ${contentDesc}

Platform instructions: ${instructions}

Generate ONLY the post text itself. No quotes, no labels, no explanations. Make it feel fresh and engaging. Be specific to the article topic.`;
    } else if (gameData) {
      const isNFL = !!gameData.week;
      contentDesc = isNFL
        ? `NFL Week ${gameData.week}: ${gameData.awayFull} vs ${gameData.homeFull}. AI model predicts ${gameData.winner} wins with ${gameData.confidence}% confidence. Win probabilities: ${gameData.awayFull} ${gameData.awayProb}%, ${gameData.homeFull} ${gameData.homeProb}%.${gameData.awayPPG ? ` Offense: ${gameData.awayFull} ${gameData.awayPPG} PPG, ${gameData.homeFull} ${gameData.homePPG} PPG.` : ""}`
        : `${gameData.league?.toUpperCase()} match: ${gameData.awayFull} vs ${gameData.homeFull}. AI model predicts ${gameData.winner === "DRAW" ? "a DRAW" : `${gameData.winner} wins`} with ${gameData.confidence}% confidence. Probabilities: ${gameData.awayFull} ${gameData.awayProb}%, ${gameData.homeFull} ${gameData.homeProb}%.`;
      promptContext = `You are a sports social media expert. Generate a unique social post for this game prediction.

Game info: ${contentDesc}

Platform instructions: ${instructions}

Generate ONLY the post text itself. No quotes, no labels, no explanations. Make it feel fresh and unique — avoid generic phrases like "exciting matchup". Be specific to the teams and stats.`;
    } else {
      return NextResponse.json({ error: "Missing gameData or blogData" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = promptContext;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ text });
  } catch (err) {
    console.error("generate-share-text error:", err);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
