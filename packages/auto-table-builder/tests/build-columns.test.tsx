import {
	resolveSchema,
	traverseSchema,
} from "@code2-base-ui/json-schema-toolkit";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";
import { buildColumns } from "../src/build-columns";
import type { ColumnRegistry } from "../src/registry";

const TextCell: any = ({ value }: { value: unknown }) => (
	<span>{String(value)}</span>
);
const EmailCell: any = ({ value }: { value: unknown }) => (
	<a href={`mailto:${value}`}>{String(value)}</a>
);
const NumberCell: any = ({ value }: { value: unknown }) => (
	<div className="text-right">{Number(value)}</div>
);

const mockRegistry: ColumnRegistry = {
	resolve: (meta) => {
		if (meta.type === "string" && meta.format === "email") {
			return EmailCell;
		}
		if (meta.type === "number" || meta.type === "integer") {
			return NumberCell;
		}
		return TextCell;
	},
	register: () => undefined,
	setFallback: () => undefined,
};

describe("buildColumns", () => {
	it("should return ColumnDef[] for an object schema", () => {
		const schema = {
			type: "object",
			properties: {
				name: { type: "string" },
				email: { type: "string", format: "email" },
				age: { type: "number" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({ fields, registry: mockRegistry });

		expect(columns).toHaveLength(3);
		expect(columns[0]?.id).toBe("name");
	});

	it("should use name as id", () => {
		const schema = {
			type: "object",
			properties: {
				userEmail: { type: "string", title: "Email Address" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({ fields, registry: mockRegistry });

		expect(columns[0]?.id).toBe("userEmail");
	});

	it("should merge overrides by column id", () => {
		const schema = {
			type: "object",
			properties: {
				age: { type: "number" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({
			fields,
			registry: mockRegistry,
			overrides: {
				age: { enableSorting: false as const },
			},
		});

		const ageCol = columns.find((c) => c.id === "age");
		expect(ageCol).toBeDefined();
		// overrides merged (access via type assertion since ColumnDef is a union)
		expect((ageCol as unknown as Record<string, unknown>).enableSorting).toBe(
			false
		);
	});

	it("should return empty array for empty fields", () => {
		const columns = buildColumns({ fields: [], registry: mockRegistry });
		expect(columns).toHaveLength(0);
	});

	it("should handle fields with constraints", () => {
		const schema = {
			type: "object",
			properties: {
				score: { type: "integer", minimum: 0, maximum: 100 },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({ fields, registry: mockRegistry });

		expect(columns[0]?.id).toBe("score");
	});

	it("should not throw for unknown field types", () => {
		const schema = {
			type: "object",
			properties: {
				raw: { type: "null" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		expect(() =>
			buildColumns({ fields, registry: mockRegistry })
		).not.toThrow();
	});

	it("should resolve cell component from registry", () => {
		const schema = {
			type: "object",
			properties: {
				email: { type: "string", format: "email" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({ fields, registry: mockRegistry });

		const emailCol = columns[0];
		expect(emailCol?.cell).toBeDefined();
	});

	it("should accept prefix columns", () => {
		const prefixCol: ColumnDef<{ name: string }> = {
			id: "select",
			header: "Select",
			cell: () => null,
		};

		const schema = {
			type: "object",
			properties: {
				name: { type: "string" },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({
			fields,
			registry: mockRegistry,
			prefix: [prefixCol],
		});

		expect(columns).toHaveLength(2);
		expect(columns[0]?.id).toBe("select");
		expect(columns[1]?.id).toBe("name");
	});

	it("should filter out uiHidden fields", () => {
		const schema = {
			type: "object",
			properties: {
				name: { type: "string" },
				internal: { type: "string", "x-ui-hidden": true },
			},
		};

		const resolved = resolveSchema(schema);
		const fields = traverseSchema(resolved);
		const columns = buildColumns({ fields, registry: mockRegistry });

		expect(columns).toHaveLength(1);
		expect(columns[0]?.id).toBe("name");
	});
});
