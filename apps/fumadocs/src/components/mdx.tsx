import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ComponentPreview } from "@/components/component-preview";
import { DocsCode, DocsNote } from "@/components/docs-components";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		DocsNote,
		DocsCode,
		ComponentPreview,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
