// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const REGISTRY_PATH = resolve(import.meta.dirname, "../../../registry.json");

interface RegistryFileEntry {
	path: string;
	target?: string;
	type: string;
}

interface RegistryItem {
	dependencies?: string[];
	description: string;
	files: RegistryFileEntry[];
	name: string;
	registryDependencies?: string[];
	title: string;
	type: string;
}

interface Registry {
	$schema?: string;
	items: RegistryItem[];
}

describe("registry.json — auto-form-builder entry", () => {
	let registry: Registry;
	let item: RegistryItem;

	beforeAll(() => {
		registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8")) as Registry;
		const found = registry.items.find((i) => i.name === "auto-form-builder");
		expect(
			found,
			"auto-form-builder entry must exist in registry.json"
		).toBeDefined();
		item = found as RegistryItem;
	});

	it("has correct type", () => {
		expect(item.type).toBe("registry:item");
	});

	it("has a title", () => {
		expect(item.title).toBeDefined();
		expect(item.title.length).toBeGreaterThan(0);
	});

	it("has a description", () => {
		expect(item.description).toBeDefined();
		expect(item.description.length).toBeGreaterThan(0);
	});

	it("has dependencies for form libraries", () => {
		expect(item.dependencies).toBeDefined();
		expect(item.dependencies).toContain("react");
		expect(item.dependencies).toContain("@tanstack/react-form");
		expect(item.dependencies).toContain("react-hook-form");
		expect(item.dependencies).toContain("@formisch/react");
		expect(item.dependencies).toContain("lucide-react");
	});

	it("has registryDependencies for UI components and toolkit", () => {
		expect(item.registryDependencies).toBeDefined();
		expect(item.registryDependencies?.length).toBeGreaterThanOrEqual(6);

		const expectedDeps = [
			"WAROL52/code2-base-ui/json-schema-toolkit",
			"WAROL52/code2-base-ui/ui-checkbox",
			"WAROL52/code2-base-ui/ui-date-picker",
			"WAROL52/code2-base-ui/ui-field",
			"WAROL52/code2-base-ui/ui-input-group",
			"WAROL52/code2-base-ui/ui-select",
			"WAROL52/code2-base-ui/ui-switch",
		];

		for (const dep of expectedDeps) {
			expect(item.registryDependencies).toContain(dep);
		}
	});

	it("lists all required source files", () => {
		const expectedFiles = [
			"packages/auto-form-builder/src/index.ts",
			"packages/auto-form-builder/src/auto-form-builder.tsx",
			"packages/auto-form-builder/src/auto-form-field.tsx",
			"packages/auto-form-builder/src/create-auto-form.tsx",
			"packages/auto-form-builder/src/validate.ts",
			"packages/auto-form-builder/src/testing.tsx",
			"packages/auto-form-builder/src/adapters/index.ts",
			"packages/auto-form-builder/src/adapters/types.ts",
			"packages/auto-form-builder/src/adapters/tanstack.tsx",
			"packages/auto-form-builder/src/adapters/rhf.tsx",
			"packages/auto-form-builder/src/adapters/formisch.tsx",
			"packages/auto-form-builder/src/fields/index.ts",
			"packages/auto-form-builder/src/fields/field-components.tsx",
			"packages/auto-form-builder/src/layout/index.ts",
			"packages/auto-form-builder/src/layout/types.ts",
			"packages/auto-form-builder/src/layout/shadcn.tsx",
			"packages/auto-form-builder/src/layout/context.tsx",
		];

		const filePaths = item.files.map((f) => f.path);
		for (const expected of expectedFiles) {
			expect(filePaths).toContain(expected);
		}

		expect(item.files.length).toBe(expectedFiles.length);
	});

	it("each file has a target set", () => {
		for (const file of item.files) {
			expect(file.target, `File ${file.path} must have a target`).toBeDefined();
			expect(file.target?.startsWith("~/src/auto-form-builder/")).toBe(true);
		}
	});

	it("each file has a type", () => {
		for (const file of item.files) {
			expect(file.type).toBe("registry:lib");
		}
	});

	it("all file paths exist on disk", () => {
		for (const file of item.files) {
			const fullPath = resolve(import.meta.dirname, "../../../", file.path);
			expect(existsSync(fullPath), `File not found: ${file.path}`).toBe(true);
		}
	});

	it("has a valid JSON structure matching registry schema", () => {
		expect(registry.$schema).toBeDefined();
		expect(Array.isArray(registry.items)).toBe(true);
	});

	it("does not duplicate the same name", () => {
		const names = registry.items.map((i) => i.name);
		const uniqueNames = new Set(names);
		expect(names.length).toBe(uniqueNames.size);
	});
});

describe("registry.json — ui-input-group entry", () => {
	let registry: Registry;
	let item: RegistryItem;

	beforeAll(() => {
		registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8")) as Registry;
		const found = registry.items.find((i) => i.name === "ui-input-group");
		expect(
			found,
			"ui-input-group entry must exist in registry.json"
		).toBeDefined();
		item = found as RegistryItem;
	});

	it("has correct type", () => {
		expect(item.type).toBe("registry:ui");
	});

	it("has registryDependencies for button, input, textarea", () => {
		expect(item.registryDependencies).toContain(
			"WAROL52/code2-base-ui/ui-button"
		);
		expect(item.registryDependencies).toContain(
			"WAROL52/code2-base-ui/ui-input"
		);
		expect(item.registryDependencies).toContain(
			"WAROL52/code2-base-ui/ui-textarea"
		);
	});

	it("references existent file path", () => {
		const fullPath = resolve(
			import.meta.dirname,
			"../../../",
			"packages/ui/src/components/input-group.tsx"
		);
		expect(existsSync(fullPath), "input-group.tsx must exist").toBe(true);
	});
});
