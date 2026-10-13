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
  for (const e of (data.life ?? []).filter((x) => x.kind === "note" && !x.done && x.due && x.due <= now + DAY).slice(0, 5)) {
    out.push({ id: `todo-${e.id}`, title: e.text || "Finish today's task", reason: e.due! < now ? "This is overdue." : "Due today.",
      business: "all", score: e.due! < now ? 88 : 72, effort: "30+ min", confidence: "high", source: "Your to-do list", href: "#life" });
  }
  if (!data.gmail) out.push({ id: "connect-gmail", title: "Connect mrotiz Gmail",
    reason: "Unlock Vow Motion and Arctos replies, relationship history and opportunity detection.",
    business: "all", score: 100, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  else if (age(data.gmail.generatedAt, now) > 45 * 60_000) out.push({ id: "restore-gmail", title: "Restore Gmail sync",
    reason: "HQ cannot safely prioritize replies while its email view is stale.", business: "all", score: 99, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  if (!data.calendar) out.push({ id: "connect-calendar", title: "Connect Google Calendar", reason: "HQ needs your calendar to protect time and warn you before meetings.",
    business: "all", score: 91, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  else if (age(data.calendar.generatedAt, now) > 45 * 60_000) out.push({ id: "restore-calendar", title: "Restore Calendar sync", reason: "HQ is planning the day from an old calendar.",
    business: "all", score: 93, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  if (!data.snapshot) out.push({ id: "restore-operations", title: "Restore CalgaryWatch operations", reason: "Publishing, outreach and pipeline status are unavailable.",
    business: "calgarywatch", score: 100, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#improve/setup" });
  else if (age(data.snapshot.generatedAt, now) > 90 * 60_000) out.push({ id: "refresh-operations", title: "Refresh CalgaryWatch operations", reason: "The operating report is too old to trust.",
    business: "calgarywatch", score: 97, effort: "10 min", confidence: "high", source: "Setup doctor", href: "#system" });
  for (const m of data.memories.filter((x) => x.kind === "priority").slice(0, 3)) out.push({
    id: `priority-${m.id}`, title: m.text, reason: `Saved priority · ${label[m.business]}`,
    business: m.business, score: 75, effort: "30+ min", confidence: "high", source: "Your memory", href: "#improve/memory" });
  return out.sort((a, b) => b.score - a.score).slice(0, 12);
}

function dailyPlan(data: Omit<HqData, "intelligence">, recommendations: HqRecommendation[], now: number): HqIntelligence["daily"] {
  const missing = recommendations.some((r) => /^(connect|restore|refresh)-(gmail|calendar|operations)$/.test(r.id));
  const warm = recommendations.filter((r) => /^Reply to |replied|ready to move/i.test(`${r.title} ${r.reason}`));
  const cash = recommendations.filter((r) => r.id.startsWith("owed-"));
  const delivery = recommendations.filter((r) => /failed|fix|publish/i.test(`${r.title} ${r.reason}`));
  const mode: HqIntelligence["daily"]["mode"] = missing ? "restore" : warm.length || cash.length ? "revenue" : delivery.length ? "deliver" : recommendations.length ? "clear" : "grow";
  const copy = {
    restore: ["Restore visibility", "HQ is missing a source, so every other recommendation has lower confidence."],
    revenue: ["Move money forward", "Warm replies and money already earned have the highest value today."],
    deliver: ["Protect delivery", "Fix the customer-facing break before creating more work."],
    clear: ["Create a clear runway", "Three decisions will unblock the agents and reduce tomorrow's queue."],
    grow: ["Make one growth move", "Operations are calm. Use the space for a measurable move that can compound."],
  } as const;
  const preferred = mode === "revenue" ? [...warm, ...cash] : mode === "deliver" ? delivery : recommendations;
  const actions = [...new Map([...preferred, ...recommendations].map((r) => [r.id, r])).values()].slice(0, 3);
  const handled = [
    "Healthy agent runs and successful posts stay out of your way.",
    data.calendar ? "Calendar timing is watched automatically." : "Calendar timing will be watched once its sync returns.",
    data.gmail ? "Email is filtered before a reply reaches you." : "Email filtering resumes when Gmail reconnects.",
  ];
  return { mode, outcome: copy[mode][0], why: copy[mode][1], actions, handled, generatedAt: now };
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
    daily: dailyPlan(data, recommendations, now),
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
