import type {
	FieldController,
	FormAPI,
	FormStateAdapter,
} from "@code2-base-ui/auto-form";
import type { ValidationResult } from "@code2-base-ui/json-schema-toolkit";
import { useCallback, useState } from "react";

function createFormAPI(config: {
	defaultValues?: Record<string, unknown>;
	validate: (data: unknown) => ValidationResult;
}): FormAPI {
	const [values, setValues] = useState<Record<string, unknown>>(
		config.defaultValues ?? {}
	);
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
		[values, config.validate]
	);

	const reset = useCallback(() => {
		setValues(config.defaultValues ?? {});
		setErrors({});
		setDirty(false);
	}, [config.defaultValues]);

	return { values, errors, submit, reset, dirty, isSubmitting };
}

export const tanstackFormAdapter: FormStateAdapter = {
	name: "tanstack-form",
	useForm: (config) => createFormAPI(config),
	useField: (name: string): FieldController => {
		const [value, setValue] = useState();
		const [touched, setTouched] = useState(false);

		const onChange = useCallback(
			(newValue: unknown) => {
				setValue(newValue);
				setDirty(true);
			},
			[setValue]
		);

		const onBlur = useCallback(() => {
			setTouched(true);
		}, [setTouched]);

		return { value, onChange, onBlur, touched };
	},
};
