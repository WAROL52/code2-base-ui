"use client";

import {
	ShadcnBooleanField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnPasswordField,
	ShadcnSwitchField,
	ShadcnTextareaField,
	ShadcnTextField,
} from "@code2-base-ui/auto-form-builder/fields";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@code2-base-ui/ui/components/field";
import { useState } from "react";

function StateWrapper({
	children,
	label,
	initialValue,
}: {
	children: (props: {
		value: unknown;
		onChange: (v: unknown) => void;
		error?: string;
	}) => React.ReactNode;
	label: string;
	initialValue?: unknown;
}) {
	const [value, setValue] = useState(initialValue ?? "");
	return (
		<div className="space-y-2">
			<p className="font-medium text-muted-foreground text-xs">{label}</p>
			{children({ value, onChange: (v) => setValue(v as string) })}
		</div>
	);
}

function DemoField({
	Component,
	fieldMeta,
	label,
	initialValue,
}: {
	Component: React.ComponentType<Record<string, unknown>>;
	fieldMeta: Partial<FieldMeta>;
	label: string;
	initialValue?: unknown;
}) {
	return (
		<StateWrapper initialValue={initialValue} label={label}>
			{({ error, onChange, value }) => (
				<Field className="w-80" orientation="vertical">
					{fieldMeta.label && <FieldLabel>{fieldMeta.label}</FieldLabel>}
					<FieldContent>
						<Component
							error={error}
							field={fieldMeta as FieldMeta}
							id="demo"
							label={fieldMeta.label}
							onChange={onChange}
							value={value}
						/>
						{error && <FieldError>{error}</FieldError>}
					</FieldContent>
				</Field>
			)}
		</StateWrapper>
	);
}

const baseField = (overrides: Partial<FieldMeta>): FieldMeta => ({
	kind: "primitive",
	label: "Champ",
	path: "demo",
	type: "string",
	...overrides,
});

export function InputStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnTextField}
			fieldMeta={baseField({ label: "Nom" })}
			initialValue="Jean Dupont"
			label="TextField"
		/>
	);
}

export function PasswordStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnPasswordField}
			fieldMeta={baseField({ label: "Mot de passe" })}
			label="PasswordField"
		/>
	);
}

export function TextareaStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnTextareaField}
			fieldMeta={baseField({ label: "Bio", uiWidget: "textarea" })}
			label="TextareaField"
		/>
	);
}

export function NumberStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnNumberField}
			fieldMeta={{ ...baseField({ label: "Âge" }), type: "integer" }}
			initialValue={25}
			label="NumberField"
		/>
	);
}

export function EnumStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnEnumField}
			fieldMeta={{
				kind: "enum",
				label: "Rôle",
				path: "demo",
				type: "string",
				enum: ["admin", "user", "guest"],
			}}
			label="EnumField"
		/>
	);
}

export function BooleanStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnBooleanField}
			fieldMeta={{ ...baseField({ label: "Actif" }), type: "boolean" }}
			initialValue={true}
			label="BooleanField"
		/>
	);
}

export function SwitchStory(): React.ReactNode {
	return (
		<DemoField
			Component={ShadcnSwitchField}
			fieldMeta={{
				...baseField({ label: "Notifications" }),
				type: "boolean",
				uiWidget: "switch",
			}}
			initialValue={false}
			label="SwitchField"
		/>
	);
}

export function FieldComponentsDemo(): React.ReactNode {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<InputStory />
			<PasswordStory />
			<TextareaStory />
			<NumberStory />
			<EnumStory />
			<BooleanStory />
			<SwitchStory />
		</div>
	);
}
