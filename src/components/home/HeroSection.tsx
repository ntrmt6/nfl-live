"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, PlayCircle, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="container relative py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Radio className="h-3.5 w-3.5 animate-pulse-slow" />
            Live Coverage &middot; Every Sunday, Monday &amp; Thursday
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
            The NFL Season,
            <br />
            <span className="text-gradient">Beautifully Organized.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Track every kickoff, matchup, and storyline in one premium
            dashboard. Built for fans who want the full picture — schedules,
            scores, and in-depth game coverage — without the clutter.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="#schedule"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-black shadow-glow transition-all hover:shadow-glow-blue hover:brightness-105 active:scale-[0.98]"
            >
              <PlayCircle className="h-5 w-5" />
              View Live Schedule
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 px-6 py-3.5 font-semibold text-foreground transition-all hover:bg-secondary"
            >
              <TrendingUp className="h-5 w-5" />
              Read Latest Analysis
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <span className="block text-2xl font-bold text-foreground">32</span>
              Teams Tracked
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">18</span>
              Weeks of Action
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">24/7</span>
              Fan Coverage
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
