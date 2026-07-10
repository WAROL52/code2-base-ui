"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@code2-base-ui/ui/lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			className={cn("w-full", className)}
			data-slot="tabs"
			{...props}
		/>
	);
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
	return (
		<TabsPrimitive.List
			className={cn("flex border-border border-b", className)}
			data-slot="tabs-list"
			{...props}
		/>
	);
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
	return (
		<TabsPrimitive.Tab
			className={cn(
				"cursor-pointer px-4 py-2 font-medium text-muted-foreground text-sm transition-colors data-active:border-primary data-active:border-b-2 data-active:text-foreground",
				className
			)}
			data-slot="tabs-tab"
			{...props}
		/>
	);
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
	return (
		<TabsPrimitive.Panel
			className={cn("pt-4", className)}
			data-slot="tabs-panel"
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsPanel, TabsTab };
