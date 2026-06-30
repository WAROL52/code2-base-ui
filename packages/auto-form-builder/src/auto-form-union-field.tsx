"use client";

import { useState } from "react";
import type { AutoFormFieldProps } from "./auto-form-field-types";
import { useFormLayout } from "./layout/context";

export function UnionFieldHandler({
	fieldMeta,
	renderChild,
}: AutoFormFieldProps) {
	const layout = useFormLayout();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const variants = fieldMeta.variants;

	if (!variants || variants.length === 0) {
		return null;
	}

	const variant = variants[selectedIndex];

	if (!variant) {
		return null;
	}

	return (
		<layout.CompositionsField
			fieldMeta={fieldMeta}
			onSelect={(index) => setSelectedIndex(index)}
			options={variants.map((v) => ({ label: v.label }))}
			selectedIndex={selectedIndex}
		>
			{variant.children.map((child) => renderChild?.(child))}
		</layout.CompositionsField>
	);
}
