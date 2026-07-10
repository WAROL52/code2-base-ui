import type { FieldError } from "./adapters/types";

export function toErrorString(error?: FieldError): string | undefined {
	if (!error) {
		return;
	}
	if (typeof error === "string") {
		return error;
	}
	return error.message;
}
