import { createAutoForm } from "@code2-base-ui/auto-form";
import { zodProvider } from "@code2-base-ui/auto-form-provider-zod";
import { tanstackFormAdapter } from "@code2-base-ui/auto-form-adapter-tanstack";
import { createShadcnRegistry } from "@code2-base-ui/auto-form-render-shadcn";

const { AutoForm, AutoField, useForm, useField, AutoFormProvider } = createAutoForm({
  provider: zodProvider,
  form: tanstackFormAdapter,
  registry: createShadcnRegistry(),
});

export { createAutoForm, AutoForm, AutoField, useForm, useField, AutoFormProvider };
