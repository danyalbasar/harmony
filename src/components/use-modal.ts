"use client";

import { useEffect, useRef } from "react";

const panels: HTMLElement[] = [];
let previousOverflow = "";

/** Keep keyboard focus and scrolling inside an open panel, then restore focus. */
export function useModal<T extends HTMLElement = HTMLDivElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(close);

  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    if (!open || !ref.current) return;
    const panel = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (panels.length === 0) previousOverflow = document.body.style.overflow;
    panels.push(panel);
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    (focusable()[0] ?? panel).focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (panels.at(-1) !== panel) return;
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      const wasTop = panels.at(-1) === panel;
      const index = panels.indexOf(panel);
      if (index >= 0) panels.splice(index, 1);
      if (panels.length === 0) document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      if (wasTop && trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
