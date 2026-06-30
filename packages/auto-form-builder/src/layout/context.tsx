"use client";

import { createContext, useContext } from "react";
import type { FormLayout } from "./types";

export const FormLayoutCtx = createContext<FormLayout | null>(null);

export function useFormLayout(): FormLayout {
	const ctx = useContext(FormLayoutCtx);
	if (!ctx) {
		throw new Error(
			"useFormLayout: no FormLayout found in context. " +
				"Wrap your component tree with AutoForm (which provides a default layout) " +
				"or provide a FormLayoutCtx.Provider manually."
		);
	}
	return ctx;
}
