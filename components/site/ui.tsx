import Link from "next/link";
import type { CSSProperties, ElementType, ReactNode } from "react";
import type { Project } from "@/lib/content";

/** Stagger index for reveal transitions. */
export const d = (n: number) => ({ "--d": n }) as CSSProperties;

/**
 * A heading revealed line by line. Lines are authored, not measured, so the
 * break points are editorial decisions and survive any font-loading timing.
 */
export function Lines({
  as: Tag = "h2",
  lines,
  className,
  delay = 0,
  id,
}: {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <Tag className={`lines ${className ?? ""}`} data-reveal style={d(delay)} id={id}>
      {lines.map((line, i) => (
        <span className="ln" key={i}>
          <span style={{ "--l": i } as CSSProperties}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Btn({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn${variant === "ghost" ? " btn--ghost" : ""}${className ? ` ${className}` : ""}`}
    >
      <span>{children}</span>
      <span className="btn__dot" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return external ? (
    <a className="link" href={href} target="_blank" rel="noreferrer">
      {children}
      <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link className="link" href={href}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function Eyebrow({ children, plain }: { children: ReactNode; plain?: boolean }) {
  return <p className={`eyebrow${plain ? " eyebrow--plain" : ""}`}>{children}</p>;
}

export function statusTone(project: Project) {
  if (project.status === "launched") return "live";
  if (project.status === "internal-tool") return "internal";
  return "studio";
}

export function Status({ project }: { project: Project }) {
  return <span className={`status status--${statusTone(project)}`}>{project.statusLabel}</span>;
}

export const categoryLabel = {
  "client-site": "Client website",
  platform: "Platform or tool",
  studio: "Studio product or demo",
} as const;
