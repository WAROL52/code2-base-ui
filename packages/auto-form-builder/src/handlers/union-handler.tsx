"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import { useState } from "react";
import { useFormLayout } from "../layout/context";

export interface UnionFieldHandlerProps {
	fieldMeta: FieldMeta;
	renderField: (childMeta: FieldMeta) => ReactNode;
}

export function UnionFieldHandler({
	fieldMeta,
	renderField,
}: UnionFieldHandlerProps) {
	const layout = useFormLayout();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const variants = fieldMeta.variants;

	if (!variants || variants.length === 0) {
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
			{variant.children.map((child) => renderField(child))}
		</layout.CompositionsField>
	);
}
