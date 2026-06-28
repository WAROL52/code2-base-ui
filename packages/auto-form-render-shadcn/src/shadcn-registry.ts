import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit/registry";
import {
  InputField,
  CheckboxField,
  SelectField,
  TextareaField,
  SwitchField,
  RadioGroupField,
  SliderField,
  DatePickerField,
  OtpField,
  FieldGroup,
  ArrayField,
} from "./components";

export function createShadcnRegistry(): FieldRegistry {
  const registry = new FieldRegistry();

  registry.register({ type: "string" }, InputField);
  registry.register({ type: "string", format: "email" }, InputField);
  registry.register({ type: "string", format: "url" }, InputField);
  registry.register({ type: "string", format: "tel" }, InputField);
  registry.register({ type: "string", format: "password" }, InputField);
  registry.register({ type: "string", widget: "textarea" }, TextareaField);
  registry.register({ type: "string", widget: "select" }, SelectField);
  registry.register({ type: "string", widget: "radio" }, RadioGroupField);
  registry.register({ type: "string", widget: "otp" }, OtpField);
  registry.register({ type: "string", format: "date" }, DatePickerField);
  registry.register({ type: "string", format: "date-time" }, DatePickerField);
  registry.register({ type: "number" }, InputField);
  registry.register({ type: "number", widget: "select" }, SelectField);
  registry.register({ type: "number", widget: "slider" }, SliderField);
  registry.register({ type: "boolean" }, CheckboxField);
  registry.register({ type: "boolean", widget: "switch" }, SwitchField);
  registry.register({ type: "object", widget: "collapse" }, FieldGroup);
  registry.register({ type: "array" }, ArrayField);

  return registry;
}
