"use client";

import { useEffect, useRef, useState } from "react";
import { useSleep } from "@/context/sleep-context";
import { MoonIcon, RainIcon } from "@/components/icons";
import { SLEEP_PRESETS } from "@/lib/sleep-sounds";

export function SleepButton() {
  const { playing, preset, volume, supported, toggle, select, setVolume } = useSleep();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!supported) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 sm:right-6" ref={panelRef}>
      {open ? (
        <div className="pointer-events-auto mb-2 w-64 origin-bottom-right rounded-xl border border-line bg-elevated p-3 shadow-2xl">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Sleep sounds
          </p>

          <ul className="flex flex-col gap-0.5">
            {SLEEP_PRESETS.map((option) => {
              const active = option.id === preset.id;

              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => select(option.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                      active ? "bg-card text-text" : "text-muted hover:bg-card-hover hover:text-text"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{option.label}</span>
                      <span className="block truncate text-xs text-dim">{option.description}</span>
                    </span>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="mt-3 flex items-center gap-3 px-1">
            <span className="text-xs font-semibold text-muted">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Sleep sound volume"
              className="h-1 flex-1"
              style={
                {
                  "--range-track": `linear-gradient(to right, #a99fc4 ${volume * 100}%, #3a3159 ${
                    volume * 100
                  }%)`,
                } as React.CSSProperties
              }
            />
          </label>
        </div>
      ) : null}

      <div className="pointer-events-auto flex items-center justify-end gap-2">
        {playing ? (
          <span className="hidden rounded-full border border-accent/40 bg-elevated px-3 py-2 text-xs font-medium text-accent-soft sm:block">
            {preset.label}
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Stop ${preset.label}` : `Play ${preset.label}`}
          className={`flex h-10 items-center gap-2 rounded-full border px-3 shadow-lg transition ${
            playing
              ? "border-accent/50 bg-accent text-black"
              : "border-line bg-elevated text-muted hover:border-accent/40 hover:text-text"
          }`}
        >
          {playing ? <RainIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          <span className="text-sm font-semibold">{playing ? "Stop" : "Sleep"}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Choose a sleep sound"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-elevated text-muted shadow-lg transition hover:border-accent/40 hover:text-text"
        >
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
