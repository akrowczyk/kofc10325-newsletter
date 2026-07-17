import { notFound } from "next/navigation";
import { getGlobals, getIssue } from "@/lib/store";
import { EditorClient } from "./EditorClient";

export default async function EditIssue({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [issue, globals] = await Promise.all([getIssue(slug), getGlobals()]);
  if (!issue) notFound();
  return <EditorClient initialIssue={issue} globals={globals} />;
}
