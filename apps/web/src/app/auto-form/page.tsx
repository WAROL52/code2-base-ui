import AutoFormDemo from "@/components/auto-form/auto-form-demo";
export default function AutoFormPage() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="font-bold text-2xl">Auto Form</h1>
			<p className="text-muted-foreground text-sm">
				Démos de génération de formulaires avec les 3 adaptateurs.
			</p>
			<div>
				<AutoFormDemo />
			</div>
		</div>
	);
}
