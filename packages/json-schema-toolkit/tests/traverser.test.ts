import { describe, expect, it } from "vitest";
import { resolveSchema } from "../src/resolver";
import { getFieldMeta, traverseSchema } from "../src/traverser";

describe("traverseSchema — object", () => {
	it("traverses simple object properties", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: {
				name: { type: "string", title: "Name" },
				age: { type: "number", title: "Age" },
			},
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(2);
		expect(fields[0]?.path).toBe("name");
		expect(fields[0]?.kind).toBe("primitive");
		expect(fields[1]?.path).toBe("age");
		expect(fields[1]?.kind).toBe("primitive");
	});

	it("includes required fields", () => {
		const resolved = resolveSchema({
			type: "object",
			required: ["name"],
			properties: {
				name: { type: "string" },
				age: { type: "number" },
			},
		});
		const fields = traverseSchema(resolved);
		const name = fields.find((f) => f.path === "name");
		const age = fields.find((f) => f.path === "age");
		expect(name?.required).toBe(true);
		expect(age?.required).toBe(false);
	});
});

describe("traverseSchema — union / oneOf", () => {
	it("BUG FIX: oneOf with object variants creates VariantField entries", () => {
		const resolved = resolveSchema({
			oneOf: [
				{
					type: "object",
					title: "Human",
					properties: { name: { type: "string" } },
				},
				{
					type: "object",
					title: "Robot",
					properties: { model: { type: "string" } },
				},
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		const union = fields[0];
		expect(union?.kind).toBe("union");
		expect(union?.variants).toBeDefined();
		expect(union?.variants).toHaveLength(2);

		const v0 = union?.variants?.[0];
		expect(v0?.label).toBe("Human");
		expect(v0?.children).toHaveLength(1);
		expect(v0?.children[0]?.path).toBe("name");
		expect(v0?.meta.kind).toBe("object");

		const v1 = union?.variants?.[1];
		expect(v1?.label).toBe("Robot");
		expect(v1?.children).toHaveLength(1);
		expect(v1?.children[0]?.path).toBe("model");
	});

	it("BUG FIX: oneOf with scalar variants keeps variant meta", () => {
		const resolved = resolveSchema({
			oneOf: [
				{ type: "string", title: "Text", maxLength: 100 },
				{ type: "number", title: "Number", minimum: 0 },
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		const union = fields[0];
		expect(union?.kind).toBe("union");
		expect(union?.variants).toHaveLength(2);

		const v0 = union?.variants?.[0];
		expect(v0?.label).toBe("Text");
		expect(v0?.meta.kind).toBe("primitive");
		expect(v0?.meta.type).toBe("string");
		expect(v0?.children).toEqual([]);

		const v1 = union?.variants?.[1];
		expect(v1?.label).toBe("Number");
		expect(v1?.meta.kind).toBe("primitive");
		expect(v1?.meta.type).toBe("number");
		expect(v1?.children).toEqual([]);
	});

	it("BUG FIX: oneOf with mixed object + scalar variants", () => {
		const resolved = resolveSchema({
			oneOf: [
				{
					type: "object",
					title: "Address",
					properties: { street: { type: "string" } },
				},
				{ type: "string", title: "Note" },
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		const union = fields[0];
		expect(union?.kind).toBe("union");
		expect(union?.variants).toHaveLength(2);

		// Object variant: has children
		const objectVar = union?.variants?.[0];
		expect(objectVar?.label).toBe("Address");
		expect(objectVar?.meta.kind).toBe("object");
		expect(objectVar?.children).toHaveLength(1);

		// Scalar variant: has meta but no children
		const scalarVar = union?.variants?.[1];
		expect(scalarVar?.label).toBe("Note");
		expect(scalarVar?.meta.kind).toBe("primitive");
		expect(scalarVar?.meta.type).toBe("string");
		expect(scalarVar?.children).toEqual([]);
	});

	it("detects discriminant key for oneOf", () => {
		const resolved = resolveSchema({
			discriminator: { propertyName: "kind" },
			oneOf: [
				{
					type: "object",
					properties: { kind: { const: "cat" }, name: { type: "string" } },
				},
				{
					type: "object",
					properties: { kind: { const: "dog" }, breed: { type: "string" } },
				},
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields[0]?.discriminantKey).toBe("kind");
	});

	it("handles union as root schema", () => {
		const resolved = resolveSchema({
			oneOf: [
				{ type: "string", title: "Name" },
				{ type: "number", title: "ID" },
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		expect(fields[0]?.kind).toBe("union");
	});
});

describe("traverseSchema — anyOf", () => {
	it("handles anyOf with object variants", () => {
		const resolved = resolveSchema({
			anyOf: [
				{
					type: "object",
					title: "Full",
					properties: { a: { type: "string" } },
				},
				{
					type: "object",
					title: "Partial",
					properties: { b: { type: "string" } },
				},
			],
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		expect(fields[0]?.kind).toBe("union");
		expect(fields[0]?.variants).toHaveLength(2);
	});
});

describe("traverseSchema — array", () => {
	it("handles array with items", () => {
		const resolved = resolveSchema({
			type: "array",
			items: { type: "string" },
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		expect(fields[0]?.kind).toBe("array");
		expect(fields[0]?.itemMeta).toBeDefined();
		expect(fields[0]?.itemMeta?.type).toBe("string");
	});

	it("handles array with prefixItems", () => {
		const resolved = resolveSchema({
			type: "array",
			prefixItems: [{ type: "string" }, { type: "number" }],
		});
		const fields = traverseSchema(resolved);
		expect(fields[0]?.kind).toBe("array");
		expect(fields[0]?.itemMeta).toBeDefined();
	});

	it("handles array without items", () => {
		const resolved = resolveSchema({ type: "array" });
		const fields = traverseSchema(resolved);
		expect(fields[0]?.kind).toBe("array");
		expect(fields[0]?.itemMeta).toBeUndefined();
	});
});

describe("traverseSchema — object nesting", () => {
	it("creates children for nested objects", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: {
				address: {
					type: "object",
					properties: {
						street: { type: "string" },
						city: { type: "string" },
					},
				},
			},
		});
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		const address = fields[0];
		expect(address?.kind).toBe("object");
		expect(address?.children).toHaveLength(2);
		expect(address?.children?.[0]?.path).toBe("address.street");
	});

	it("sorts children by uiOrder", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: {
				z: { type: "string", "x-ui-order": 2 },
				a: { type: "string", "x-ui-order": 1 },
			},
		});
		const fields = traverseSchema(resolved);
		expect(fields[0]?.path).toBe("a");
		expect(fields[1]?.path).toBe("z");
	});
});

describe("traverseSchema — primitive root", () => {
	it("handles root as primitive schema", () => {
		const resolved = resolveSchema({ type: "string", title: "Root" });
		const fields = traverseSchema(resolved);
		expect(fields).toHaveLength(1);
		expect(fields[0]?.kind).toBe("primitive");
	});
});

describe("getFieldMeta", () => {
	it("finds field by path in simple object", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: { name: { type: "string" } },
		});
		const field = getFieldMeta(resolved, "name");
		expect(field).not.toBeNull();
		expect(field?.path).toBe("name");
	});

	it("finds field by path in nested object", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: {
				addr: {
					type: "object",
					properties: { street: { type: "string" } },
				},
			},
		});
		const field = getFieldMeta(resolved, "addr.street");
		expect(field).not.toBeNull();
		expect(field?.path).toBe("addr.street");
	});

	it("finds field by path inside union variants", () => {
		const resolved = resolveSchema({
			oneOf: [
				{
					type: "object",
					properties: { name: { type: "string" } },
				},
				{
					type: "object",
					properties: { age: { type: "number" } },
				},
			],
		});
		const field = getFieldMeta(resolved, "name");
		expect(field).not.toBeNull();
		expect(field?.path).toBe("name");
	});

	it("returns null for non-existent path", () => {
		const resolved = resolveSchema({
			type: "object",
			properties: { name: { type: "string" } },
		});
		expect(getFieldMeta(resolved, "unknown")).toBeNull();
	});
});
