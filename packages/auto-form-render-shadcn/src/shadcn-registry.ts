import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit/registry";

const PlaceholderField = () => null;
const PlaceholderCheckbox = () => null;

export function createShadcnRegistry(): FieldRegistry {
  const registry = new FieldRegistry();

  registry.register({ type: "string" }, PlaceholderField);
  registry.register({ type: "string", format: "email" }, PlaceholderField);
  registry.register({ type: "string", format: "url" }, PlaceholderField);
  registry.register({ type: "string", format: "tel" }, PlaceholderField);
  registry.register({ type: "string", format: "password" }, PlaceholderField);
  registry.register({ type: "string", widget: "textarea" }, PlaceholderField);
  registry.register({ type: "string", widget: "select" }, PlaceholderField);
  registry.register({ type: "string", widget: "radio" }, PlaceholderField);
  registry.register({ type: "string", widget: "otp" }, PlaceholderField);
  registry.register({ type: "string", format: "date" }, PlaceholderField);
  registry.register({ type: "string", format: "date-time" }, PlaceholderField);
  registry.register({ type: "number" }, PlaceholderField);
  registry.register({ type: "number", widget: "select" }, PlaceholderField);
  registry.register({ type: "number", widget: "slider" }, PlaceholderField);
  registry.register({ type: "boolean" }, PlaceholderCheckbox);
  registry.register({ type: "boolean", widget: "switch" }, PlaceholderCheckbox);
  registry.register({ type: "object", widget: "collapse" }, PlaceholderField);

  return registry;
}
