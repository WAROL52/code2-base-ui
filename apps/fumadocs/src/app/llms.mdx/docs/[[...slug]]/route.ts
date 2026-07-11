import { getPageFromMarkdownSlug, getPageMarkdownUrl } from "@/lib/shared";
import { getLLMText, getPageOr404, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
	_req: Request,
	{ params }: RouteContext<"/llms.mdx/docs/[[...slug]]">
) {
	const { slug } = await params;
	const page = getPageOr404(getPageFromMarkdownSlug(slug));

	return new Response(await getLLMText(page), {
		headers: {
			"Content-Type": "text/markdown",
		},
	});
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		lang: page.locale,
		slug: getPageMarkdownUrl(page).segments,
	}));
}
