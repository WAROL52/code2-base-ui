import { ComponentPreviewClient } from "@/components/component-preview-client";
import { getExampleSource } from "@/lib/get-example-source";

interface ComponentPreviewProps {
	children: React.ReactNode;
	className?: string;
	code?: string;
	name?: string;
}

export function ComponentPreview({
	children,
	name,
	code: directCode,
	className,
}: ComponentPreviewProps) {
	const code = name ? getExampleSource(`${name}.tsx`) : (directCode ?? "");

	return (
		<ComponentPreviewClient className={className} code={code}>
			{children}
		</ComponentPreviewClient>
	);
}
