import { createContext, useContext, useState } from "react";
import type {
	FieldAPI,
	FieldError,
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./adapters/types";

interface MockCtxValue {
	getFieldValue: (name: string) => unknown;
	setFieldValue: (name: string, value: unknown) => void;
}

const MockCtx = createContext<MockCtxValue | null>(null);

interface ValidationCtxValue {
	errors: Record<string, FieldError | undefined>;
	touched: Record<string, boolean>;
}

const ValidationCtx = createContext<ValidationCtxValue | null>(null);

export function createMockAdapterWithValidation(
	onValidate: (
		values: Record<string, unknown>
	) => Record<string, FieldError | undefined>
): FormAdapter {
	return {
		name: "mock-validated",

		FormProvider({
			defaultValues = {},
			onSubmit,
			children,
		}: FormProviderProps) {
			const [values, setValues] =
				useState<Record<string, unknown>>(defaultValues);
			const [errors, setErrors] = useState<
				Record<string, FieldError | undefined>
			>({});
			const [touched, setTouched] = useState<Record<string, boolean>>({});

			const ctx: MockCtxValue = {
				getFieldValue: (name) => values[name],
				setFieldValue: (name, value) => {
					setValues((prev) => ({ ...prev, [name]: value }));
				},
			};

			const formAPI: FormAPI = {
				get values() {
					return values;
				},
				isSubmitting: false,
				handleSubmit: () => {
					const validationErrors = onValidate(values);
					const hasErrors = Object.values(validationErrors).some(
						(e) => e !== undefined
					);
					if (hasErrors) {
						setErrors(validationErrors);
						return;
					}
					setErrors({});
					onSubmit?.(values);
				},
				reset: () => {
					setValues(defaultValues);
					setErrors({});
					setTouched({});
				},
				appendFieldValue: (name, value) => {
					setValues((prev) => {
						const arr = (prev[name] as unknown[]) ?? [];
						return { ...prev, [name]: [...arr, value] };
					});
				},
				removeFieldValue: (name, index) => {
					setValues((prev) => {
						const arr = (prev[name] as unknown[]) ?? [];
						return {
							...prev,
							[name]: arr.filter((_, i) => i !== index),
						};
					});
				},
			};

			return (
				<ValidationCtx.Provider value={{ errors, touched }}>
					<MockCtx.Provider value={ctx}>{children(formAPI)}</MockCtx.Provider>
				</ValidationCtx.Provider>
			);
		},

		Field({ name, children }: FieldProps) {
			const ctx = useContext(MockCtx);
			const validationCtx = useContext(ValidationCtx);
			if (!ctx) {
				throw new Error("mockAdapter: missing FormProvider");
			}

			const error = validationCtx?.errors[name] ?? undefined;
			const isTouched = validationCtx?.touched[name] ?? false;

			return children({
				value: ctx.getFieldValue(name) as FieldAPI["value"],
				onChange: (val: unknown) => ctx.setFieldValue(name, val),
				onBlur: () => {
					/* noop */
				},
				error: error as FieldAPI["error"],
				isTouched,
			});
		},
	};
}

export const mockAdapter: FormAdapter = {
	name: "mock",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const [values, setValues] =
			useState<Record<string, unknown>>(defaultValues);

		const ctx: MockCtxValue = {
			getFieldValue: (name) => values[name],
			setFieldValue: (name, value) => {
				setValues((prev) => ({ ...prev, [name]: value }));
			},
		};

		const formAPI: FormAPI = {
			get values() {
				return values;
			},
			isSubmitting: false,
			handleSubmit: () => onSubmit?.(values),
			reset: () => setValues(defaultValues),
			appendFieldValue: (name, value) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return { ...prev, [name]: [...arr, value] };
				});
			},
			removeFieldValue: (name, index) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return {
						...prev,
						[name]: arr.filter((_, i) => i !== index),
					};
				});
			},
		};

		return <MockCtx.Provider value={ctx}>{children(formAPI)}</MockCtx.Provider>;
	},

	Field({ name, children }: FieldProps) {
		const ctx = useContext(MockCtx);
		if (!ctx) {
			throw new Error("mockAdapter: missing FormProvider");
		}

		return children({
			value: ctx.getFieldValue(name) as FieldAPI["value"],
			onChange: (val: unknown) => ctx.setFieldValue(name, val),
			onBlur: () => {
				/* noop */
			},
			error: undefined as FieldAPI["error"],
			isTouched: false,
		});
	},
};
