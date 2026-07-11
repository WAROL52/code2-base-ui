"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

import { Checkbox } from "@code2-base-ui/ui/components/checkbox";
import { DatePicker } from "@code2-base-ui/ui/components/date-picker";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@code2-base-ui/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupTextarea,
} from "@code2-base-ui/ui/components/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@code2-base-ui/ui/components/select";
import { Switch } from "@code2-base-ui/ui/components/switch";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toErrorString } from "../utils";

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
			<InputGroup>
				<InputGroupTextarea
					aria-invalid={!!error || undefined}
					disabled={disabled}
					id={id}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					value={(value as string) ?? ""}
				/>
			</InputGroup>
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
			<InputGroup>
				<InputGroupInput
					aria-invalid={!!error || undefined}
					disabled={disabled}
					id={id}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					type="text"
					value={(value as string) ?? ""}
				/>
			</InputGroup>
		</FieldWrapper>
	);
}

export function ShadcnPasswordField({
	className,
	disabled,
	error,
	id,
	label,
	onChange,
	placeholder,
	value,
}: FieldComponentProps) {
	const [show, setShow] = useState(false);
	return (
		<FieldWrapper
			className={className}
			error={error}
			htmlFor={id}
			label={label}
		>
			<InputGroup>
				<InputGroupInput
					aria-invalid={!!error || undefined}
					disabled={disabled}
					id={id}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					type={show ? "text" : "password"}
					value={(value as string) ?? ""}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						aria-label={
							show ? "Cacher le mot de passe" : "Afficher le mot de passe"
						}
						onClick={() => setShow((s) => !s)}
						size="icon-xs"
						type="button"
					>
						{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</FieldWrapper>
	);
}

export function ShadcnDateField({
	className,
	disabled: _disabled,
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
			<DatePicker
				date={value ? new Date(value as string) : undefined}
				onSelect={(d) => onChange?.(d?.toISOString().split("T")[0] ?? "")}
				placeholder={placeholder}
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
			<InputGroup>
				<InputGroupInput
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
			</InputGroup>
		</FieldWrapper>
	);
}

function BooleanFieldWrapper({
	children,
	className,
	error,
	id,
	label,
}: {
	children: React.ReactNode;
	className?: string;
	error?: string | { message: string; type?: string; path?: string[] };
	id?: string;
	label?: string;
}) {
	return (
		<Field
			className={className}
			data-invalid={!!error || undefined}
			orientation="vertical"
		>
			<FieldContent>
				<div className="flex items-center gap-2">
					{children}
					{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
				</div>
				<ErrorDisplay error={error} />
			</FieldContent>
		</Field>
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
		<BooleanFieldWrapper
			className={className}
			error={error}
			id={id}
			label={label}
		>
			<Switch
				checked={!!value}
				disabled={disabled}
				id={id}
				onCheckedChange={(v: boolean) => onChange?.(v)}
			/>
		</BooleanFieldWrapper>
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
		<BooleanFieldWrapper
			className={className}
			error={error}
			id={id}
			label={label}
		>
			<Checkbox
				checked={!!value}
				disabled={disabled}
				id={id}
				onCheckedChange={(v: boolean) => onChange?.(v)}
			/>
		</BooleanFieldWrapper>
	);
}
