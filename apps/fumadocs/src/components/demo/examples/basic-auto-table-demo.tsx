"use client";

import {
	AutoTable,
	createColumnRegistry,
} from "@code2-base-ui/auto-table-builder";
import {
	CellBadge,
	CellBoolean,
	CellEmail,
	CellNumber,
	CellText,
} from "@code2-base-ui/auto-table-builder/cell-components";

const registry = createColumnRegistry();
registry.register({ type: "string" }, CellText);
registry.register({ type: "string", format: "email" }, CellEmail);
registry.register({ type: "integer" }, CellNumber);
registry.register({ type: "boolean" }, CellBoolean);
registry.register({ type: "string", format: "badge" }, CellBadge);
registry.setFallback(CellText);

const schema = {
	type: "object",
	properties: {
		name: { type: "string", title: "Name" },
		email: { type: "string", format: "email", title: "Email" },
		role: { type: "string", title: "Role" },
		age: { type: "integer", title: "Age" },
		active: { type: "boolean", title: "Active" },
	},
};

const columns = [
	{ accessorKey: "name", header: "Name" },
	{ accessorKey: "email", header: "Email" },
	{ accessorKey: "role", header: "Role" },
	{ accessorKey: "age", header: "Age" },
	{ accessorKey: "active", header: "Active" },
];

const data = [
	{
		name: "Alice Martin",
		email: "alice@example.com",
		role: "Admin",
		age: 32,
		active: true,
	},
	{
		name: "Bob Dupont",
		email: "bob@example.com",
		role: "User",
		age: 28,
		active: true,
	},
	{
		name: "Claire Dubois",
		email: "claire@example.com",
		role: "Editor",
		age: 35,
		active: false,
	},
	{
		name: "David Leroy",
		email: "david@example.com",
		role: "User",
		age: 42,
		active: true,
	},
];

export function BasicAutoTableDemo() {
	return (
		<div className="w-full">
			<AutoTable
				columns={columns}
				data={data}
				registry={registry}
				schema={schema}
				sorting
			/>
		</div>
	);
}
