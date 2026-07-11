import { useState } from "react";
import type { HandlerProps } from "./types";

export function UnionHandler({
	adapter,
	fieldMeta,
	form,
	layout,
	registry,
	renderChild,
	unionFieldRenderer: UnionRenderer,
}: HandlerProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	if (!fieldMeta.variants) {
		return null;
	}

	if (UnionRenderer) {
		return (
			<UnionRenderer
				adapter={adapter}
				fieldMeta={fieldMeta}
				form={form}
				layout={layout}
				registry={registry}
				renderChild={renderChild}
				unionFieldRenderer={UnionRenderer}
			/>
		);
	}

	const variants = fieldMeta.variants;

	if (variants.length === 0) {
		return null;
	}

	const safeIndex =
		selectedIndex >= variants.length
			? Math.max(0, variants.length - 1)
			: selectedIndex;
	const variant = variants[safeIndex];

	if (!variant) {
		return null;
	}

	return (
		<layout.CompositionsField
			fieldMeta={fieldMeta}
			onSelect={(index) => setSelectedIndex(index)}
			options={variants.map((v) => ({ label: v.label }))}
			selectedIndex={safeIndex}
		>
			{variant.children.map((child) => renderChild(child))}
		</layout.CompositionsField>
	);
}
