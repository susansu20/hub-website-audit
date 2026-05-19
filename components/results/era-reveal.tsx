"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Menu,
  Moon,
  Save,
  Smartphone,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

type EraDef = {
  from: number;
  to: number;
  label: string;
  icon: LucideIcon;
  hint: string;
};

const ERAS: EraDef[] = [
  {
    from: 1995,
    to: 2002,
    label: "Geocities era",
    icon: Save,
    hint: "Floppy-disk thinking",
  },
  {
    from: 2003,
    to: 2008,
    label: "Web 2.0 era",
    icon: Sparkles,
    hint: "Glossy buttons everywhere",
  },
  {
    from: 2009,
    to: 2014,
    label: "Skeuomorphism era",
    icon: Smartphone,
    hint: "Drop shadows on everything",
  },
  {
    from: 2015,
    to: 2019,
    label: "Flat design era",
    icon: Menu,
    hint: "Hamburger menus and hero stock photos",
  },
  {
    from: 2020,
    to: 2023,
    label: "Pandemic polish",
    icon: Moon,
    hint: "Soft shadows and dark mode toggles",
  },
  {
    from: 2024,
    to: 2030,
    label: "Current",
    icon: Zap,
    hint: "Edge-rendered and converting",
  },
];

const FALLBACK_ICON = Layers;
const SPIN_INTERVAL_MS = 70;
const SPIN_DURATION_MS = 1800;

type Phase = "spinning" | "settling" | "settled";

function findEra(year: number): EraDef {
  return ERAS.find((e) => year >= e.from && year <= e.to) ?? {
    from: 0,
    to: 0,
    label: "Unknown era",
    icon: FALLBACK_ICON,
    hint: "Your site fits a category we haven't named yet.",
  };
}

function randomYear(): number {
  // Walk through the spread of eras for visual variety
  return 1996 + Math.floor(Math.random() * 30);
}

export function EraReveal({ year }: { year: number }) {
  const [display, setDisplay] = useState<number>(() => randomYear());
  const [phase, setPhase] = useState<Phase>("spinning");

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= SPIN_DURATION_MS) {
        window.clearInterval(id);
        setDisplay(year);
        setPhase("settling");
        window.setTimeout(() => setPhase("settled"), 450);
        return;
      }
      setDisplay(randomYear());
    }, SPIN_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [year]);

  const era = findEra(year);
  const Icon = era.icon;

  return (
    <div className="flex flex-col items-center" aria-live="polite">
      <div
        className={`font-serif text-era text-white tabular-nums select-none transition-transform duration-300 ${
          phase === "settling"
            ? "scale-110"
            : phase === "settled"
            ? "scale-100"
            : "scale-95"
        }`}
        aria-label={phase === "settled" ? `Year ${year}` : "Calculating your era"}
      >
        {display}
      </div>

      <div
        className={`mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 text-sm font-medium text-white transition-all duration-500 ${
          phase === "settled"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        <Icon className="h-4 w-4 text-hub-yellow" />
        <span>{era.label}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/70 italic">{era.hint}</span>
      </div>
    </div>
  );
}
