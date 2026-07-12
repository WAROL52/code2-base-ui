"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { cn } from "@/lib/cn";

interface ComponentPreviewClientProps {
	children: React.ReactNode;
	className?: string;
	code: string;
}

export function ComponentPreviewClient({
	children,
	code,
	className,
}: ComponentPreviewClientProps) {
	return (
		<div className={cn("not-prose my-6 overflow-hidden", className)}>
			<Tabs items={["Preview", "Code"]}>
				<Tab value="Preview">
					<div className="flex min-h-64 w-full items-center justify-center p-6">
						{children}
					</div>
				</Tab>
				<Tab value="Code">
					<DynamicCodeBlock code={code} lang="tsx" />
				</Tab>
			</Tabs>
		</div>
	);
}
