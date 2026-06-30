"use client";

import { useState } from "react";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormFieldProps } from "./auto-form-field-types";
import { useFormLayout } from "./layout/context";

export function UnionFieldHandler({
	adapter,
	fieldMeta,
	form,
	registry,
	unionFieldRenderer: UnionRenderer,
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
			{variant.children.map((child) => (
				<AutoFormField
					adapter={adapter}
					fieldMeta={child}
					form={form}
					key={child.path}
					registry={registry}
					unionFieldRenderer={UnionRenderer}
				/>
			))}
		</layout.CompositionsField>
	);
}
