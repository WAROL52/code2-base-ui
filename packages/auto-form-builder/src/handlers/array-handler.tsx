"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import type { FormAPI } from "../adapters/types";
import { useFormLayout } from "../layout/context";

export interface ArrayFieldHandlerProps {
	fieldMeta: FieldMeta;
	form?: FormAPI;
	renderField: (childMeta: FieldMeta) => ReactNode;
}

function getDefaultForType(type?: string): unknown {
	switch (type) {
		case "string":
			return "";
		case "number":
			return 0;
		case "boolean":
			return false;
		case "object":
			return {};
		case "array":
			return [];
		default:
			return "";
	}
}

export function ArrayFieldHandler({
	fieldMeta,
	form,
	renderField,
}: ArrayFieldHandlerProps) {
	const layout = useFormLayout();
	const { path } = fieldMeta;
	const itemMeta = fieldMeta.itemMeta;

	if (!itemMeta) {
		return null;
	}

	const values = (form?.values[path] as unknown[]) ?? [];

	const items = values.map((_val, index) => {
		const indexedMeta: FieldMeta = {
			...itemMeta,
			path: `${path}[${index}]`,
		};
		return renderField(indexedMeta);
	});

	return (
		<layout.ArrayField
			fieldMeta={fieldMeta}
			onAdd={() =>
				form?.appendFieldValue(path, getDefaultForType(itemMeta.type))
			}
			onRemove={(index) => form?.removeFieldValue(path, index)}
		>
			{items}
		</layout.ArrayField>
	);
}
