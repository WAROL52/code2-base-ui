import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";

import {
	ShadcnBooleanField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnTextareaField,
	ShadcnTextField,
} from "./field-components";

export type { FieldComponentProps } from "./field-components";
export {
	ShadcnBooleanField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnTextareaField,
	ShadcnTextField,
} from "./field-components";

export function createShadcnRegistry(): FieldRegistry {
	const registry = new FieldRegistry();

	registry.register({ type: "string", kind: "enum" }, ShadcnEnumField, 20);
	registry.register(
		{ type: "string", widget: "textarea" },
		ShadcnTextareaField,
		10
	);
	registry.register({ type: "string", kind: "primitive" }, ShadcnTextField, 0);
	registry.register({ type: "number" }, ShadcnNumberField, 0);
	registry.register({ type: "integer" }, ShadcnNumberField, 0);
	registry.register({ type: "boolean" }, ShadcnBooleanField, 0);

	registry.setFallback(ShadcnTextField);

	return registry;
}
