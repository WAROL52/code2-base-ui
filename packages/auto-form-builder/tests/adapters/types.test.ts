import type React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import type {
	FieldAPI,
	FieldError,
	FormAdapter,
	FormAPI,
} from "../../src/adapters/types";
import { toErrorString } from "../../src/adapters/types";

describe("FormAdapter types", () => {
	it("module can be loaded at runtime", async () => {
		await expect(import("../../src/adapters/types")).resolves.toBeDefined();
	});

	it("FieldAPI type shape", () => {
		expectTypeOf<FieldAPI["value"]>().toBeUnknown();
		expectTypeOf<FieldAPI["onChange"]>().toMatchTypeOf<
			(value: unknown) => void
		>();
		expectTypeOf<FieldAPI["onBlur"]>().toMatchTypeOf<() => void>();
		expectTypeOf<FieldAPI["error"]>().toMatchTypeOf<FieldError | undefined>();
		expectTypeOf<FieldAPI["isTouched"]>().toBeBoolean();
	});

	it("FormAPI type shape", () => {
		expectTypeOf<FormAPI["values"]>().toBeObject();
		expectTypeOf<FormAPI["isSubmitting"]>().toBeBoolean();
		expectTypeOf<FormAPI["handleSubmit"]>().toMatchTypeOf<() => void>();
		expectTypeOf<FormAPI["reset"]>().toMatchTypeOf<() => void>();
	});

	it("FormAdapter type shape", () => {
		expectTypeOf<FormAdapter["name"]>().toBeString();
	});
});

describe("FieldAPI runtime behavior", () => {
	it("accepts unknown value and calls onChange", () => {
		const handler = vi.fn();
		const field: FieldAPI = {
			value: "test",
			onChange: handler,
			onBlur: vi.fn(),
			error: undefined,
			isTouched: false,
		};
		field.onChange("new-value");
		expect(handler).toHaveBeenCalledWith("new-value");
	});

	it("onBlur is callable", () => {
		let blurred = false;
		const field: FieldAPI = {
			value: null,
			onChange: vi.fn(),
			onBlur: () => {
				blurred = true;
			},
			error: undefined,
			isTouched: false,
		};
		field.onBlur();
		expect(blurred).toBe(true);
	});

	it("error is optional", () => {
		const field1: FieldAPI = {
			value: null,
			onChange: vi.fn(),
			onBlur: vi.fn(),
			isTouched: false,
		};
		expect(field1.error).toBeUndefined();

		const field2: FieldAPI = {
			value: null,
			onChange: vi.fn(),
			onBlur: vi.fn(),
			error: "Required",
			isTouched: true,
		};
		expect(field2.error).toBe("Required");
	});

	it("accepts structured errors", () => {
		const field: FieldAPI = {
			value: null,
			onChange: vi.fn(),
			onBlur: vi.fn(),
			error: { message: "Required", type: "required", path: ["email"] },
			isTouched: true,
		};
		expect(typeof field.error).toBe("object");
		if (typeof field.error === "object") {
			expect(field.error?.message).toBe("Required");
		}
	});

	it("isTouched is boolean", () => {
		const field: FieldAPI = {
			value: null,
			onChange: vi.fn(),
			onBlur: vi.fn(),
			error: undefined,
			isTouched: true,
		};
		expect(field.isTouched).toBe(true);
	});
});

describe("FormAPI runtime behavior", () => {
	it("has required methods", () => {
		const form: FormAPI = {
			appendFieldValue: vi.fn(),
			handleSubmit: vi.fn(),
			isSubmitting: false,
			removeFieldValue: vi.fn(),
			reset: vi.fn(),
			values: {},
		};
		expect(typeof form.handleSubmit).toBe("function");
		expect(typeof form.reset).toBe("function");
		expect(typeof form.appendFieldValue).toBe("function");
		expect(typeof form.removeFieldValue).toBe("function");
		expect(form.isSubmitting).toBe(false);
	});
});

describe("toErrorString", () => {
	it("returns the message from a structured FieldError", () => {
		const result = toErrorString({ message: "Invalid email", type: "format" });
		expect(result).toBe("Invalid email");
	});

	it("returns undefined when error is undefined", () => {
		const result = toErrorString(undefined);
		expect(result).toBeUndefined();
	});

	it("returns the string when error is a string", () => {
		const result = toErrorString("Required");
		expect(result).toBe("Required");
	});
});

describe("FormAdapter runtime behavior", () => {
	it("has name, FormProvider and Field", () => {
		const adapter = {
			name: "test",
			FormProvider(
				this: void,
				_props: { children: (form: FormAPI) => React.ReactNode }
			) {
				return null;
			},
			Field(
				this: void,
				_props: { children: (field: FieldAPI) => React.ReactNode }
			) {
				return null;
			},
		} satisfies FormAdapter;
		expect(adapter.name).toBe("test");
		expect(typeof adapter.FormProvider).toBe("function");
		expect(typeof adapter.Field).toBe("function");
	});
});
