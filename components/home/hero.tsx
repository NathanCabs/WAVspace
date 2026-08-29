"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { CategoryPills } from "@/components/events/category-pills";
import { HostEventModal } from "@/components/home/host-event-modal";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/config/site-config";
import type { CategoryChip } from "@/lib/constants";

export function Hero({
  upcomingCount,
  categories,
}: {
  upcomingCount: number;
  categories: CategoryChip[];
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-20">
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-primary">
            <Sparkles className="size-3.5" />
            Powered by {siteConfig.product.name}
          </p>
          <h1 className="font-display text-4xl leading-[0.95] text-foreground sm:text-7xl">
            {siteConfig.cafe.name}
            <span className="block text-2xl italic text-primary sm:text-4xl">
              {siteConfig.cafe.tagline}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            {siteConfig.cafe.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
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
          className="glass-card gold-glow rounded-3xl p-5 sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Live board
          </p>
          <p className="mt-3 font-heading text-5xl font-bold">{upcomingCount}</p>
          <p className="text-sm text-muted-foreground">
            {upcomingCount === 1
              ? "published night on the floor"
              : "published nights on the floor"}
          </p>
          {categories.length ? (
            <div className="mt-5">
              <CategoryPills categories={categories} />
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
