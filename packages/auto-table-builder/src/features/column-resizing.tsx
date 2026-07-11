import type { ColumnResizingOptions, FeatureContract } from "./types";

export const columnResizingFeature: FeatureContract<
	unknown,
	ColumnResizingOptions
> = {
	key: "columnResizing",
	slot: "header",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableColumnResizing: options.enable ?? true,
			columnResizeMode: options.resizeMode ?? "onChange",
		};

		if (options.state !== undefined) {
			opts.state = {
				columnSizing: options.state,
			} as Record<string, unknown>;
			opts.onColumnSizingChange = options.onColumnSizingChange;
		}

		return opts;
	},
};
