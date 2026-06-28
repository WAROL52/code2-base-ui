import { useMemo, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  SchemaProviderFactory,
  FormStateAdapter,
  LayoutStrategy,
  AutoFormProps,
  FormAPI,
  FieldController,
} from "./types";
import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import { AutoFormProvider, useAutoFormContext, AutoFormContext, FieldProvider } from "./context";
import type { AutoFormContextValue } from "./context";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

interface CreateAutoFormConfig {
  provider: SchemaProviderFactory;
  form: FormStateAdapter;
  registry: FieldRegistry;
  layout?: LayoutStrategy;
}

interface AutoFormSystem {
  useForm: () => FormAPI;
  useField: (name: string) => FieldController;
  AutoForm: <TSchema>(props: AutoFormProps<TSchema> & { children?: ReactNode }) => ReactNode;
  AutoField: (props: { name: string }) => ReactNode;
  AutoFormProvider: typeof AutoFormProvider;
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
    if (!ctx) throw new Error("useForm must be used within an AutoForm");
    return ctx.form;
  }

  function useField(name: string): FieldController {
    const ctx = useContext(AutoFormContext);
    if (!ctx) throw new Error("useField must be used within an AutoForm");
    const field = ctx.fields[name];
    if (!field) throw new Error(`Field "${name}" not found`);
    return field;
  }

  function AutoForm<TSchema>(
    props: AutoFormProps<TSchema> & { children?: ReactNode },
  ): ReactNode {
    const { schema, onSubmit, defaultValues, children, className } = props;

    const provider = useMemo(
      () => providerFactory.create(schema),
      [schema],
    );

    const form = formAdapter.useForm({
      defaultValues,
      validate: (data) => provider.validate(data),
    });

    const fields = useMemo(() => {
      const result: Record<string, FieldController> = {};
      for (const field of provider.fields) {
        result[field.path] = formAdapter.useField(field.path);
      }
      return result;
    }, [provider, formAdapter]);

    const handleSubmit = useCallback(
      (e: { preventDefault: () => void }) => {
        form.submit(e);
        if (onSubmit && Object.keys(form.errors).length === 0) {
          onSubmit(form.values);
        }
      },
      [form, onSubmit],
    );

    const contextValue: AutoFormContextValue = { form, schema: provider, registry, fields };

    return (
      <AutoFormContext.Provider value={contextValue}>
        <form onSubmit={handleSubmit} className={className}>
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
    if (!ctx) throw new Error("AutoField must be within an AutoForm");

    const fieldMeta = ctx.schema.getFieldMeta(name);
    if (!fieldMeta) throw new Error(`Field "${name}" not found in schema`);

    const Component = ctx.registry.resolve(fieldMeta) as React.ComponentType<
      Record<string, unknown>
    >;
    const field = ctx.fields[name];

    if (!field || !Component) return null;

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
