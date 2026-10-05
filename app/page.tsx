import { HeroV2 } from "@/components/home/v2/HeroV2";
import { GapV2 } from "@/components/home/v2/GapV2";
import { ProofV2 } from "@/components/home/v2/ProofV2";
import { TeardownBand } from "@/components/home/v2/TeardownBand";
import { OfferV2 } from "@/components/home/v2/OfferV2";
import { AutomationV2 } from "@/components/home/v2/AutomationV2";
import { ProcessStripV2 } from "@/components/home/v2/ProcessStripV2";
import { TrustV2 } from "@/components/home/v2/TrustV2";
import { FinalCtaV2 } from "@/components/home/v2/FinalCtaV2";

/**
 * Homepage v2 — composed from one component per section so independent work
 * on each section never touches the same file. Order is the conversion order
 * from docs/REBUILD_BRIEF_V2.md: recognise yourself, see proof, take the offer.
 * The previous homepage is kept for reference at docs/legacy/home-page.legacy.txt.
 */
export default function HomePage() {
  return (
    <>
      <HeroV2 />
      <GapV2 />
      <ProofV2 />
      <TeardownBand />
      <OfferV2 />
      <AutomationV2 />
      <ProcessStripV2 />
      <TrustV2 />
      <FinalCtaV2 />
    </>
  );
}
