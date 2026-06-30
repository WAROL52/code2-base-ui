
import AutoFormDemo from "@code2-base-ui/ui/components/auto-form/auto-form-demo";
export default function AutoFormPage() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="font-bold text-2xl">Auto Form</h1>
			<p className="text-gray-600">
				This page demonstrates the auto form generation based on a schema.
			</p>
			<div>
				<AutoFormDemo />
				{/* <AutoForm /> */}
			</div>
		</div>
	);
}
