import type { ReactNode } from "react";

export interface AutoTableToolbarProps {
	children?: ReactNode;
	className?: string;
}

export function AutoTableToolbar({
	children,
	className,
}: AutoTableToolbarProps) {
	return (
		<div className={`flex items-center py-2 ${className ?? ""}`}>
			{children}
		</div>
	);
}
