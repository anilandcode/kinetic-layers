"use client";

import { useEffect, useRef } from "react";

/** Keep the URL-driven Library filters behaving like one accessible menu. */
export default function ExclusiveDropdownController() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = marker.current?.closest<HTMLElement>(".kl-rail");
    if (!rail) return;
    const drops = Array.from(rail.querySelectorAll<HTMLDetailsElement>("details.kl-drop"));
    const closeAll = (except?: HTMLDetailsElement) => {
      for (const drop of drops) if (drop !== except) drop.open = false;
    };
    const cleanups = drops.map((drop) => {
      const onToggle = () => drop.open && closeAll(drop);
      drop.addEventListener("toggle", onToggle);
      return () => drop.removeEventListener("toggle", onToggle);
    });
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !rail.contains(event.target)) closeAll();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const open = drops.find((drop) => drop.open);
      if (!open) return;
      open.open = false;
      open.querySelector<HTMLElement>("summary")?.focus();
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".kl-drop-item")) closeAll();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    rail.addEventListener("click", onClick);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      rail.removeEventListener("click", onClick);
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" />;
}
