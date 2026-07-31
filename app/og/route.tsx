import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  ARCTOS_BEAR_PATH,
  ARCTOS_FRAME_PATH,
  ARCTOS_STAR_PATH,
} from "@/components/brand/ArctosMark";

export const dynamic = "force-static";

/**
 * The share card.
 *
 * One instrument-material plate per route: mono kicker, the page's own title in
 * Archivo semi-condensed, the Newsreader italic turn, and the Arctos mark. It
 * takes the title from the query string so every route gets its own card
 * without a file per segment — `lib/seo.ts` builds the URL.
 *
 * Colours are duplicated from `app/tokens.css` because next/og rasterises
 * outside the browser and cannot resolve CSS custom properties. These four
 * values are the only place in the codebase that is allowed to restate them;
 * if a token changes, change it here too.
 */
const INK = "#081319"; /* --ink */
const INK_HAIRLINE = "#14262f"; /* --ink-hairline */
const GLACIER = "#f2f1ea"; /* --glacier */
const SIGNAL = "#2f9bff"; /* --signal */

const SIZE = { width: 1200, height: 630 };

const FONT_DIR = join(process.cwd(), "assets", "fonts");

/** Loaded once per server instance, not once per card. */
let fontCache: Promise<
  {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 500 | 600;
    style: "normal" | "italic";
  }[]
> | null = null;

function loadFonts() {
  fontCache ??= Promise.all([
    readFile(join(FONT_DIR, "Archivo-SemiCondensed-SemiBold.ttf")),
    readFile(join(FONT_DIR, "IBMPlexMono-Medium.ttf")),
    readFile(join(FONT_DIR, "Newsreader-Italic.ttf")),
  ]).then(([archivo, mono, newsreader]) => [
    {
      name: "Archivo",
      data: toArrayBuffer(archivo),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Plex Mono",
      data: toArrayBuffer(mono),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Newsreader",
      data: toArrayBuffer(newsreader),
      weight: 400 as const,
      style: "italic" as const,
    },
  ]);
  return fontCache;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/** Long headlines shrink rather than overflow the plate. */
function titleSize(length: number) {
  if (length <= 28) return 104;
  if (length <= 48) return 88;
  if (length <= 72) return 72;
  if (length <= 100) return 60;
  return 50;
}

function clean(value: string | null, limit: number) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title =
    clean(params.get("title"), 130) || "The systems behind growing businesses.";
  const eyebrow = clean(params.get("eyebrow"), 48) || "Arctos Launchpad";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: INK,
        color: GLACIER,
        padding: "64px 72px",
        fontFamily: "Archivo",
      }}
    >
      {/* The survey rule, echoed as a left gutter hairline. */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 0,
          bottom: 0,
          width: 1,
          background: INK_HAIRLINE,
        }}
      />

      {/* Kicker and mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 34, height: 2, background: SIGNAL }} />
          <div
            style={{
              fontFamily: "Plex Mono",
              fontSize: 21,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: GLACIER,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <svg
          width={82}
          height={82}
          viewBox="0 0 100 100"
          fill={GLACIER}
          fillRule="evenodd"
        >
          <path d={ARCTOS_FRAME_PATH} />
          <path d={ARCTOS_BEAR_PATH} />
          <path d={ARCTOS_STAR_PATH} />
        </svg>
      </div>

      {/* The page's own headline */}
      <div
        style={{
          display: "flex",
          fontSize: titleSize(title.length),
          lineHeight: 1.03,
          letterSpacing: "-0.035em",
          maxWidth: 1000,
        }}
      >
        {title}
      </div>

      {/* Colophon */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `1px solid ${INK_HAIRLINE}`,
          paddingTop: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Newsreader",
            fontStyle: "italic",
            fontSize: 32,
            color: GLACIER,
            opacity: 0.72,
          }}
        >
          Digital growth &amp; technology studio
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Plex Mono",
            fontSize: 20,
            letterSpacing: "0.08em",
            color: GLACIER,
            opacity: 0.55,
          }}
        >
          Calgary, AB
        </div>
      </div>
    </div>,
    {
      ...SIZE,
      fonts: await loadFonts(),
      headers: {
        "cache-control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
