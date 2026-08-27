"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { HostEventModal } from "@/components/home/host-event-modal";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/config/site-config";

export function Hero({ upcomingCount }: { upcomingCount: number }) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-70" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-primary">
            <Sparkles className="size-3.5" />
            Powered by {siteConfig.product.name}
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-cream sm:text-7xl">
            {siteConfig.cafe.name}
            <span className="block text-3xl italic text-primary sm:text-4xl">
              {siteConfig.cafe.tagline}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.cafe.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#events" className="rounded-full px-5" size="lg">
              See upcoming nights
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
            <HostEventModal>
              <Button variant="outline" size="lg" className="rounded-full px-5">
                Host your event here
              </Button>
            </HostEventModal>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card gold-glow rounded-3xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Live board
          </p>
          <p className="mt-3 font-heading text-5xl font-bold">{upcomingCount}</p>
          <p className="text-sm text-muted-foreground">
            published events on the floor this season
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            {["CSE", "Acoustic", "Workshop"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-2 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
