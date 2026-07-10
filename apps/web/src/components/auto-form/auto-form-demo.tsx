"use client";

import {
	createAutoForm,
	createShadcnRegistry,
	formischAdapter,
	rhfAdapter,
	tanstackAdapter,
} from "@code2-base-ui/auto-form-builder";
import { Card } from "@code2-base-ui/ui/components/card";
import {
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
} from "@code2-base-ui/ui/components/tabs";
import { toast } from "sonner";
import {
	forgotPasswordSchema,
	loginSchema,
	profileSchema,
	registerSchema,
} from "./schemas";

const registry = createShadcnRegistry();

const TanStackForm = createAutoForm({
	adapter: tanstackAdapter,
	registry,
});

const RHF_Form = createAutoForm({
	adapter: rhfAdapter,
	registry,
});

const FormischForm = createAutoForm({
	adapter: formischAdapter,
	registry,
});

const adapters = [
	{ label: "TanStack Form", value: "tanstack", Form: TanStackForm },
	{ label: "React Hook Form", value: "rhf", Form: RHF_Form },
	{ label: "Formisch", value: "formisch", Form: FormischForm },
] as const;

function FormSection({
	form: Form,
	schema,
	defaultValues,
	onSubmit,
}: {
	form: ReturnType<typeof createAutoForm>;
	schema: Record<string, unknown>;
	defaultValues?: Record<string, unknown>;
	onSubmit: (data: unknown) => void;
}) {
	return (
		<Card className="mb-6">
			<Form
				className="p-4"
				defaultValues={defaultValues}
				onSubmit={onSubmit}
				schema={schema}
			/>
		</Card>
	);
}

function handleLogin(data: unknown) {
	toast.success("Connexion réussie", {
		description: JSON.stringify(data, null, 2),
	});
}

function handleRegister(data: unknown) {
	const d = data as Record<string, unknown>;
	if (d.password && d.confirmPassword && d.password !== d.confirmPassword) {
		toast.error("Les mots de passe ne correspondent pas");
		return;
	}
	toast.success("Inscription réussie", {
		description: JSON.stringify(
			{ email: d.email, username: d.username, role: d.role },
			null,
			2
		),
	});
}

function handleForgotPassword(data: unknown) {
	toast.success("Email envoyé", {
		description: JSON.stringify(data, null, 2),
	});
}

function handleProfile(data: unknown) {
	toast.success("Profil mis à jour", {
		description: JSON.stringify(data, null, 2),
	});
}

export default function AutoFormDemo() {
	return (
		<Tabs defaultValue="tanstack">
			<TabsList>
				{adapters.map((a) => (
					<TabsTab key={a.value} value={a.value}>
						{a.label}
					</TabsTab>
				))}
			</TabsList>
			{adapters.map((a) => (
				<TabsPanel key={a.value} value={a.value}>
					<FormSection
						form={a.Form}
						onSubmit={handleLogin}
						schema={loginSchema}
					/>
					<FormSection
						form={a.Form}
						onSubmit={handleRegister}
						schema={registerSchema}
					/>
					<FormSection
						form={a.Form}
						onSubmit={handleForgotPassword}
						schema={forgotPasswordSchema}
					/>
					<FormSection
						defaultValues={{
							firstName: "Jean",
							lastName: "Dupont",
							bio: "Développeur full-stack",
						}}
						form={a.Form}
						onSubmit={handleProfile}
						schema={profileSchema}
					/>
				</TabsPanel>
			))}
		</Tabs>
	);
}
