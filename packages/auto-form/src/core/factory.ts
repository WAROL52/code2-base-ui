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
import { AutoFormProvider } from "./context";

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

export function createAutoForm(config: CreateAutoFormConfig): AutoFormSystem {
  const { provider: _providerFactory, form: _formAdapter, registry: _registry, layout: _layout } = config;

  function useForm(): FormAPI {
    throw new Error("useForm must be used within an AutoFormProvider");
  }

  function useField(_name: string): FieldController {
    throw new Error("useField must be used within an AutoFormProvider");
  }

  function AutoForm<TSchema>(_props: AutoFormProps<TSchema> & { children?: ReactNode }): ReactNode {
    throw new Error("AutoForm not implemented yet");
  }

  function AutoField(_props: { name: string }): ReactNode {
    throw new Error("AutoField not implemented yet");
  }

  return {
    useForm,
    useField,
    AutoForm,
    AutoField,
    AutoFormProvider,
  };
}
