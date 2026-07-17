import { getGlobals, getIssue } from "@/lib/store";
import { wrapStandaloneHtml } from "@/lib/exportHtml";
import { EMBLEM_DATA_URI } from "@/lib/exportAssets.generated";

export const runtime = "nodejs";

// Download a self-contained .html file for an issue (fonts/emblem/CSS inlined),
// ready to drop into the Hostinger deploy under the main domain.
//
// react-dom/server and the template are imported dynamically so Turbopack does
// not pull react-dom/server into the react-server graph (which it forbids).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const [issue, globals] = await Promise.all([getIssue(slug), getGlobals()]);
  if (!issue) return new Response("Not found", { status: 404 });

  const [{ renderToStaticMarkup }, { NewsletterTemplate }, React] = await Promise.all([
    import("react-dom/server"),
    import("@/components/NewsletterTemplate"),
    import("react"),
  ]);

  const body = renderToStaticMarkup(
    React.createElement(NewsletterTemplate, {
      issue,
      globals,
      emblemSrc: EMBLEM_DATA_URI,
    }),
  );
  const html = wrapStandaloneHtml(body, issue, globals);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="council10325-newsletter-${slug}.html"`,
    },
  });
}
