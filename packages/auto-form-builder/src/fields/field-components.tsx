"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

import { Checkbox } from "@code2-base-ui/ui/components/checkbox";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@code2-base-ui/ui/components/field";
import { Input } from "@code2-base-ui/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@code2-base-ui/ui/components/select";
import { Switch } from "@code2-base-ui/ui/components/switch";
import { Textarea } from "@code2-base-ui/ui/components/textarea";
import { toErrorString } from "../adapters/types";

export interface FieldComponentProps {
	className?: string;
	disabled?: boolean;
	error?: string | { message: string; type?: string; path?: string[] };
	field?: FieldMeta;
	id?: string;
	label?: string;
	onChange?: (value: unknown) => void;
	placeholder?: string;
	value?: unknown;
}

function ErrorDisplay({
	error,
}: {
	error?: string | { message: string; type?: string; path?: string[] };
}) {
	const msg = toErrorString(error);
	return msg ? <FieldError>{msg}</FieldError> : null;
}

function FieldWrapper({
	children,
	className,
	error,
	htmlFor,
	label,
}: {
	children: React.ReactNode;
	className?: string;
	error?: string | { message: string; type?: string; path?: string[] };
	htmlFor?: string;
	label?: string;
}) {
	return (
		<Field
			className={className}
			data-invalid={!!error || undefined}
			orientation="vertical"
		>
			{label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
			<FieldContent>
				{children}
				<ErrorDisplay error={error} />
			</FieldContent>
		</Field>
	);
}

export function ShadcnEnumField({
	className,
	disabled,
	error,
	field: _field,
	id,
	label,
	onChange,
	placeholder,
	value,
}: FieldComponentProps) {
	return (
		<FieldWrapper className={className} error={error} label={label}>
			<Select
				disabled={disabled}
				onValueChange={(v) => onChange?.(v)}
				value={(value as string) ?? ""}
			>
				<SelectTrigger id={id}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{_field?.enum?.map((opt) => (
						<SelectItem key={String(opt)} value={String(opt)}>
							{String(opt)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FieldWrapper>
	);
}

export function ShadcnTextareaField({
	className,
	disabled,
	error,
	field: _field,
	id,
	label,
	onChange,
	placeholder,
	value,
}: FieldComponentProps) {
	return (
		<FieldWrapper
			className={className}
			error={error}
			htmlFor={id}
			label={label}
		>
			<Textarea
				disabled={disabled}
				id={id}
				onChange={(e) => onChange?.(e.target.value)}
				placeholder={placeholder}
				value={(value as string) ?? ""}
			/>
		</FieldWrapper>
	);
}

export function ShadcnTextField({
	className,
	disabled,
	error,
	id,
	label,
	onChange,
	placeholder,
	value,
}: FieldComponentProps) {
	return (
		<FieldWrapper
			className={className}
			error={error}
			htmlFor={id}
			label={label}
		>
			<Input
				aria-invalid={!!error || undefined}
				disabled={disabled}
				id={id}
				onChange={(e) => onChange?.(e.target.value)}
				placeholder={placeholder}
				type="text"
				value={(value as string) ?? ""}
			/>
		</FieldWrapper>
	);
}

export function ShadcnNumberField({
	className,
	disabled,
	error,
	field: _field,
	id,
	label,
	onChange,
	placeholder,
	value,
}: FieldComponentProps) {
	return (
		<FieldWrapper
			className={className}
			error={error}
			htmlFor={id}
			label={label}
		>
			<Input
				aria-invalid={!!error || undefined}
				disabled={disabled}
				id={id}
				onChange={(e) => {
					const v = e.target.value;
					onChange?.(v === "" ? undefined : Number(v));
				}}
				placeholder={placeholder}
				type="number"
				value={(value as number | string) ?? ""}
			/>
		</FieldWrapper>
	);
}

export function ShadcnSwitchField({
	className,
	disabled,
	error,
	id,
	label,
	onChange,
	value,
}: FieldComponentProps) {
	return (
		<Field
			className={className}
			data-invalid={!!error || undefined}
			orientation="vertical"
		>
			<FieldContent>
				<div className="flex items-center gap-2">
					<Switch
						checked={!!value}
						disabled={disabled}
						id={id}
						onCheckedChange={(v: boolean) => onChange?.(v)}
					/>
					{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
				</div>
				<ErrorDisplay error={error} />
			</FieldContent>
		</Field>
	);
}

export function ShadcnBooleanField({
	className,
	disabled,
	error,
	id,
	label,
	onChange,
	value,
}: FieldComponentProps) {
	return (
		<Field
			className={className}
			data-invalid={!!error || undefined}
			orientation="vertical"
		>
			<FieldContent>
				<div className="flex items-center gap-2">
					<Checkbox
						checked={!!value}
						disabled={disabled}
						id={id}
						onCheckedChange={(v: boolean) => onChange?.(v)}
					/>
					{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
				</div>
				<ErrorDisplay error={error} />
			</FieldContent>
		</Field>
	);
}
