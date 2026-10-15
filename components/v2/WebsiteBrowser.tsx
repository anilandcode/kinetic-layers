"use client";

import { useEffect, useMemo, useState } from "react";
import type { Website } from "@/lib/kl/types";
import { WEBSITE_CATEGORIES } from "@/lib/kl/website-categories";
import WebsiteCard from "./WebsiteCard";
import l from "./Library.module.css";

type Price = "free" | "premium" | undefined;

/**
 * /websites: category pills with counts and a price toggle over the grid.
 *
 * Filtering runs here rather than on the server — the list is small and a
 * change is instant — and the URL is kept in step with replaceState, so a
 * filtered view is still a link. Counts are measured against the price filter,
 * so a pill never promises sites the toggle then hides.
 */
export default function WebsiteBrowser({
  sites,
  initial = {},
}: {
  sites: Website[];
  initial?: { category?: string; price?: Price };
}) {
  const [category, setCategory] = useState<string | undefined>(initial.category);
  const [price, setPrice] = useState<Price>(initial.price);

  const priced = useMemo(
    () => sites.filter((w) => !price || (price === "free" ? w.free : !w.free)),
    [sites, price]
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const w of priced) c[w.category] = (c[w.category] ?? 0) + 1;
    return c;
  }, [priced]);
  /* The fixed order from the schema, showing only categories that have sites. */
  const pills = useMemo(() => {
    const present = new Set(sites.map((w) => w.category));
    return [...WEBSITE_CATEGORIES.filter((c) => present.has(c)), ...[...present].filter((c) => !(WEBSITE_CATEGORIES as readonly string[]).includes(c))];
  }, [sites]);
  const shown = category ? priced.filter((w) => w.category === category) : priced;

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (price) params.set("price", price);
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
  }, [category, price]);

  return (
    <div className={l.library}>
      <div className={l.toolbar}>
        <div className={l.types} role="group" aria-label="Category">
          <button type="button" aria-pressed={!category} onClick={() => setCategory(undefined)} className={l.type}>
            All
            <span className={l.count}>{priced.length}</span>
          </button>
          {pills.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? undefined : c)}
              className={l.type}
            >
              {c}
              <span className={l.count}>{counts[c] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className={l.controls}>
          <div className={l.segmented} role="group" aria-label="Price">
            {([undefined, "free", "premium"] as const).map((p) => (
              <button key={p ?? "any"} type="button" aria-pressed={price === p} onClick={() => setPrice(p)}>
                {p === "free" ? "Free" : p === "premium" ? "Premium" : "Any"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className={l.summary} role="status">
        {shown.length === sites.length
          ? `${sites.length} ${sites.length === 1 ? "website" : "websites"}`
          : `${shown.length} of ${sites.length} websites`}
      </p>

      {shown.length ? (
        <div className={l.grid}>
          {shown.map((w, i) => (
            <WebsiteCard key={w.slug} site={w} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className={l.empty}>
          <p>No websites match these filters.</p>
          <button
            type="button"
            onClick={() => {
              setCategory(undefined);
              setPrice(undefined);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
