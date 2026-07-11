import type { FeatureContract, SortingOptions } from "./types";

export const sortingFeature: FeatureContract<unknown, SortingOptions> = {
	key: "sorting",
	slot: "header",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableSorting: options.enable ?? true,
			enableMultiSort: options.enableMultiSort ?? false,
		};

		if (options.state !== undefined) {
			opts.state = { sorting: options.state } as Record<string, unknown>;
			opts.onSortingChange = options.onSortingChange;
		}

		return opts;
	},
};
