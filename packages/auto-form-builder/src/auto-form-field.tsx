"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";
import { ArrayHandler } from "./handlers/array-handler";
import { LeafHandler } from "./handlers/leaf-handler";
import { ObjectHandler } from "./handlers/object-handler";
import type { HandlerProps } from "./handlers/types";
import { UnionHandler } from "./handlers/union-handler";
import { useFormLayout } from "./layout/context";

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	form: FormAPI;
	registry: FieldRegistry;
	renderChild?: (childMeta: FieldMeta) => ReactNode;
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}

type HandlerComponent = ComponentType<HandlerProps>;

const handlerMap: Record<string, HandlerComponent> = {
	array: ArrayHandler,
	enum: LeafHandler,
	object: ObjectHandler,
	primitive: LeafHandler,
	union: UnionHandler,
};

export function AutoFormField({
	fieldMeta,
	adapter,
	form,
	registry,
	unionFieldRenderer: UnionRenderer,
}: AutoFormFieldProps) {
	const layout = useFormLayout();
	const { uiHidden } = fieldMeta;

	if (uiHidden) {
		return null;
	}

	const renderField = (childMeta: FieldMeta) => (
		<AutoFormField
			adapter={adapter}
			fieldMeta={childMeta}
			form={form}
			key={childMeta.path}
			registry={registry}
			unionFieldRenderer={UnionRenderer}
		/>
	);

	const Handler = fieldMeta.kind ? handlerMap[fieldMeta.kind] : undefined;

	if (Handler) {
		return (
			<Handler
				adapter={adapter}
				fieldMeta={fieldMeta}
				form={form}
				layout={layout}
				registry={registry}
				renderChild={renderField}
				unionFieldRenderer={UnionRenderer as HandlerProps["unionFieldRenderer"]}
			/>
		);
	}

	return null;
}
