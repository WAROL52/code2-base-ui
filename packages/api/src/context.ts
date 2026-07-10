import type { NextRequest } from "next/server";

export function createContext(_req: NextRequest) {
	return {
		auth: null,
		session: null,
	};
}

export type Context = ReturnType<typeof createContext>;
