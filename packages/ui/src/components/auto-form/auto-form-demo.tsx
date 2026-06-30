"use client";
import { createAutoForm } from "@code2-base-ui/auto-form";
import { zodProvider } from "@code2-base-ui/auto-form-provider-zod";
import { tanstackFormAdapter } from "@code2-base-ui/auto-form-adapter-tanstack";
import { createShadcnRegistry } from "@code2-base-ui/auto-form-render-shadcn";
import { z } from "zod";

const { AutoForm } = createAutoForm({
	provider: zodProvider,
	form: tanstackFormAdapter,
	registry: createShadcnRegistry(),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(100),
});

export default function AutoFormDemo() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="font-bold text-2xl">Auto Form Demo</h1>
			<p className="text-gray-600">
				This page demonstrates the auto form generation based on a schema.
			</p>
			<AutoForm schema={loginSchema} />
		</div>
	);
}
