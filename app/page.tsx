import { getProjectBySlug, portfolioOrder, projects, type Project } from "@/lib/content";
import { BridgeHero } from "@/components/site/home/BridgeHero";
import { IslandsChapter } from "@/components/site/home/IslandsChapter";
import { WorkRail } from "@/components/site/home/WorkRail";
import { HomeMethod } from "@/components/site/home/HomeMethod";
import { StudioNote } from "@/components/site/home/StudioNote";
import { StartBand } from "@/components/site/StartBand";

const RAIL = ["nicsdelite", "true-north-kromes", "calgary-watch", "rio-alto", "so-social-collective", "vow-motion"];

export default function HomePage() {
  const rail = RAIL.map(getProjectBySlug).filter((p): p is Project => Boolean(p));

  return (
    <>
      <BridgeHero />
      <IslandsChapter />
      <WorkRail projects={rail} total={portfolioOrder.length || projects.length} />

      <HomeMethod />


      <StudioNote />

      <StartBand />
    </>
  );
}
