import { generate as DefaultImage } from "fumadocs-ui/og";
import { ImageResponse } from "next/og";

import { appName, getPageImage } from "@/lib/shared";
import { getPageOr404, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
	_req: Request,
	{ params }: RouteContext<"/og/docs/[...slug]">
) {
	const { slug } = await params;
	const page = getPageOr404(slug.slice(0, -1));

	return new ImageResponse(
		<DefaultImage
			description={page.data.description}
			site={appName}
			title={page.data.title}
		/>,
		{
			width: 1200,
			height: 630,
		}
	);
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		lang: page.locale,
		slug: getPageImage(page).segments,
	}));
}
