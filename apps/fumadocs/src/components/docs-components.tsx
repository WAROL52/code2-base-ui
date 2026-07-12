import { cn } from "@/lib/cn";

interface DocsNoteProps {
	children: React.ReactNode;
	className?: string;
}

export function DocsNote({ children, className }: DocsNoteProps) {
	return (
		<div
			className={cn(
				"not-prose my-6 rounded-lg border bg-muted/50 px-5 py-4 text-[15px] text-foreground/80 leading-relaxed [&_strong]:text-foreground",
				className
			)}
		>
			{children}
		</div>
	);
}

interface DocsCodeProps {
	children: React.ReactNode;
	className?: string;
}

export function DocsCode({ children, className }: DocsCodeProps) {
	return (
		<code
			className={cn(
				"relative rounded-md bg-muted px-1.5 py-0.5 font-medium font-mono text-sm",
				className
			)}
		>
			{children}
		</code>
	);
}
