import Link from "next/link";
import { Trophy, Newspaper, Mail, Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import Post from "@/models/Post";
import ContactMessage from "@/models/ContactMessage";

async function getStats() {
  try {
    await connectDB();
    const [games, posts, publishedPosts, messages, unreadMessages] = await Promise.all([
      Game.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
    ]);
    return { games, posts, publishedPosts, messages, unreadMessages };
  } catch {
    return { games: 0, posts: 0, publishedPosts: 0, messages: 0, unreadMessages: 0 };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/games/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Game
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Total Games" value={stats.games} href="/admin/games" />
        <StatCard
          icon={<Newspaper className="h-5 w-5" />}
          label="Blog Posts"
          value={`${stats.publishedPosts} / ${stats.posts}`}
          sublabel="published / total"
          href="/admin/blog"
        />
        <StatCard
          icon={<Mail className="h-5 w-5" />}
          label="Contact Messages"
          value={stats.messages}
          sublabel={`${stats.unreadMessages} unread`}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
