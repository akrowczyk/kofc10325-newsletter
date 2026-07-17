"use server";

import { revalidatePath } from "next/cache";
import { saveGlobals } from "@/lib/store";
import type { Globals } from "@/lib/types";

export async function saveGlobalsAction(globals: Globals): Promise<void> {
  await saveGlobals(globals);
  // Globals appear on every issue, so refresh the studio + published pages.
  revalidatePath("/", "layout");
}
