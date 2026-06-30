"use client";

import type { ReactNode } from "react";

function SimpleFormDemo(): ReactNode {
	return (
		<div className="rounded-lg border p-4 space-y-4">
			<p className="text-fd-muted-foreground text-sm">
				Démo à réécrire avec <code>auto-form-builder</code> prochainement.
			</p>
		</div>
	);
}

function UserFormDemo(): ReactNode {
	return (
		<div className="rounded-lg border p-4 space-y-4">
			<p className="text-fd-muted-foreground text-sm">
				Démo à réécrire avec <code>auto-form-builder</code> prochainement.
			</p>
		</div>
	);
}

function SignupFormDemo(): ReactNode {
	return (
		<div className="rounded-lg border p-4 space-y-4">
			<p className="text-fd-muted-foreground text-sm">
				Démo à réécrire avec <code>auto-form-builder</code> prochainement.
			</p>
		</div>
	);
}

function CustomLayoutDemo(): ReactNode {
	return (
		<div className="rounded-lg border p-4 space-y-4">
			<p className="text-fd-muted-foreground text-sm">
				Démo à réécrire avec <code>auto-form-builder</code> prochainement.
			</p>
		</div>
	);
}

export function SimpleForm(): ReactNode {
	return <SimpleFormDemo />;
}

export function UserForm(): ReactNode {
	return <UserFormDemo />;
}

export function SignupForm(): ReactNode {
	return <SignupFormDemo />;
}

export function CustomLayoutForm(): ReactNode {
	return <CustomLayoutDemo />;
}
