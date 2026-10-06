import Image from "next/image";
import type { CaseMedia, Project } from "@/lib/content";
import { LeaseFlowFigure, ReportFlowFigure } from "./figures";

/** One piece of real media, normalised so every case-study surface can show it. */
export type Shot = CaseMedia;

export type Frame =
  | { kind: "image"; shot: Shot }
  | { kind: "phone"; src: string; alt: string; caption: string }
  | { kind: "reel"; src: string; poster: string; caption: string }
  | { kind: "figure"; figure: "report" | "flow"; step: number };

/** Every real still a project owns, in the order it should be seen. */
export function projectShots(project: Project): { photos: Shot[]; screens: Shot[] } {
  const owner = project.client ?? project.title;
  const photos: Shot[] = [
    ...(project.caseMedia ?? []).filter((m) => m.kind !== "screen"),
    ...(project.specimens ?? []).map((s) => ({
      ...s,
      caption: `From ${owner}’s own photography.`,
      kind: "photo" as const,
    })),
  ];
  const screens: Shot[] = [
    ...(project.showcaseMedia ?? []).map((m) => ({
      src: m.src,
      alt: m.alt,
      caption: m.caption,
      width: m.layout === "portrait" ? 1024 : 1800,
      height: m.layout === "portrait" ? 1536 : 964,
      kind: "screen" as const,
    })),
    ...(project.caseMedia ?? []).filter((m) => m.kind === "screen"),
  ];
  return { photos, screens };
}

export function reelCaption(project: Project) {
  return project.status === "launched"
    ? "Screen recording of the live site"
    : `Screen recording · ${project.statusLabel}`;
}

/**
 * Four frames for the four story chapters: the real world the work serves,
 * the constraint (usually the phone, where it had to hold up), the approach,
 * and finally the built thing running. Projects without public media get
 * their diagram, advanced one state per chapter.
 */
export function chapterFrames(project: Project): Frame[] {
  const figure = project.mockupType === "dashboard" ? "report" : "flow";
  if (!project.reel && !project.featuredImage) {
    return [0, 1, 2, 3].map((step) => ({ kind: "figure", figure, step }));
  }

  const { photos, screens } = projectShots(project);
  const used = new Set<string>();
  const pick = (...lists: Shot[][]): Frame | null => {
    for (const list of lists) {
      const s = list.find((x) => !used.has(x.src));
      if (s) {
        used.add(s.src);
        return { kind: "image", shot: s };
      }
    }
    return null;
  };
  const phone: Frame | null = project.phone
    ? {
        kind: "phone",
        src: project.phone,
        alt: `${project.title} on a phone, captured from the ${project.status === "launched" ? "live site" : "product"}`,
        caption: "Phone capture, October 2026.",
      }
    : null;
  const reel: Frame | null = project.reel
    ? { kind: "reel", src: project.reel.src, poster: project.reel.poster, caption: reelCaption(project) }
    : null;

  const frames: (Frame | null)[] = [
    pick(photos, screens) ?? phone,
    phone ?? pick(photos, screens),
    pick(screens, photos),
    reel ?? pick(screens, photos),
  ];
  // Fill any gap with whatever is left, so each chapter still has a frame.
  return frames.map((f, i) => f ?? pick(photos, screens) ?? frames.find(Boolean) ?? frames[i]!) as Frame[];
}

export function framesUsed(frames: Frame[]) {
  return new Set(frames.flatMap((f) => (f.kind === "image" ? [f.shot.src] : [])));
}

export function FrameMedia({ frame, sizes }: { frame: Frame; sizes: string }) {
  switch (frame.kind) {
    case "figure":
      return frame.figure === "report" ? (
        <ReportFlowFigure step={frame.step} caption={false} />
      ) : (
        <LeaseFlowFigure step={frame.step} caption={false} />
      );
    case "phone":
      return (
        <figure className="cx-fm cx-fm--phone">
          <div className="phone">
            <Image src={frame.src} alt={frame.alt} width={390} height={844} sizes="300px" />
          </div>
          <figcaption className="mono">{frame.caption}</figcaption>
        </figure>
      );
    case "reel":
      return (
        <figure className="cx-fm cx-fm--reel">
          <div className="cx-fm__screen">
            <video data-reel muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} poster={frame.poster}>
              <source src={frame.src} type="video/webm" />
            </video>
          </div>
          <figcaption className="mono">{frame.caption}</figcaption>
        </figure>
      );
    default:
      return (
        <figure className={`cx-fm cx-fm--${frame.shot.width >= frame.shot.height ? "wide" : "tall"}`}>
          <div className="cx-fm__img">
            <Image
              src={frame.shot.src}
              alt={frame.shot.alt}
              width={frame.shot.width}
              height={frame.shot.height}
              sizes={sizes}
            />
          </div>
          <figcaption className="mono">{frame.shot.caption}</figcaption>
        </figure>
      );
  }
}
