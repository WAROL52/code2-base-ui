const StandardFieldRegistryOfAutoForm = createFieldRegistry({
	TextField: { type: "string", widget: "text" },
	NumberField: { type: "number", widget: "number" },
	BooleanField: { type: "boolean", widget: "switch" },
	EnumField: { type: "string", widget: "select" },
	TextareaField: { type: "string", widget: "textarea" },
	SwitchField: { type: "boolean", widget: "switch" },
});

class ShadcnFieldRegistry extends StandardFieldRegistryOfAutoForm {
	resolveField = (meta: FieldMeta, defaultResolver: DefaultFieldResolver) =>
		defaultResolver(meta);
	ObjectField: ComponentType<ObjectFieldProps>;
	ArrayField: ComponentType<ArrayFieldProps>;
	CompositionsField: ComponentType<CompositionsFieldProps>;
	SubmitButton: ComponentType<SubmitButtonProps>;

	// Escape hatch — optionnel, pour les types customs
	TextField = (props: FieldProps) => <input type="text" {...props} />;
	...
}

class ShadcnFieldRegistryExtended extends StandardFieldRegistryOfAutoForm.extend({
	AnotherField: {type: "string", widget: "custom-widget"}
	// override the selector for the TextField to use a custom widget
	TextField:{type: "string", widget: "message"},
	TextFieldSecondary:{type: "string", widget: "message",variant:"secondary"},
 }) {
 resolveField = (meta: FieldMeta, defaultResolver: DefaultFieldResolver) => defaultResolver(meta)
  ObjectField: ComponentType<ObjectFieldProps>
  ArrayField: ComponentType<ArrayFieldProps>
  CompositionsField: ComponentType<CompositionsFieldProps>
  SubmitButton: ComponentType<SubmitButtonProps>

  // Escape hatch — optionnel, pour les types customs
 TextField=(props: FieldProps) => <input type="text" {...props} />
 TextFieldSecondary=(props: FieldProps) => <input type="text" {...props} />
 ...
 AnotherField=(props: FieldProps) => <input type="text" {...props} />
}
