import type { Business, HqData, HqIntelligence, HqRecommendation, HqRelationship } from "./types";

const DAY = 86_400_000;
const label: Record<Business | "all", string> = { calgarywatch: "CalgaryWatch", calgarydaily: "Calgary Daily", vowmotion: "Vow Motion", arctos: "Arctos", all: "HQ" };
const age = (at: number, now: number) => Math.max(0, now - at);

function ranked(data: Omit<HqData, "intelligence">, now: number): HqRecommendation[] {
  const out: HqRecommendation[] = [];
  for (const item of (data.snapshot?.today ?? []).filter((x) => ["reply", "pitch-review", "post-failed"].includes(x.kind)).slice(0, 8)) {
    const reply = item.kind === "reply";
    out.push({ id: `today-${item.id}`, title: item.title, reason: item.detail, business: item.business,
      score: (reply ? 90 : item.kind === "post-failed" ? 80 : 62) + Math.min(12, Math.floor(age(item.since, now) / DAY)),
      effort: reply ? "10 min" : "2 min", confidence: "high", source: "CalgaryWatch operations", href: item.link });
  }
  for (const r of (data.gmail?.replies ?? []).filter((x) => x.kind === "reply" && !x.answered).slice(0, 6)) {
    out.push({ id: `gmail-${r.url}-${r.at}`, title: `Reply to ${r.name || r.from}`, reason: r.snippet || r.subject,
      business: r.business === "other" || r.business === "calgarydaily" ? "all" : r.business,
      score: r.toPitch ? 96 : 82, effort: "10 min", confidence: "high", source: "mrotiz Gmail", href: r.url });
  }
  for (const e of (data.life ?? []).filter((x) => x.kind === "owed" && !x.done)) {
    const dollars = Math.round((e.amount ?? 0) / 100).toLocaleString("en-CA", { style: "currency", currency: "CAD" });
    out.push({ id: `owed-${e.id}`, title: `Collect ${dollars}`, reason: e.text || "Money owed to you",
      business: (e.business as Business) || "all", score: e.due && e.due < now ? 94 : 70,
      effort: "10 min", confidence: "high", source: "Money owed", href: "#money" });
  }
  if (!data.gmail) out.push({ id: "connect-gmail", title: "Connect mrotiz Gmail",
    reason: "Unlock Vow Motion and Arctos replies, relationship history and opportunity detection.",
    business: "all", score: 100, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  for (const m of data.memories.filter((x) => x.kind === "priority").slice(0, 3)) out.push({
    id: `priority-${m.id}`, title: m.text, reason: `Saved priority · ${label[m.business]}`,
    business: m.business, score: 75, effort: "30+ min", confidence: "high", source: "Your memory", href: "#improve/memory" });
  return out.sort((a, b) => b.score - a.score).slice(0, 12);
}

function relationships(data: Omit<HqData, "intelligence">): HqRelationship[] {
  const map = new Map<string, HqRelationship>();
  for (const s of data.gmail?.sends ?? []) {
    const key = s.to.toLowerCase(), prev = map.get(key);
    map.set(key, { key, name: s.domain || s.to, email: s.to, business: s.business, lastAt: Math.max(prev?.lastAt ?? 0, s.at),
      touches: (prev?.touches ?? 0) + 1, state: s.replied ? "Replied" : "Waiting", next: s.replied ? null : "Follow up", url: s.url });
  }
  for (const r of data.gmail?.replies ?? []) {
    const key = r.from.toLowerCase(), prev = map.get(key);
    map.set(key, { key, name: r.name || prev?.name || r.from, email: r.from, business: r.business, lastAt: Math.max(prev?.lastAt ?? 0, r.at),
      touches: (prev?.touches ?? 0) + 1, state: r.answered ? "Answered" : r.kind === "reply" ? "Needs reply" : r.kind,
      next: !r.answered && r.kind === "reply" ? "Reply" : null, url: r.url });
  }
  return [...map.values()].sort((a, b) => b.lastAt - a.lastAt).slice(0, 50);
}

export function buildIntelligence(data: Omit<HqData, "intelligence">, now: number): HqIntelligence {
  const recommendations = ranked(data, now);
  const replies = (data.gmail?.replies ?? []).filter((r) => r.kind === "reply" && !r.answered);
  const active = data.experiments.filter((e) => e.status === "running");
  const recent = data.productEvents.filter((e) => e.at >= now - 7 * DAY);
  const areas = new Map<string, number>();
  for (const e of recent) areas.set(e.area, (areas.get(e.area) ?? 0) + 1);
  const connections: HqIntelligence["connections"] = [
    { id: "gmail", label: "mrotiz Gmail", state: !data.gmail ? "missing" : age(data.gmail.generatedAt, now) > 45 * 60_000 ? "stale" : "connected",
      detail: !data.gmail ? "No sync has reached HQ yet." : `Last sync ${Math.round(age(data.gmail.generatedAt, now) / 60_000)} minutes ago from ${data.gmail.account}.`,
      action: !data.gmail ? "Install the private sync" : null, href: !data.gmail ? "https://script.google.com/home/projects/create" : null },
    { id: "calendar", label: "Google Calendar", state: !data.calendar ? "missing" : age(data.calendar.generatedAt, now) > 45 * 60_000 ? "stale" : "connected",
      detail: !data.calendar ? "Your day has no calendar source." : `Last sync ${Math.round(age(data.calendar.generatedAt, now) / 60_000)} minutes ago.`,
      action: !data.calendar ? "Install beside Gmail sync" : null, href: !data.calendar ? "https://script.google.com/home/projects/create" : null },
    { id: "calgarywatch", label: "CalgaryWatch operations", state: !data.snapshot ? "missing" : age(data.snapshot.generatedAt, now) > 90 * 60_000 ? "stale" : "connected",
      detail: !data.snapshot ? "No operations snapshot." : `Last report ${Math.round(age(data.snapshot.generatedAt, now) / 60_000)} minutes ago.`, action: null, href: null },
  ];
  const urgent = recommendations.filter((r) => r.score >= 85).length;
  const wins = (data.snapshot?.activity ?? []).filter((a) => a.at >= now - 7 * DAY).slice(0, 4).map((a) => `${label[a.business]}: ${a.text}`);
  return {
    recommendations, relationships: relationships(data),
    opportunities: [
      ...replies.filter((r) => /interested|quote|price|available|meeting|call|book/i.test(`${r.subject} ${r.snippet}`)).slice(0, 5)
        .map((r) => ({ title: `${r.name || r.from} may be ready to move`, detail: r.snippet, business: r.business === "other" || r.business === "calgarydaily" ? "all" as const : r.business, confidence: "medium" as const, source: "Gmail buying-signal scan" })),
      ...(active.length ? [] : [{ title: "Run one measurable growth experiment", detail: "No experiment is running, so changes cannot be separated from noise.", business: "all" as const, confidence: "high" as const, source: "Experiment tracker" }]),
    ],
    weekly: { wins, risks: connections.filter((c) => c.state !== "connected").map((c) => `${c.label}: ${c.detail}`),
      focus: recommendations.slice(0, 3).map((r) => r.title), generatedAt: now },
    workload: { open: recommendations.length + (data.life ?? []).filter((e) => e.kind === "note" && !e.done).length, urgent,
      message: urgent > 5 ? "Too many urgent items. Finish the first three before starting another initiative." : urgent ? "Clear the ranked list before adding work." : "No urgent operational pressure is visible." },
    connections,
    research: { events7d: recent.length, topAreas: [...areas.entries()].map(([area, count]) => ({ area, count })).sort((a, b) => b.count - a.count).slice(0, 5),
      message: recent.length < 10 ? "HQ needs a week of usage evidence before another workflow redesign." : "Usage evidence is ready for a weekly review." },
  };
}
