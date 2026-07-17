"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteIssue,
  publishIssue,
  saveIssue,
  startNextIssue,
} from "@/lib/store";
import type { Issue } from "@/lib/types";

export async function startNextIssueAction() {
  const draft = await startNextIssue();
  revalidatePath("/");
  redirect(`/issues/${draft.slug}/edit`);
}

export async function saveIssueAction(issue: Issue): Promise<Issue> {
  const saved = await saveIssue(issue);
  revalidatePath("/");
  revalidatePath(`/n/${saved.slug}`);
  revalidatePath(`/issues/${saved.slug}/edit`);
  return saved;
}

export async function publishIssueAction(slug: string) {
  await publishIssue(slug);
  revalidatePath("/");
  revalidatePath(`/n/${slug}`);
  redirect(`/n/${slug}`);
}

export async function deleteIssueAction(slug: string) {
  await deleteIssue(slug);
  revalidatePath("/");
  redirect("/");
}
