"use client";

import { usePathname } from "next/navigation";

/** The marketing header and footer, left off private tools (/hq) that bring their own. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/hq")) return null;
  return <>{children}</>;
}
