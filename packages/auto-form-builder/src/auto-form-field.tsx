"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";
import { useFormLayout } from "./layout/context";

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

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	form: FormAPI;
	registry: FieldRegistry;
	renderChild?: (childMeta: FieldMeta) => ReactNode;
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}

export function AutoFormField({
	fieldMeta,
	adapter,
	form,
	registry,
	unionFieldRenderer: UnionRenderer,
}: AutoFormFieldProps) {
	const layout = useFormLayout();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { uiHidden } = fieldMeta;

	if (uiHidden) {
		return null;
	}

	const renderField = (childMeta: FieldMeta) => (
		<AutoFormField
			adapter={adapter}
			fieldMeta={childMeta}
			form={form}
			key={childMeta.path}
			registry={registry}
			unionFieldRenderer={UnionRenderer}
		/>
	);

	if (fieldMeta.kind === "object" && fieldMeta.children) {
		return (
			<layout.ObjectField fieldMeta={fieldMeta}>
				{fieldMeta.children.map((child) => renderField(child))}
			</layout.ObjectField>
		);
	}

	if (fieldMeta.kind === "array" && fieldMeta.itemMeta) {
		const { path } = fieldMeta;
		const itemMeta = fieldMeta.itemMeta;
		const values = (form.values[path] as unknown[]) ?? [];

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
					form.appendFieldValue(path, getDefaultForType(itemMeta.type))
				}
				onRemove={(index) => form.removeFieldValue(path, index)}
			>
				{items}
			</layout.ArrayField>
		);
	}

	if (fieldMeta.kind === "union" && fieldMeta.variants) {
		if (UnionRenderer) {
			return (
				<UnionRenderer
					adapter={adapter}
					fieldMeta={fieldMeta}
					form={form}
					key={fieldMeta.path}
					registry={registry}
					renderChild={renderField}
					unionFieldRenderer={UnionRenderer}
				/>
			);
		}

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

	const { path, label, placeholder } = fieldMeta;
	const Component = registry.resolve(fieldMeta);

	return (
		<adapter.Field name={path}>
			{(field) => (
				<Component
					className={fieldMeta.uiReadonly ? "opacity-50" : ""}
					disabled={fieldMeta.uiReadonly}
					error={field.error}
					field={fieldMeta}
					id={path}
					key={path}
					label={label}
					onChange={(val: unknown) => field.onChange(val)}
					placeholder={placeholder}
					value={field.value}
				/>
			)}
		</adapter.Field>
	);
}
