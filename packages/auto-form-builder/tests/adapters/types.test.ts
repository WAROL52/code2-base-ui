import { describe, it, expect, expectTypeOf } from "vitest";
import type { FieldAPI, FormAPI, FormAdapter } from "../../src/adapters/types";

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
		expectTypeOf<FieldAPI["error"]>().toMatchTypeOf<string | undefined>();
		expectTypeOf<FieldAPI["isTouched"]>().toBeBoolean();
	});

	it("FormAPI type shape", () => {
		expectTypeOf<FormAPI["values"]>().toBeObject();
		expectTypeOf<FormAPI["errors"]>().toBeObject();
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
			onBlur: () => {},
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
			onChange: () => {},
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
			onChange: () => {},
			onBlur: () => {},
			isTouched: false,
		};
		expect(field1.error).toBeUndefined();

		const field2: FieldAPI = {
			value: null,
			onChange: () => {},
			onBlur: () => {},
			error: "Required",
			isTouched: true,
		};
		expect(field2.error).toBe("Required");
	});

	it("isTouched is boolean", () => {
		const field: FieldAPI = {
			value: null,
			onChange: () => {},
			onBlur: () => {},
			error: undefined,
			isTouched: true,
		};
		expect(field.isTouched).toBe(true);
	});
});

describe("FormAPI runtime behavior", () => {
	it("has required methods", () => {
		const form: FormAPI = {
			values: {},
			errors: {},
			isSubmitting: false,
			handleSubmit: () => {},
			reset: () => {},
		};
		expect(typeof form.handleSubmit).toBe("function");
		expect(typeof form.reset).toBe("function");
		expect(form.isSubmitting).toBe(false);
	});
});

describe("FormAdapter runtime behavior", () => {
	it("has name, FormProvider and Field", () => {
		const adapter: FormAdapter = {
			name: "test",
			FormProvider: (({ children }: any) =>
				children({} as FormAPI)) as FormAdapter["FormProvider"],
			Field: (({ children }: any) =>
				children({} as FieldAPI)) as FormAdapter["Field"],
		};
		expect(adapter.name).toBe("test");
		expect(typeof adapter.FormProvider).toBe("function");
		expect(typeof adapter.Field).toBe("function");
	});
});
