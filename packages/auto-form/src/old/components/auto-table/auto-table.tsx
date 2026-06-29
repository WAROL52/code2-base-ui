// =============================================================================
// AutoTable — Composant de génération automatique de tableaux
// =============================================================================

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";
import { resolveSchema } from "../../core/resolver";
import { traverseSchema } from "../../core/traverser";
import type { AutoTableProps } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatPrimitiveValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "✅" : "❌";
  return String(value);
}

function isComplexValue(
  value: unknown,
): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isPlainObject(value);
}

function matchesGlobalFilter(value: unknown, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return true;
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.some((item) => matchesGlobalFilter(item, normalizedQuery));
  }

  if (isPlainObject(value)) {
    return Object.values(value).some((item) =>
      matchesGlobalFilter(item, normalizedQuery),
    );
  }

  return String(value).toLowerCase().includes(normalizedQuery);
}

function getNestedSummary(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (isPlainObject(value)) return `{ ${Object.keys(value).length} fields }`;
  return formatPrimitiveValue(value);
}

function NestedValueTable({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (value === null || value === undefined) return "-";

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          [{value.length} items]
        </div>
        <table className="w-full border-collapse text-xs text-muted-foreground">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-2 py-1 font-medium">Index</th>
              <th className="px-2 py-1 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item, index) => (
              <tr
                key={`${depth}-${typeof item === "object" ? JSON.stringify(item) : String(item)}`}
                className="border-b border-border/50 align-top last:border-b-0"
              >
                <td className="px-2 py-2 font-medium text-muted-foreground">
                  {index}
                </td>
                <td className="px-2 py-2">
                  {isComplexValue(item) ? (
                    <NestedValueTable value={item} depth={depth + 1} />
                  ) : (
                    formatPrimitiveValue(item)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    return (
      <table className="w-full border-collapse text-xs text-muted-foreground">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-2 py-1 font-medium">Field</th>
            <th className="px-2 py-1 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, nestedValue]) => (
            <tr
              key={`${depth}-${key}`}
              className="border-b border-border/50 align-top last:border-b-0"
            >
              <td className="px-2 py-2 font-medium text-foreground">{key}</td>
              <td className="px-2 py-2" style={{ wordBreak: "break-word" }}>
                {isComplexValue(nestedValue) ? (
                  <NestedValueTable value={nestedValue} depth={depth + 1} />
                ) : (
                  formatPrimitiveValue(nestedValue)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return formatPrimitiveValue(value);
}

export function AutoTable<TData extends object>({
  schema,
  data,
  title,
  description,
  pagination,
  globalFilter,
  className,
  onRowClick,
}: AutoTableProps<TData>) {
  // 1. Résoudre et traverser le schéma
  const resolved = useMemo(() => resolveSchema(schema), [schema]);
  const fields = useMemo(() => traverseSchema(resolved), [resolved]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilterValue, setGlobalFilterValue] = React.useState("");

  const filteredData = useMemo(() => {
    if (!globalFilter?.enabled) return data;
    return data.filter((row) => matchesGlobalFilter(row, globalFilterValue));
  }, [data, globalFilter?.enabled, globalFilterValue]);

  // 2. Générer les colonnes à partir des FieldMeta
  const columns = useMemo(() => {
    return fields
      .filter((f) => !f.uiHidden)
      .map((field) => {
        return {
          accessorKey: field.path,
          header: field.label || field.name,
          cell: (info) => {
            const value = info.getValue() as unknown;

            if (value === null || value === undefined) return "-";

            if (field.kind === "object" || field.kind === "array") {
              return (
                <details className="group rounded-md border border-border bg-muted/50 px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs font-medium text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span>
                        {field.kind === "object"
                          ? "Voir le détail"
                          : `Voir les ${Array.isArray(value) ? value.length : 0} éléments`}
                      </span>
                      <span className="text-muted-foreground">
                        {getNestedSummary(value)}
                      </span>
                    </span>
                  </summary>
                  <div
                    className="mt-3 overflow-x-auto whitespace-normal"
                    style={{ wordBreak: "break-word" }}
                  >
                    <NestedValueTable value={value} />
                  </div>
                </details>
              );
            }

            if (typeof value === "boolean") return value ? "✅" : "❌";

            return String(value);
          },
        } as ColumnDef<TData, unknown>;
      });
  }, [fields]);

  // 3. Initialiser la table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination?.enabled
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: pagination?.pageSize ?? 10,
      },
    },
  });

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {globalFilter?.enabled && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="auto-table-global-filter"
          >
            Recherche rapide
          </label>
          <input
            id="auto-table-global-filter"
            type="search"
            value={globalFilterValue}
            onChange={(event) => setGlobalFilterValue(event.target.value)}
            placeholder={
              globalFilter.placeholder ?? "Rechercher dans le tableau"
            }
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      )}

      <div className="rounded-md border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/50 border-b border-border text-foreground font-semibold uppercase text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 cursor-pointer select-none hover:bg-muted transition-colors"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </span>
                      <span>
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-muted/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-muted-foreground whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination?.enabled && (
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="text-sm text-muted-foreground italic">
            Page {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-4 py-1.5 text-xs font-medium border border-border rounded-lg disabled:opacity-50 hover:bg-muted/50 transition-all shadow-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Précédent
            </button>
            <button
              type="button"
              className="px-4 py-1.5 text-xs font-medium border border-border rounded-lg disabled:opacity-50 hover:bg-muted/50 transition-all shadow-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
