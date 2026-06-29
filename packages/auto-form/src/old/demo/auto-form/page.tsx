"use client";

import { FieldInputExample } from "./_examples/field-input-example";
import { FieldTextareaExample } from "./_examples/field-textarea-example";

export default function AutoFormDemo() {
	return (
		<div className="container mx-auto space-y-12 px-4 py-10">
			<div>
				<h1 className="mb-4 font-bold text-3xl">Démonstrations AutoForm</h1>
				<p className="mb-8 text-muted-foreground">
					Formulaires générés automatiquement à la volée utilisant
					@tanstack/react-form, les resolveurs internes et le ZodAdapter pour la
					validation.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<FieldInputExample />
				<FieldTextareaExample />
			</div>
		</div>
	);
}
