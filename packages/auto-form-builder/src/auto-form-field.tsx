"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { useState } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";
import { useFormLayout } from "./layout/context";

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	form?: FormAPI;
	registry: FieldRegistry;
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

function UnionFieldHandler({
	adapter,
	fieldMeta,
	form,
	registry,
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
				/>
			))}
		</layout.CompositionsField>
	);
}

export function AutoFormField({
	fieldMeta,
	adapter,
	form,
	registry,
}: AutoFormFieldProps) {
	const layout = useFormLayout();
	const { path, label, uiHidden, placeholder } = fieldMeta;

	if (uiHidden) {
		return null;
	}

	if (fieldMeta.kind === "object" && fieldMeta.children) {
		return (
			<layout.ObjectField fieldMeta={fieldMeta}>
				{fieldMeta.children.map((child) => (
					<AutoFormField
						adapter={adapter}
						fieldMeta={child}
						form={form}
						key={child.path}
						registry={registry}
					/>
				))}
			</layout.ObjectField>
		);
	}

	if (fieldMeta.kind === "array" && fieldMeta.itemMeta) {
		const itemMeta = fieldMeta.itemMeta;
		const values = (form?.values[path] as unknown[]) ?? [];
		const items = values.map((_val, index) => {
			const indexedMeta: FieldMeta = {
				...itemMeta,
				path: `${path}[${index}]`,
			};
			return (
				<AutoFormField
					adapter={adapter}
					fieldMeta={indexedMeta}
					form={form}
					key={indexedMeta.path}
					registry={registry}
				/>
			);
		});

		return (
			<layout.ArrayField
				fieldMeta={fieldMeta}
				onAdd={() =>
					form?.appendFieldValue?.(path, getDefaultForType(itemMeta.type))
				}
				onRemove={(index) => form?.removeFieldValue?.(path, index)}
			>
				{items}
			</layout.ArrayField>
		);
	}

	if (fieldMeta.kind === "union" && fieldMeta.variants) {
		return (
			<UnionFieldHandler
				adapter={adapter}
				fieldMeta={fieldMeta}
				form={form}
				registry={registry}
			/>
		);
	}

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
