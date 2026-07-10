"use client";

import type { ReactNode } from "react";

function PlaceholderStory({ title }: { title: string }): ReactNode {
	return (
		<div className="rounded-lg border p-4">
			<p className="text-fd-muted-foreground text-xs">
				Story <code>{title}</code> à implémenter.
			</p>
		</div>
	);
}

export function StoryDemos(): ReactNode {
	return (
		<div className="space-y-8">
			<section>
				<h3 className="mb-2 font-semibold text-lg">InputField</h3>
				<PlaceholderStory title="InputField" />
			</section>
			<section>
				<h3 className="mb-2 font-semibold text-lg">SelectField</h3>
				<PlaceholderStory title="SelectField" />
			</section>
			<section>
				<h3 className="mb-2 font-semibold text-lg">CheckboxField</h3>
				<PlaceholderStory title="CheckboxField" />
			</section>
			<section>
				<h3 className="mb-2 font-semibold text-lg">TextareaField</h3>
				<PlaceholderStory title="TextareaField" />
			</section>
		</div>
	);
}
