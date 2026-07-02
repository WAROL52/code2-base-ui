import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { FieldRegistry } from "../../src/registry/field-registry";
import type { FieldMeta } from "../../src/types";

describe("FieldRegistry", () => {
	let registry: FieldRegistry;
	const StringField = (props: { label?: string }) =>
		React.createElement("input", props);

	beforeEach(() => {
		registry = new FieldRegistry();
	});

	it("registers and resolves a component by type", () => {
		registry.register({ type: "string" }, StringField);
		const result = registry.resolve({
			path: "name",
			type: "string",
			label: "Name",
		});
		expect(result).toBe(StringField);
	});

	it("resolves by format with higher priority", () => {
		registry.register({ type: "string" }, StringField, 0);
		registry.register({ type: "string", format: "email" }, StringField, 10);
		const field: FieldMeta = {
			path: "email",
			type: "string",
			format: "email",
			label: "Email",
		};
		expect(registry.resolve(field)).toBe(StringField);
	});

	it("throws when no match and no fallback", () => {
		expect(() => {
			registry.resolve({ path: "x", type: "unknown", label: "X" });
		}).toThrow("Aucun composant enregistré");
	});

	it("uses fallback when no match", () => {
		registry.setFallback(StringField);
		const result = registry.resolve({ path: "x", type: "unknown", label: "X" });
		expect(result).toBe(StringField);
	});

	it("clears all entries", () => {
		registry.register({ type: "string" }, StringField);
		registry.clear();
		expect(() =>
			registry.resolve({ path: "x", type: "string", label: "X" })
		).toThrow();
	});

	it("matches by widget", () => {
		registry.register({ widget: "textarea" }, StringField);
		const field: FieldMeta = {
			path: "bio",
			type: "string",
			uiWidget: "textarea",
			label: "Bio",
		};
		expect(registry.resolve(field)).toBe(StringField);
	});

	it("matches by kind with higher priority", () => {
		registry.register({ type: "string" }, StringField, 0);
		registry.register({ type: "string", kind: "enum" }, StringField, 10);
		const enumField: FieldMeta = {
			path: "choice",
			type: "string",
			kind: "enum",
			label: "Choice",
			enum: ["a", "b"],
		};
		expect(registry.resolve(enumField)).toBe(StringField);
	});

	it("falls back to registration without kind when no kind match", () => {
		registry.register({ type: "string" }, StringField);
		const enumField: FieldMeta = {
			path: "choice",
			type: "string",
			kind: "enum",
			label: "Choice",
			enum: ["a", "b"],
		};
		expect(registry.resolve(enumField)).toBe(StringField);
	});

	it("prefers kind match over fallback even at same priority", () => {
		registry.register({ type: "string" }, StringField, 0);
		registry.register({ type: "string", kind: "enum" }, StringField, 5);
		const enumField: FieldMeta = {
			path: "choice",
			type: "string",
			kind: "enum",
			label: "Choice",
			enum: ["a", "b"],
		};
		const result = registry.resolve(enumField);
		expect(result).toBe(StringField);
	});
});
