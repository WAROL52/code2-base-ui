export const loginSchema = {
	type: "object",
	title: "Connexion",
	description: "Connectez-vous à votre compte",
	properties: {
		email: { type: "string", format: "email", title: "Email" },
		password: {
			type: "string",
			"x-ui-widget": "password",
			title: "Mot de passe",
		},
		rememberMe: { type: "boolean", title: "Se souvenir de moi" },
	},
	required: ["email", "password"],
} as const satisfies Record<string, unknown>;

export const registerSchema = {
	type: "object",
	title: "Inscription",
	description: "Créez un nouveau compte",
	properties: {
		email: { type: "string", format: "email", title: "Email" },
		username: { type: "string", title: "Nom d'utilisateur" },
		password: {
			type: "string",
			"x-ui-widget": "password",
			title: "Mot de passe",
		},
		confirmPassword: {
			type: "string",
			"x-ui-widget": "password",
			title: "Confirmer le mot de passe",
		},
		role: {
			type: "string",
			enum: ["user", "admin"],
			title: "Rôle",
		},
	},
	required: ["email", "username", "password", "confirmPassword"],
} as const satisfies Record<string, unknown>;

export const forgotPasswordSchema = {
	type: "object",
	title: "Mot de passe oublié",
	description: "Recevez un lien de réinitialisation",
	properties: {
		email: {
			type: "string",
			format: "email",
			title: "Email",
		},
	},
	required: ["email"],
} as const satisfies Record<string, unknown>;

export const profileSchema = {
	type: "object",
	title: "Profil",
	description: "Modifiez vos informations personnelles",
	properties: {
		firstName: { type: "string", title: "Prénom" },
		lastName: { type: "string", title: "Nom" },
		bio: {
			type: "string",
			"x-ui-widget": "textarea",
			title: "Bio",
		},
		birthDate: {
			type: "string",
			format: "date",
			title: "Date de naissance",
		},
	},
	required: ["firstName", "lastName"],
} as const satisfies Record<string, unknown>;
