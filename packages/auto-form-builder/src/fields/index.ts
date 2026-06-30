import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";

import {
	ShadcnBooleanField,
	ShadcnInputField,
	ShadcnNumberField,
} from "./field-components";

export type { FieldComponentProps } from "./field-components";
export {
	ShadcnBooleanField,
	ShadcnInputField,
	ShadcnNumberField,
} from "./field-components";

export function createShadcnRegistry(): FieldRegistry {
	const registry = new FieldRegistry();

	registry.register({ type: "string" }, ShadcnInputField, 0);
	registry.register({ type: "number" }, ShadcnNumberField, 0);
	registry.register({ type: "integer" }, ShadcnNumberField, 0);
	registry.register({ type: "boolean" }, ShadcnBooleanField, 0);

	registry.setFallback(ShadcnInputField);

	return registry;
}
