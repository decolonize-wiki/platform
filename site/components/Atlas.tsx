"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGION_CELLS, REGION_NAMES } from "../lib/atlas-regions";

export type AtlasEntry = {
  slug: string;
  title: string;
  flagCount: number;
  categories: string[];
  lang: string;
  region: string;
};

const COLS = 64;
const ROWS = 24;

// Stylized continents as row → [colStart, colEnd] spans (row 0 = north).
// Deliberately not accurate geography — the atlas maps articles, not borders.
const LAND: Array<[row: number, colStart: number, colEnd: number]> = [
  [1, 8, 20], [1, 40, 56],
  [2, 6, 21], [2, 30, 34], [2, 38, 58],
  [3, 6, 22], [3, 29, 36], [3, 38, 58],
  [4, 7, 21], [4, 28, 37], [4, 40, 58],
  [5, 8, 20], [5, 30, 38], [5, 42, 56],
  [6, 9, 18], [6, 30, 40], [6, 44, 54],
  [7, 11, 16], [7, 31, 41], [7, 46, 52],
  [8, 13, 16], [8, 30, 41], [8, 48, 52],
  [9, 13, 19], [9, 30, 40], [9, 50, 53],
  [10, 16, 22], [10, 31, 40], [10, 50, 55],
  [11, 16, 23], [11, 32, 40],
  [12, 16, 23], [12, 33, 40],
  [13, 16, 22], [13, 34, 39], [13, 52, 58],
  [14, 17, 22], [14, 34, 39], [14, 51, 59],
  [15, 17, 21], [15, 35, 38], [15, 52, 58],
  [16, 18, 20], [16, 35, 37], [16, 53, 57],
  [17, 18, 20], [17, 36, 37],
  [18, 18, 19],
  [19, 18, 19],
  [22, 4, 60],
];

type Rgba = [number, number, number, number];
const CHARCOAL: Rgba = [46, 46, 46, 0.9];
const GREY: Rgba = [110, 110, 110, 1];
const HOT: Rgba = [255, 59, 31, 1];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mix(a: Rgba, b: Rgba, t: number): Rgba {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
}

// heat 0..1 → charcoal (0) → grey (0.5) → hot (1)
function color(heat: number): string {
  const h = Math.max(0, Math.min(1, heat));
  const c = h < 0.5 ? mix(CHARCOAL, GREY, h / 0.5) : mix(GREY, HOT, (h - 0.5) / 0.5);
  return `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${c[3].toFixed(2)})`;
}

const key = (r: number, c: number) => `${r},${c}`;

export function Atlas({ entries }: { entries: AtlasEntry[] }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [southUp, setSouthUp] = useState(true);
  const [active, setActive] = useState<AtlasEntry | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const maxFlags = useMemo(
    () => Math.max(1, ...entries.map((e) => e.flagCount)),
    [entries],
  );

  // Per-cell heat + which entry owns each lit cell (for hit-testing).
  const { heat, owner } = useMemo(() => {
    const heat = new Map<string, number>();
    const owner = new Map<string, AtlasEntry>();
    for (const [r, c0, c1] of LAND) {
      for (let c = c0; c <= c1; c++) heat.set(key(r, c), 0.35);
    }
    for (const e of entries) {
      const intensity =
        e.flagCount === 0 ? 0.5 : 0.6 + 0.4 * (e.flagCount / maxFlags);
      for (const [r, c0, c1] of REGION_CELLS[e.region] ?? []) {
        for (let c = c0; c <= c1; c++) {
          const k = key(r, c);
          if ((heat.get(k) ?? 0) <= intensity) heat.set(k, intensity);
          owner.set(k, e);
        }
      }
    }
    return { heat, owner };
  }, [entries, maxFlags]);

  const displayRow = useCallback((r: number) => (southUp ? ROWS - 1 - r : r), [southUp]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round((rect.width * ROWS) / COLS * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = rect.width / COLS;
    const cssH = (rect.width * ROWS) / COLS;
    ctx.clearRect(0, 0, rect.width, cssH);
    const rad = cw * 0.32;
    const activeCells = active
      ? new Set((REGION_CELLS[active.region] ?? []).flatMap(([r, a, b]) => {
          const out: string[] = [];
          for (let c = a; c <= b; c++) out.push(key(r, c));
          return out;
        }))
      : null;
    for (const [k, h] of heat) {
      const [r, c] = k.split(",").map(Number);
      const dr = displayRow(r);
      const x = c * cw + cw / 2;
      const y = dr * cw + cw / 2;
      const highlighted = activeCells?.has(k);
      ctx.beginPath();
      ctx.arc(x, y, highlighted ? rad * 1.35 : rad, 0, Math.PI * 2);
      ctx.fillStyle = highlighted ? color(Math.max(h, 0.85)) : color(h);
      ctx.fill();
    }
  }, [heat, displayRow, active]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  const entryAt = useCallback(
    (clientX: number, clientY: number): AtlasEntry | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width / COLS;
      const c = Math.floor((clientX - rect.left) / cw);
      const dr = Math.floor((clientY - rect.top) / cw);
      const r = southUp ? ROWS - 1 - dr : dr;
      return owner.get(key(r, c)) ?? null;
    },
    [owner, southUp],
  );

  const onMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    const e = entryAt(ev.clientX, ev.clientY);
    setActive(e);
    if (e) {
      const host = boxRef.current?.getBoundingClientRect();
      setPointer({ x: ev.clientX - (host?.left ?? 0), y: ev.clientY - (host?.top ?? 0) });
    } else {
      setPointer(null);
    }
  };

  const onClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    const e = entryAt(ev.clientX, ev.clientY);
    if (e) router.push(`/${e.lang}/${e.slug}`);
  };

  return (
    <div className="atlas">
      <div className="atlas-head">
        <button
          type="button"
          className="atlas-toggle mono"
          aria-pressed={southUp}
          onClick={() => setSouthUp((v) => !v)}
        >
          {southUp ? "South-up ↑ · switch" : "North-up ↓ · switch"}
        </button>
        <span className="atlas-note mono">stylized preview — not accurate geography</span>
      </div>

      <div
        ref={boxRef}
        className="atlas-map"
        onMouseMove={onMove}
        onMouseLeave={() => {
          setActive(null);
          setPointer(null);
        }}
        onClick={onClick}
        style={{ cursor: active ? "pointer" : "default" }}
      >
        <canvas ref={canvasRef} className="atlas-canvas" aria-hidden="true" />
        {active && pointer && (
          <div
            className="atlas-info"
            style={{ left: pointer.x, top: pointer.y }}
            role="presentation"
          >
            <span className="disp atlas-info-title">{active.title}</span>
            <span
              className={`mono atlas-info-meta${active.flagCount === 0 ? " clean" : ""}`}
            >
              {active.flagCount === 0
                ? "Clean — 0 flags"
                : `${active.flagCount} ${active.flagCount === 1 ? "flag" : "flags"} · ${active.categories.join(", ")}`}
            </span>
            <span className="mono atlas-info-region">{REGION_NAMES[active.region] ?? ""}</span>
            <span className="mono atlas-info-link">read the analysis →</span>
          </div>
        )}
      </div>

      <div className="atlas-legend mono">
        <span>fewer flags</span>
        <span className="atlas-bar" aria-hidden="true" />
        <span>more flags</span>
      </div>

      <nav className="visually-hidden" aria-label="Analyzed articles on the map">
        <ul>
          {entries.map((e) => (
            <li key={`${e.lang}/${e.slug}`}>
              <Link href={`/${e.lang}/${e.slug}`}>
                {e.title} —{" "}
                {e.flagCount === 0
                  ? "clean, 0 flags"
                  : `${e.flagCount} flags: ${e.categories.join(", ")}`}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
