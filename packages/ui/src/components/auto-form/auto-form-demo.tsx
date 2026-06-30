"use client";
import { createAutoForm } from "@code2-base-ui/auto-form";
import { zodProvider } from "@code2-base-ui/auto-form-provider-zod";
import { createShadcnRegistry } from "@code2-base-ui/auto-form-render-shadcn";
import { useCallback, useState } from "react";
import { z } from "zod";

const tanstackFormAdapter = {
	name: "tanstack-form",
	useForm: (config: { defaultValues?: Record<string, unknown>; validate: (data: unknown) => { success: boolean; errors: { path: string; message: string }[] } }) => {
		const [values, setValues] = useState(config.defaultValues ?? {});
		const [errors, setErrors] = useState<Record<string, string | undefined>>({});
		const [dirty, setDirty] = useState(false);
		const [isSubmitting, setIsSubmitting] = useState(false);
		const submit = useCallback(
			(e: { preventDefault: () => void }) => {
				e.preventDefault();
				setIsSubmitting(true);
				const result = config.validate(values);
				if (result.success) {
					setErrors({});
				} else {
					setErrors(
						Object.fromEntries(
							result.errors.map((err) => [err.path, err.message])
						)
					);
				}
				setIsSubmitting(false);
			},
			[values, config]
		);
		const reset = useCallback(() => {
			setValues(config.defaultValues ?? {});
			setErrors({});
			setDirty(false);
		}, [config.defaultValues]);
		return { values, errors, submit, reset, dirty, isSubmitting };
	},
	useField: () => {
		const [value, setValue] = useState<unknown>();
		const [touched, setTouched] = useState(false);
		const onChange = useCallback((newValue: unknown) => {
			setValue(newValue);
		}, []);
		const onBlur = useCallback(() => setTouched(true), []);
		return { value, onChange, onBlur, touched };
	},
};

const { AutoForm } = createAutoForm({
	provider: zodProvider,
	form: tanstackFormAdapter,
	registry: createShadcnRegistry(),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(100),
});

export default function AutoFormDemo() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="font-bold text-2xl">Auto Form Demo</h1>
			<p className="text-gray-600">
				This page demonstrates the auto form generation based on a schema.
			</p>
			<AutoForm schema={loginSchema} />
		</div>
	);
}
