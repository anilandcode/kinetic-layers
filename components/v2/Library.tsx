"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Asset } from "@/lib/kl/types";
import { applyFilters, asSort, countFacets, sortAssets, SORT_LABEL, SORTS, type Filters, type Sort } from "@/lib/kl/facets";
import { typeLabel } from "@/lib/v2/kit";
import KitCard from "./KitCard";
import Icon from "./Icon";
import { EASE, Flip, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "./motion";
import s from "./Library.module.css";

export type LibraryInitial = { type?: string; price?: "free" | "premium"; sort?: string; q?: string; saved?: boolean };

/**
 * The library: type pills, price, sort and search over the kit grid.
 *
 * Shared by Home and /library — Home is the library with a short hero on top,
 * which is how the competitors do it and what the owner asked for. Filtering
 * happens here rather than on the server: the catalogue is small, a change is
 * instant, and GSAP Flip can glide the cards to their new places. /library
 * keeps the URL in step with replaceState, so a filtered view is still a link.
 *
 * Counts come from lib/kl/facets.ts, measured against the other active
 * filters, and never include preview samples.
 */
export default function Library({
  kits,
  initial = {},
  syncUrl = false,
  headingId,
  limit,
  saved: savedList,
}: {
  kits: Asset[];
  initial?: LibraryInitial;
  syncUrl?: boolean;
  headingId?: string;
  /** Home shows this many first, so the sections after the grid stay close. */
  limit?: number;
  /** The viewer's saved kits, by slug. Given only when someone is signed in. */
  saved?: string[];
}) {
  const saved = useMemo<ReadonlySet<string>>(() => new Set(savedList ?? []), [savedList]);
  const [filters, setFilters] = useState<Filters>({
    type: initial.type,
    price: initial.price,
    saved: (initial.saved && saved.size > 0) || undefined,
  });
  const [sort, setSort] = useState<Sort>(asSort(initial.sort));
  const [q, setQ] = useState(initial.q ?? "");
  const [expanded, setExpanded] = useState(!limit);
  const grid = useRef<HTMLDivElement | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const real = useMemo(() => kits.filter((k) => !k.sample), [kits]);
  const facets = useMemo(() => countFacets(real, filters, saved), [real, filters, saved]);
  const typeCounts = useMemo(() => countFacets(kits, filters, saved).type, [kits, filters, saved]);
  const types = useMemo(() => Object.keys(typeCounts).sort(), [typeCounts]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matched = applyFilters(kits, filters, saved).filter(
      (k) =>
        !needle ||
        k.name.toLowerCase().includes(needle) ||
        k.type.toLowerCase().includes(needle) ||
        k.tags?.some((t) => t.toLowerCase().includes(needle))
    );
    /* Samples always sort after real kits, whatever the order. */
    return [...sortAssets(matched.filter((k) => !k.sample), sort), ...matched.filter((k) => k.sample)];
  }, [kits, filters, saved, sort, q]);

  const visible = expanded || !limit ? shown : shown.slice(0, limit);

  /**
   * Capture positions, then change state; the layout effect animates the move.
   *
   * Typing fast (or clicking filters in quick succession) can call this again
   * before the previous Flip.from() finished — `absolute: true` leaves an
   * in-flight card with an inline absolute position while it animates, and
   * capturing a new state mid-tween read that transient position rather than
   * a settled one, compounding into cards stuck far from their real slot.
   * Killing any running Flip tweens on these targets first snaps them to
   * their end state, so every capture starts from a clean layout.
   */
  function change(update: () => void) {
    if (grid.current && window.matchMedia(MOTION_OK).matches) {
      const targets = grid.current.querySelectorAll("[data-flip-id]");
      Flip.killFlipsOf(targets);
      flipState.current = Flip.getState(targets);
    }
    update();
  }

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !grid.current) return;
    Flip.from(state, {
      targets: grid.current.querySelectorAll("[data-flip-id]"),
      duration: 0.55,
      ease: EASE,
      absolute: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: EASE }),
    });
  }, [visible]);

  useLayoutEffect(() => {
    if (!syncUrl) return;
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.price) params.set("price", filters.price);
    if (filters.saved) params.set("saved", "1");
    if (sort !== "featured") params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
  }, [filters, sort, q, syncUrl]);

  /* Cards below the fold fade in as they arrive — opacity only: a rise with
     a stagger left each row out of line while it played (and for longer on
     a slow machine). Cards already on screen at load are left alone, so
     nothing visible ever blinks out and back. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const below = gsap.utils
          .toArray<HTMLElement>("[data-flip-id]")
          .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
        ScrollTrigger.batch(below, {
          start: "top 94%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, { opacity: 0, duration: 0.6, ease: EASE, stagger: 0.04, clearProps: "opacity" }),
        });
      });
      return () => mm.revert();
    },
    { scope: grid }
  );

  const setType = (type?: string) => change(() => setFilters((f) => ({ ...f, type })));
  const setPrice = (price?: "free" | "premium") => change(() => setFilters((f) => ({ ...f, price })));
  const toggleSaved = () => change(() => setFilters((f) => ({ ...f, saved: f.saved ? undefined : true })));

  return (
    <div className={s.library}>
      <div className={s.toolbar}>
        <div className={s.types} role="group" aria-labelledby={headingId} aria-label={headingId ? undefined : "Kit type"}>
          <button type="button" aria-pressed={!filters.type} onClick={() => setType(undefined)} className={s.type}>
            All
            <span className={s.count}>{kits.length}</span>
          </button>
          {types.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={filters.type === type}
              onClick={() => setType(filters.type === type ? undefined : type)}
              className={s.type}
            >
              {typeLabel(type)}
              <span className={s.count}>{typeCounts[type]}</span>
            </button>
          ))}
          {saved.size ? (
            <button type="button" aria-pressed={Boolean(filters.saved)} onClick={toggleSaved} className={s.type}>
              Saved
              <span className={s.count}>{saved.size}</span>
            </button>
          ) : null}
        </div>

        <div className={s.controls}>
          <label className={s.searchField}>
            <Icon name="search" size={16} />
            <span className="v-sr">Filter kits</span>
            <input
              type="search"
              value={q}
              placeholder="Filter kits"
              onChange={(e) => change(() => setQ(e.target.value))}
              autoComplete="off"
            />
          </label>
          <div className={s.segmented} role="group" aria-label="Price">
            {([undefined, "free", "premium"] as const).map((price) => (
              <button
                key={price ?? "all"}
                type="button"
                aria-pressed={filters.price === price}
                onClick={() => setPrice(price)}
              >
                {price === "free" ? "Free" : price === "premium" ? "Premium" : "Any"}
              </button>
            ))}
          </div>
          <label className={s.sort}>
            <span className="v-sr">Sort</span>
            <select value={sort} onChange={(e) => change(() => setSort(asSort(e.target.value)))}>
              {SORTS.map((key) => (
                <option key={key} value={key}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
        </div>
      </div>

      <p className={s.summary} role="status">
        {facets.matching === real.length && !q
          ? `${real.length} ${real.length === 1 ? "kit" : "kits"} published`
          : `${shown.filter((k) => !k.sample).length} of ${real.length} kits`}
        {shown.some((k) => k.sample) ? <span> · samples shown on previews only</span> : null}
      </p>

      {shown.length ? (
        <>
          <div ref={grid} className={s.grid}>
            {visible.map((kit, i) => (
              <KitCard key={kit.slug} kit={kit} priority={i < 4} />
            ))}
          </div>
          {visible.length < shown.length ? (
            <div className={s.more}>
              <button type="button" onClick={() => change(() => setExpanded(true))}>
                Show all {shown.length} kits
                <Icon name="arrowDown" size={16} />
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div ref={grid} className={s.empty}>
          <p>No kits match these filters.</p>
          <button
            type="button"
            onClick={() =>
              change(() => {
                setFilters({});
                setQ("");
              })
            }
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
