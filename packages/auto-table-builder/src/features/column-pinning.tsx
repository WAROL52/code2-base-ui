import type { ColumnPinningOptions, FeatureContract } from "./types";

export const columnPinningFeature: FeatureContract<
	unknown,
	ColumnPinningOptions
> = {
	key: "columnPinning",
	slot: "header",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableColumnPinning: options.enable ?? true,
		};

		if (options.state !== undefined) {
			opts.state = {
				columnPinning: options.state,
			} as Record<string, unknown>;
			opts.onColumnPinningChange = options.onColumnPinningChange;
		}

		return opts;
	},
};
