import Image from "next/image";
import Link from "next/link";
import { calgaryLandingPages, islands } from "@/lib/content";
import { ArctosLockup } from "../brand/ArctosLockup";
import { FooterFx } from "./close/FooterFx";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ftr tone-ink" data-tone="ink">
      <FooterFx />
      <div className="ftr__sky" aria-hidden="true" />
      <div className="wrap">
        <div className="ftr__top">
          <div className="ftr__brand">
            <ArctosLockup size={40} />
            <p>
              A Calgary studio building the bridge between how a business wins customers, runs its
              work, and sees its numbers.
            </p>
            <div className="ftr__start">
              <Link className="ftr__big" href="/contact">
                <span className="ftr__big-t">Start a project</span>{" "}
                <span className="ftr__big-a" aria-hidden="true">
                  →
                </span>
              </Link>
              <p className="ftr__note">Reply within two business days. No obligation.</p>
            </div>
          </div>
          <div className="ftr__bridge" aria-hidden="true">
            <div className="ftr__bridge-tilt">
              <div className="ftr__bridge-rise">
                <Image
                  src="/assets/art/bridge.webp"
                  alt=""
                  width={1536}
                  height={1024}
                  sizes="(max-width: 900px) 100vw, 56vw"
                />
              </div>
            </div>
            <span className="ftr__shadow" />
          </div>
        </div>

        <div className="ftr__cols">
          <nav aria-label="What we build">
            <p className="mono">What we build</p>
            <ul>
              {islands.map((island) => (
                <li key={island.id}>
                  <Link href={`/services#${island.id}`}>{island.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/teardown">Free reporting teardown</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Studio">
            <p className="mono">Studio</p>
            <ul>
              <li>
                <Link href="/work">Work</Link>
              </li>
              <li>
                <Link href="/process">Process</Link>
              </li>
              <li>
                <Link href="/studio">About the studio</Link>
              </li>
              <li>
                <Link href="/industries">Industries</Link>
              </li>
              <li>
                <Link href="/guides/alberta-digital-funding">Funding guide</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Calgary">
            <p className="mono">In Calgary</p>
            <ul>
              {calgaryLandingPages.map((page) => (
                <li key={page.route}>
                  <Link href={page.route}>{page.title.replace(/^Calgary /, "")}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ftr__base">
          <p>© {year} Arctos Launchpad · Calgary, Alberta</p>
          <ul>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/accessibility">Accessibility</Link>
            </li>
            <li>
              <a className="ftr__top-link" href="#top">
                Back to top <span aria-hidden="true">↑</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="ftr__mark" aria-hidden="true">
        <span className="ftr__word">Arctos</span>
        <span className="ftr__rule" />
      </div>
    </footer>
  );
}
