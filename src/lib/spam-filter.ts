const PROFANITY = [
  "fuck", "shit", "ass", "bitch", "cunt", "dick", "pussy", "cock",
  "nigger", "nigga", "faggot", "retard", "whore", "slut",
];

const URL_REGEX = /https?:\/\/|www\.|\.com|\.net|\.org|\.io/i;

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkSpam(
  content: string,
  opts: { isRookie: boolean; lastCommentAt?: Date | null }
): SpamCheckResult {
  const lower = content.toLowerCase();

  for (const word of PROFANITY) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return { isSpam: true, reason: "Content contains prohibited language." };
    }
  }

  if (opts.isRookie && URL_REGEX.test(content)) {
    return { isSpam: true, reason: "New users cannot post links. Build reputation first." };
  }

  if (opts.lastCommentAt) {
    const secondsSince = (Date.now() - new Date(opts.lastCommentAt).getTime()) / 1000;
    if (secondsSince < 15) {
      return { isSpam: true, reason: "You're commenting too fast. Please wait a moment." };
    }
  }

  if (content.trim().length < 3) {
    return { isSpam: true, reason: "Comment is too short." };
  }

  return { isSpam: false };
}
