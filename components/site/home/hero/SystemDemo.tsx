import Image from "next/image";

/**
 * The phone hero's live demo: what Arctos builds, shown working rather than
 * described. Three connected screens, one per island:
 *
 *   01 Website     a real client site; a visitor taps its call to action
 *   02 Automation  the enquiry lands on a leads board and follows itself up
 *   03 Reporting   the dashboard counts it
 *
 * Markup only; BridgeHero drives the timeline so each step can light its
 * headline line. The sites are real Arctos client work; the enquiries are
 * illustrative, and the visible copy says so ("Sample enquiry").
 */

export type DemoSite = {
  src: string;
  name: string;
  /** Where the site's own call to action sits, as fractions of the capture. */
  tap: { x: number; y: number };
  /** The illustrative enquiry that tap produces. */
  lead: { who: string; what: string };
};

export const DEMO_SITES: DemoSite[] = [
  {
    src: "/assets/work/nicsdelite-phone.webp",
    name: "Nics Delite",
    tap: { x: 0.6, y: 0.89 },
    lead: { who: "Maya R.", what: "Custom cake order" },
  },
  {
    src: "/assets/work/rio-alto-phone.webp",
    name: "Rio Alto",
    tap: { x: 0.36, y: 0.945 },
    lead: { who: "Daniel P.", what: "Catering enquiry" },
  },
  {
    src: "/assets/work/true-north-kromes-phone.webp",
    name: "True North Kromes",
    tap: { x: 0.16, y: 0.78 },
    lead: { who: "Ridge Dental Lab", what: "Framework order" },
  },
];

/** Rows already on the board when the demo starts. */
const EXISTING = [
  { who: "Lena K.", what: "Website quote", status: "Booked" },
  { who: "Omar S.", what: "Booking request", status: "Replied" },
];

/** The week so far, Monday to Sunday; the last bar grows as leads land. */
const BARS = [38, 52, 44, 63, 58, 72, 30];

export const DEMO_START_COUNT = 23;

/** The brand's island for each step, as a small mark beside the card label. */
function DemoIsle({ id }: { id: "win" | "run" | "see" }) {
  const size = { win: [90, 96], run: [69, 96], see: [85, 96] }[id];
  return (
    <Image
      className="demo-isle"
      src={`/assets/art/island-${id}-icon.webp`}
      alt=""
      width={size[0]}
      height={size[1]}
      sizes="24px"
    />
  );
}

export function SystemDemo() {
  return (
    <div className="hero__demo">
      <div className="hero__demo-stage" aria-hidden="true">
        {/* the northern sky behind the screens */}
        <div className="hero__aurora">
          <i />
          <i />
          <i />
        </div>
        <div className="hero__halo" />

        {/* 01 — the website */}
        <div className="demo-card demo-phone" data-step="win">
          <p className="demo-k">
            <DemoIsle id="win" />
            <span>01</span> Website
          </p>
          <div className="demo-phone__frame">
            <div className="demo-phone__screen">
              {DEMO_SITES.map((site, i) => (
                <Image
                  key={site.src}
                  src={site.src}
                  alt=""
                  width={780}
                  height={1688}
                  sizes="44vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`demo-site${i === 0 ? " is-on" : ""}`}
                />
              ))}
              <span className="demo-tap" />
            </div>
          </div>
        </div>

        {/* 02 — the automation */}
        <div className="demo-card demo-leads" data-step="run">
          <p className="demo-k">
            <DemoIsle id="run" />
            <span>02</span> Leads · automated
          </p>
          <ul className="demo-rows">
            <li className="demo-row demo-row--new">
              <span className="demo-av">M</span>
              <span className="demo-who">
                <b className="demo-name">Maya R.</b>
                <small className="demo-what">Custom cake order</small>
              </span>
              <span className="demo-pill">
                <span className="demo-pill__a">New</span>
                <span className="demo-pill__b">Follow-up sent ✓</span>
              </span>
            </li>
            {EXISTING.map((row) => (
              <li key={row.who} className="demo-row">
                <span className="demo-av">{row.who[0]}</span>
                <span className="demo-who">
                  <b>{row.who}</b>
                  <small>{row.what}</small>
                </span>
                <span className="demo-pill is-done">{row.status}</span>
              </li>
            ))}
          </ul>
          <p className="demo-note">Sample enquiry</p>
        </div>

        {/* the studio's bear, peeking over the dashboard to read the numbers */}
        <Image
          className="demo-bear"
          src="/assets/art/bear-peek.webp"
          alt=""
          width={420}
          height={280}
          sizes="26vw"
        />

        {/* 03 — the reporting */}
        <div className="demo-card demo-dash" data-step="see">
          <p className="demo-k">
            <DemoIsle id="see" />
            <span>03</span> This week
          </p>
          <div className="demo-dash__body">
            <p className="demo-num">
              <b className="demo-count">{DEMO_START_COUNT}</b>
              <small>enquiries</small>
            </p>
            <div className="demo-bars">
              {BARS.map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} className={i === BARS.length - 1 ? "is-today" : undefined} />
              ))}
            </div>
          </div>
        </div>

        {/* the signal's route between the screens, in stage percentages */}
        <svg className="demo-route" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="demo-route__path demo-route__path--a" d="M 27 80 C 34 66 40 40 52 24" pathLength={1} />
          <path className="demo-route__path demo-route__path--b" d="M 80 42 C 84 54 78 64 70 72" pathLength={1} />
        </svg>
        <span className="demo-signal" />
        <span className="demo-toast">
          <b>New enquiry</b>
          <small className="demo-toast__what">Custom cake order</small>
        </span>
      </div>
      <p className="visually-hidden">
        A short demo: a visitor taps the call to action on a client website, the enquiry lands on an
        automated leads board and is followed up, and the weekly dashboard counts it.
      </p>
    </div>
  );
}
