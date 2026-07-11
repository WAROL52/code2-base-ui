import type { FeatureContract, PaginationOptions } from "./types";

export const paginationFeature: FeatureContract<unknown, PaginationOptions> = {
	key: "pagination",
	slot: "pagination",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {};

		if (options.manualPagination && options.pageCount !== undefined) {
			opts.manualPagination = true;
			opts.pageCount = options.pageCount;
		}
		// Note: client-side getPaginationRowModel is added in useAutoTable

		if (options.state !== undefined) {
			opts.state = { pagination: options.state } as Record<string, unknown>;
			opts.onPaginationChange = options.onPaginationChange;
		}

		return opts;
	},
};
