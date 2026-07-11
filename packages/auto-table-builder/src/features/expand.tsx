import type { ExpandOptions, FeatureContract } from "./types";

export const expandFeature: FeatureContract<unknown, ExpandOptions> = {
	key: "expand",
	slot: "body",
	Component: () => null,

	getTableOptions: (options) => {
		const opts: Record<string, unknown> = {
			enableExpanding: options.enable ?? true,
		};

		if (options.state !== undefined) {
			opts.state = { expanded: options.state } as Record<string, unknown>;
			opts.onExpandedChange = options.onExpandedChange;
		}

		return opts;
	},
};
