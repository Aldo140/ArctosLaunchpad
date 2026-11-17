import { PortalAdmin } from "@/components/portal/PortalAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Client admin", robots: { index: false, follow: false, nocache: true } };

export default function PortalAdminPage() { return <PortalAdmin />; }
