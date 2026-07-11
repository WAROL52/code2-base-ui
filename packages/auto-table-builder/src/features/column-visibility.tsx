import type { ColumnVisibilityOptions, FeatureContract } from "./types";

export const columnVisibilityFeature: FeatureContract<
	unknown,
	ColumnVisibilityOptions
> = {
	key: "columnVisibility",
	slot: "toolbar",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableHiding: options.enable ?? true,
		};

		if (options.state !== undefined) {
			opts.state = {
				columnVisibility: options.state,
			} as Record<string, unknown>;
			opts.onColumnVisibilityChange = options.onColumnVisibilityChange;
		} else if (options.initialState !== undefined) {
			opts.initialState = {
				columnVisibility: options.initialState,
			} as Record<string, unknown>;
		}

		return opts;
	},
};
