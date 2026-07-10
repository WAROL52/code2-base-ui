import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";

import {
	ShadcnBooleanField,
	ShadcnDateField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnPasswordField,
	ShadcnSwitchField,
	ShadcnTextareaField,
	ShadcnTextField,
} from "./field-components";

export type { FieldComponentProps } from "./field-components";
export {
	ShadcnBooleanField,
	ShadcnDateField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnPasswordField,
	ShadcnSwitchField,
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
	registry.register(
		{ type: "boolean", widget: "switch" },
		ShadcnSwitchField,
		10
	);
	registry.register(
		{ type: "string", widget: "password" },
		ShadcnPasswordField,
		10
	);
	registry.register({ type: "string", format: "date" }, ShadcnDateField, 10);
	registry.register({ type: "string", kind: "primitive" }, ShadcnTextField, 0);
	registry.register({ type: "number" }, ShadcnNumberField, 0);
	registry.register({ type: "integer" }, ShadcnNumberField, 0);
	registry.register(
		{ type: "boolean", kind: "primitive" },
		ShadcnBooleanField,
		0
	);

	registry.setFallback(ShadcnTextField);

	return registry;
}
