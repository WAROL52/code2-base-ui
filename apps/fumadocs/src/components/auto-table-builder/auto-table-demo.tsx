"use client";

import {
	AutoTable,
	createColumnRegistry,
} from "@code2-base-ui/auto-table-builder";
import {
	CellArray,
	CellBadge,
	CellBoolean,
	CellDate,
	CellEmail,
	CellNumber,
	CellObject,
	CellText,
	CellUrl,
} from "@code2-base-ui/auto-table-builder/cell-components";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { ReactNode } from "react";

const allTypesRegistry = createColumnRegistry();
allTypesRegistry.register({ type: "string" }, CellText);
allTypesRegistry.register({ type: "string", format: "email" }, CellEmail);
allTypesRegistry.register({ type: "string", format: "uri" }, CellUrl);
allTypesRegistry.register({ type: "string", format: "date" }, CellDate);
allTypesRegistry.register({ type: "number" }, CellNumber);
allTypesRegistry.register({ type: "integer" }, CellNumber);
allTypesRegistry.register({ type: "boolean" }, CellBoolean);
allTypesRegistry.register({ type: "string", format: "badge" }, CellBadge);
allTypesRegistry.register({ type: "array" }, CellArray);
allTypesRegistry.register({ type: "object" }, CellObject);
allTypesRegistry.setFallback(CellText);

const userSchema = {
	type: "object",
	properties: {
		name: { type: "string", title: "Nom" },
		email: { type: "string", format: "email", title: "Email" },
		role: { type: "string", title: "Rôle" },
		age: { type: "integer", title: "Âge" },
		active: { type: "boolean", title: "Actif" },
		joinedAt: { type: "string", format: "date", title: "Inscription" },
	},
};

const userData = [
	{
		name: "Alice Martin",
		email: "alice@example.com",
		role: "admin",
		age: 32,
		active: true,
		joinedAt: "2024-01-15",
	},
	{
		name: "Bob Dubois",
		email: "bob@example.com",
		role: "user",
		age: 28,
		active: false,
		joinedAt: "2024-03-20",
	},
	{
		name: "Claire Petit",
		email: "claire@example.com",
		role: "editor",
		age: 35,
		active: true,
		joinedAt: "2023-11-01",
	},
	{
		name: "David Moreau",
		email: "david@example.com",
		role: "user",
		age: 22,
		active: true,
		joinedAt: "2024-06-10",
	},
	{
		name: "Emma Bernard",
		email: "emma@example.com",
		role: "admin",
		age: 29,
		active: false,
		joinedAt: "2024-02-28",
	},
];

const cellTypesSchema = {
	type: "object",
	properties: {
		label: { type: "string", title: "Type" },
		text: { type: "string", title: "Texte" },
		email: { type: "string", format: "email", title: "Email" },
		url: { type: "string", format: "uri", title: "URL" },
		date: { type: "string", format: "date", title: "Date" },
		number: { type: "number", title: "Nombre" },
		boolean: { type: "boolean", title: "Booléen" },
		badge: { type: "string", format: "badge", title: "Badge" },
		array: { type: "array", title: "Tableau" },
		object: { type: "object", title: "Objet" },
	},
};

const cellTypesData = [
	{
		label: "Valeurs simples",
		text: "Hello",
		email: "user@example.com",
		url: "https://example.com",
		date: "2024-06-15",
		number: 1234,
		boolean: true,
		badge: "active",
		array: ["a", "b", "c"],
		object: { name: "test" },
	},
	{
		label: "Valeurs null",
		text: null,
		email: null,
		url: null,
		date: null,
		number: null,
		boolean: null,
		badge: null,
		array: null,
		object: null,
	},
	{
		label: "Cas particuliers",
		text: "Lorem ipsum dolor sit amet",
		email: "long.name+tag@domain.co.uk",
		url: "https://github.com/WAROL52/code2-base-ui",
		date: "2023-12-25",
		number: 42.5,
		boolean: false,
		badge: "error",
		array: [1, 2, 3, 4, 5],
		object: { id: 42, status: "ok" },
	},
];

const paginationSchema = {
	type: "object",
	properties: {
		id: { type: "integer", title: "ID" },
		product: { type: "string", title: "Produit" },
		category: { type: "string", title: "Catégorie" },
		price: { type: "number", title: "Prix" },
		stock: { type: "integer", title: "Stock" },
	},
};

const productsData = Array.from({ length: 25 }, (_, i) => ({
	id: i + 1,
	product: `Produit ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
	category: ["Électronique", "Vêtement", "Alimentaire", "Maison", "Sport"][
		i % 5
	],
	price: Number.parseFloat((Math.random() * 200 + 5).toFixed(2)),
	stock: Math.floor(Math.random() * 100),
}));

const customOverrideSchema = {
	type: "object",
	properties: {
		name: { type: "string", title: "Nom" },
		email: { type: "string", format: "email", title: "Email" },
		role: { type: "string", title: "Rôle" },
		score: { type: "integer", title: "Score" },
	},
};

const customOverrideData = [
	{ name: "Alice", email: "alice@example.com", role: "admin", score: 95 },
	{ name: "Bob", email: "bob@example.com", role: "user", score: 72 },
	{ name: "Claire", email: "claire@example.com", role: "editor", score: 88 },
];

function DemoSection({
	title,
	description,
	children,
	code,
}: {
	title: string;
	description: string;
	children: ReactNode;
	code: string;
}) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm">{title}</h3>
			<p className="text-muted-foreground text-sm">{description}</p>
			<div className="overflow-hidden rounded-lg border">{children}</div>
			<CodeBlock title="configuration.ts">
				<Pre>{code}</Pre>
			</CodeBlock>
		</div>
	);
}

export function BasicTableDemo() {
	return (
		<DemoSection
			code={`
<AutoTable
  schema={userSchema}
  data={userData}
  registry={allTypesRegistry}
  sorting
/>`}
			description="Tri activé par défaut. Cliquez sur un en-tête de colonne pour trier."
			title="Tableau simple avec tri"
		>
			<div className="p-4">
				<AutoTable
					data={userData}
					registry={allTypesRegistry}
					schema={userSchema}
					sorting
				/>
			</div>
		</DemoSection>
	);
}

export function FullFeatureTableDemo() {
	return (
		<DemoSection
			code={`
<AutoTable
  schema={paginationSchema}
  data={productsData}
  registry={allTypesRegistry}
  sorting
  pagination={{ state: { pageIndex: 0, pageSize: 5 } }}
  rowSelection
  columnVisibility
/>`}
			description="25 produits avec tri, pagination (5/page), sélection de lignes et masquage de colonnes."
			title="Tableau complet : tri + pagination + sélection + visibilité"
		>
			<div className="p-4">
				<AutoTable
					columnVisibility
					data={productsData}
					pagination={{ state: { pageIndex: 0, pageSize: 5 } }}
					registry={allTypesRegistry}
					rowSelection
					schema={paginationSchema}
					sorting
				/>
			</div>
		</DemoSection>
	);
}

export function CellComponentsDemo() {
	return (
		<DemoSection
			code={`
const registry = createColumnRegistry()
registry.register({ type: "string" }, CellText)
registry.register({ type: "string", format: "email" }, CellEmail)
registry.register({ type: "string", format: "uri" }, CellUrl)
registry.register({ type: "string", format: "date" }, CellDate)
registry.register({ type: "number" }, CellNumber)
registry.register({ type: "integer" }, CellNumber)
registry.register({ type: "boolean" }, CellBoolean)
registry.register({ type: "string", format: "badge" }, CellBadge)
registry.register({ type: "array" }, CellArray)
registry.register({ type: "object" }, CellObject)
registry.setFallback(CellText)`}
			description="Les 9 composants de cellule en action, avec cas null et cas particuliers."
			title="Tous les types de cellules"
		>
			<div className="p-4">
				<AutoTable
					data={cellTypesData}
					registry={allTypesRegistry}
					schema={cellTypesSchema}
				/>
			</div>
		</DemoSection>
	);
}

export function CustomColumnDemo() {
	return (
		<DemoSection
			code={`
<AutoTable
  schema={customOverrideSchema}
  data={customOverrideData}
  registry={allTypesRegistry}
  columnOverrides={{
    score: {
      header: "Score (%)",
      cell: ({ row }) => {
        const score = row.original.score
        let color
        if (score >= 90) { color = "green" }
        else if (score >= 75) { color = "#ca8a04" }
        else { color = "red" }
        return <span style={{ color }}>{score}%</span>
      },
    },
    name: {
      header: "👤 Nom complet",
    },
  }}
/>`}
			description="Surcharge des colonnes 'score' (cellule colorée) et 'name' (header custom)."
			title="Colonnes personnalisées (columnOverrides)"
		>
			<div className="p-4">
				<AutoTable
					columnOverrides={{
						score: {
							header: "Score (%)",
							cell: ({ row }) => {
								const score = row.original.score as number;
								let color: string;
								if (score >= 90) {
									color = "green";
								} else if (score >= 75) {
									color = "#ca8a04";
								} else {
									color = "red";
								}
								return <span style={{ color, fontWeight: 600 }}>{score}%</span>;
							},
						},
						name: {
							header: "Nom complet",
						},
					}}
					data={customOverrideData}
					registry={allTypesRegistry}
					schema={customOverrideSchema}
				/>
			</div>
		</DemoSection>
	);
}
