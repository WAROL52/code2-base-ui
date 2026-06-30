"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { FormAdapter } from "./adapters/types";
import { useFormLayout } from "./layout/context";

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	registry: FieldRegistry;
}

export function AutoFormField({
	fieldMeta,
	adapter,
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
						key={child.path}
						registry={registry}
					/>
				))}
			</layout.ObjectField>
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
