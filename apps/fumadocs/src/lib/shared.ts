export const appName = "code2-base-ui";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
	user: "WAROL52",
	repo: "code2-base-ui",
	branch: "master",
};

export function getPageImage(page: { slugs: string[] }) {
	const segments = [...page.slugs, "image.png"];

	return {
		segments,
		url: `${docsImageRoute}/${segments.join("/")}`,
	};
}

export function getPageMarkdownUrl(page: { slugs: string[] }) {
	const segments = [...page.slugs, "content.md"];

	return {
		segments,
		url: `${docsContentRoute}/${segments.join("/")}`,
	};
}

export function getPageFromImageSlug(slug: string[]): string[] {
	return slug.slice(0, -1);
}

export function getPageFromMarkdownSlug(
	slug: string[] | undefined
): string[] | undefined {
	return slug?.slice(0, -1);
}
