import { getGlobals } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { SettingsClient } from "./SettingsClient";

// Reads globals at request time.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const globals = await getGlobals();
  return (
    <>
      <SiteHeader />
      <SettingsClient initialGlobals={globals} />
    </>
  );
}
