interface LinkCandidate {
  slug: string;
  title: string;
}

export function autoLinkContent(
  content: string,
  allPosts: LinkCandidate[],
  currentSlug: string
): string {
  // Filter out current post and very short titles, longest titles first to avoid partial overlaps
  const candidates = allPosts
    .filter((p) => p.slug !== currentSlug && p.title.trim().length > 5)
    .sort((a, b) => b.title.length - a.title.length);

  let result = content;
  for (const post of candidates) {
    const linked = linkFirstOccurrence(result, post.title, post.slug);
    if (linked) result = linked;
  }
  return result;
}

function linkFirstOccurrence(html: string, title: string, slug: string): string | null {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Split on HTML tags, process only text nodes outside <a> elements
  const parts = html.split(/(<[^>]+>)/);
  let insideAnchor = 0;
  let replaced = false;

  const output = parts.map((part) => {
    if (part.startsWith("<")) {
      if (/^<a[\s>]/i.test(part)) insideAnchor++;
      if (/^<\/a>/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1);
      return part;
    }
    if (insideAnchor > 0 || replaced) return part;
    const regex = new RegExp(`(${escaped})`, "i");
    if (!regex.test(part)) return part;
    replaced = true;
    return part.replace(regex, `<a href="/blog/${slug}">$1</a>`);
  });

  return replaced ? output.join("") : null;
}
