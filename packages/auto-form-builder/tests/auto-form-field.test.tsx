import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../src/adapters/tanstack";
import { AutoFormField } from "../src/auto-form-field";

const mockResolve = vi
	.fn<(fieldMeta: FieldMeta) => React.ComponentType<Record<string, unknown>>>()
	.mockReturnValue(({ value, onChange, label }: Record<string, unknown>) => (
		<div>
			<label>
				{label as string}
				<input
					data-error=""
					data-testid="field-input"
					onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
					value={(value as string) ?? ""}
				/>
			</label>
		</div>
	));

const textFieldMeta: FieldMeta = {
	path: "name",
	type: "string",
	label: "Name",
	kind: "primitive",
};

describe("AutoFormField", () => {
	it("renders a primitive field using adapter.Field", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(_formAPI) => (
					<AutoFormField
						adapter={tanstackAdapter}
						fieldMeta={textFieldMeta}
						registry={{ resolve: mockResolve } as unknown as FieldRegistry}
					/>
				)}
			</tanstackAdapter.FormProvider>
		);

		expect(screen.getByText("Name")).toBeDefined();
		const input = screen.getByTestId("field-input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});
});
