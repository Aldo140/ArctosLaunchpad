"use client";

import { useEffect, useState } from "react";

/**
 * Calgary right now: temperature, the sky, sunset, and a chinook flag when
 * today runs much warmer than yesterday on a westerly wind. Open-Meteo needs
 * no key; a failed fetch just hides the strip.
 */

type Sky = { temp: number; code: number; high: number; low: number; sunrise: string; sunset: string; chinook: boolean; at: number };

const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=51.05&longitude=-114.07&current=temperature_2m,weather_code" +
  "&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_direction_10m_dominant&timezone=America%2FEdmonton&past_days=1&forecast_days=1";
const KEY = "hq-sky";
const FRESH = 30 * 60_000;

function words(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 2) return "Mostly clear";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

/** "2026-10-08T19:02" (already Calgary time) to "7:02 pm". */
function clockOf(iso: string): string {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

async function load(): Promise<Sky> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Sky | null;
    if (cached && Date.now() - cached.at < FRESH) return cached;
  } catch {}
  const r = await fetch(URL);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = (await r.json()) as {
    current: { temperature_2m: number; weather_code: number };
    daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; sunrise: string[]; sunset: string[]; wind_direction_10m_dominant: number[] };
  };
  const d = j.daily;
  const t = d.temperature_2m_max.length - 1;
  const wind = d.wind_direction_10m_dominant[t];
  const sky: Sky = {
    temp: j.current.temperature_2m,
    code: j.current.weather_code,
    high: d.temperature_2m_max[t],
    low: d.temperature_2m_min[t],
    sunrise: d.sunrise[t],
    sunset: d.sunset[t],
    chinook: t > 0 && d.temperature_2m_max[t] - d.temperature_2m_max[t - 1] >= 8 && wind >= 200 && wind <= 300,
    at: Date.now(),
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(sky));
  } catch {}
  return sky;
}

export function SkyStrip({ preview }: { preview?: boolean }) {
  const [sky, setSky] = useState<Sky | null>(null);

  useEffect(() => {
    let live = true;
    if (preview) {
      queueMicrotask(() => live && setSky({ temp: 14, code: 1, high: 17, low: 3, sunrise: "2026-10-08T07:47", sunset: "2026-10-08T18:59", chinook: true, at: 0 }));
      return () => {
        live = false;
      };
    }
    load().then((s) => live && setSky(s), () => {});
    return () => {
      live = false;
    };
  }, [preview]);

  if (!sky) return null;
  return (
    <p className="hq-sky" aria-label="Calgary weather">
      <b>{Math.round(sky.temp)}°</b>
      <span>{words(sky.code)}</span>
      <span className="hq-mono">H {Math.round(sky.high)}° · L {Math.round(sky.low)}°</span>
      <span className="hq-mono">Sunset {clockOf(sky.sunset)}</span>
      {sky.chinook ? <span className="hq-chip hq-chip--warm">Chinook</span> : null}
    </p>
  );
}
