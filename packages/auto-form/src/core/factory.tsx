import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import { useCallback, useContext, useMemo } from "react";
import type { AutoFormContextValue } from "./context";
import {
	AutoFormContext,
	AutoFormProvider,
	FieldProvider,
	useAutoFormContext,
} from "./context";
import type {
	AutoFormProps,
	FieldController,
	FormAPI,
	FormStateAdapter,
	LayoutStrategy,
	SchemaProviderFactory,
} from "./types";

interface CreateAutoFormConfig {
	form: FormStateAdapter;
	layout?: LayoutStrategy;
	provider: SchemaProviderFactory;
	registry: FieldRegistry;
}

interface AutoFormSystem {
	AutoField: (props: { name: string }) => ReactNode;
	AutoForm: <TSchema>(
		props: AutoFormProps<TSchema> & { children?: ReactNode }
	) => ReactNode;
	AutoFormProvider: typeof AutoFormProvider;
	useField: (name: string) => FieldController;
	useForm: () => FormAPI;
}

const defaultLayout: LayoutStrategy = {
	name: "default",
	render(fields: FieldMeta[], renderField: (field: FieldMeta) => ReactNode) {
		return <>{fields.map((field) => renderField(field))}</>;
	},
};

export function createAutoForm(config: CreateAutoFormConfig): AutoFormSystem {
	const {
		provider: providerFactory,
		form: formAdapter,
		registry,
		layout: layoutStrategy = defaultLayout,
	} = config;

	function useForm(): FormAPI {
		const ctx = useContext(AutoFormContext);
		if (!ctx) {
			throw new Error("useForm must be used within an AutoForm");
		}
		return ctx.form;
	}

	function useField(name: string): FieldController {
		const ctx = useContext(AutoFormContext);
		if (!ctx) {
			throw new Error("useField must be used within an AutoForm");
		}
		const field = ctx.fields[name];
		if (!field) {
			throw new Error(`Field "${name}" not found`);
		}
		return field;
	}

	function AutoForm<TSchema>(
		props: AutoFormProps<TSchema> & { children?: ReactNode }
	): ReactNode {
		const { schema, onSubmit, defaultValues, children, className } = props;

		const provider = useMemo(() => providerFactory.create(schema), [schema]);

		const form = formAdapter.useForm({
			defaultValues,
			validate: (data) => provider.validate(data),
		});

		const fields = (() => {
			const result: Record<string, FieldController> = {};
			for (const field of provider.fields) {
				result[field.path] = formAdapter.useField(field.path);
			}
			return result;
		})();

		const handleSubmit = useCallback(
			(e: { preventDefault: () => void }) => {
				form.submit(e);
				if (onSubmit && Object.keys(form.errors).length === 0) {
					onSubmit(form.values);
				}
			},
			[form, onSubmit]
		);

		const contextValue: AutoFormContextValue = {
			form,
			schema: provider,
			registry,
			fields,
		};

		return (
			<AutoFormContext.Provider value={contextValue}>
				<form className={className} onSubmit={handleSubmit}>
					{children ??
						layoutStrategy.render(provider.fields, (field) => (
							<AutoField key={field.path} name={field.path} />
						))}
				</form>
			</AutoFormContext.Provider>
		);
	}

	function AutoField({ name }: { name: string }): ReactNode {
		const ctx = useAutoFormContext();
		if (!ctx) {
			throw new Error("AutoField must be within an AutoForm");
		}

		const fieldMeta = ctx.schema.getFieldMeta(name);
		if (!fieldMeta) {
			throw new Error(`Field "${name}" not found in schema`);
		}

		const Component = ctx.registry.resolve(fieldMeta) as React.ComponentType<
			Record<string, unknown>
		>;
		const field = ctx.fields[name];

		if (!(field && Component)) {
			return null;
		}

		return (
			<FieldProvider field={field}>
				<Component {...fieldMeta} />
			</FieldProvider>
		);
	}

	return {
		useForm,
		useField,
		AutoForm,
		AutoField,
		AutoFormProvider,
	};
}
