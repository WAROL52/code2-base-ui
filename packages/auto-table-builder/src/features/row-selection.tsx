import type { FeatureContract, RowSelectionOptions } from "./types";

export const rowSelectionFeature: FeatureContract<
	unknown,
	RowSelectionOptions
> = {
	key: "rowSelection",
	slot: "selection-info",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableRowSelection: options.enable ?? true,
			enableMultiRowSelection: options.enableMultiRowSelection ?? true,
		};

		if (options.state !== undefined) {
			opts.state = {
				rowSelection: options.state,
			} as Record<string, unknown>;
			opts.onRowSelectionChange = options.onRowSelectionChange;
		}

		return opts;
	},
};
