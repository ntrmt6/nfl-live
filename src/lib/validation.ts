import { z } from "zod";

export const gameSchema = z.object({
  season: z.coerce.number().int().min(2000).max(2100),
  week: z.coerce.number().int().min(1).max(22),
  homeTeam: z.string().min(2).max(4),
  awayTeam: z.string().min(2).max(4),
  homeTeamFull: z.string().min(2),
  awayTeamFull: z.string().min(2),
  venue: z.string().optional(),
  kickoff: z.coerce.date(),
  network: z.string().optional(),
  status: z.enum(["scheduled", "live", "final"]).default("scheduled"),
  homeScore: z.coerce.number().optional(),
  awayScore: z.coerce.number().optional(),
  affiliateUrl: z.string().url(),
  viewerCountBase: z.coerce.number().int().min(0).default(12000),
  featured: z.coerce.boolean().default(false),
  description: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(10),
  coverImage: z.string().url().optional().or(z.literal("")),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.coerce.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Please enter a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
