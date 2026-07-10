"use client";

import { Button } from "@code2-base-ui/ui/components/button";
import { Calendar } from "@code2-base-ui/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@code2-base-ui/ui/components/popover";

import { cn } from "@code2-base-ui/ui/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

function DatePicker({
	date,
	onSelect,
	placeholder = "Pick a date",
	className,
}: {
	date?: Date;
	onSelect?: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger nativeButton={false}>
				<Button
					className={cn(
						"w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
						className
					)}
					data-empty={!date}
					variant="outline"
				>
					<CalendarIcon />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					onSelect={(selectedDate) => {
						onSelect?.(selectedDate);
						setOpen(false);
					}}
					selected={date}
				/>
			</PopoverContent>
		</Popover>
	);
}

function DateRangePicker({
	dateRange,
	onSelect,
	className,
}: {
	dateRange?: DateRange;
	onSelect?: (range: DateRange | undefined) => void;
	className?: string;
}) {
	const [open, setOpen] = useState(false);

	const rangeLabel = () => {
		if (!dateRange?.from) {
			return <span>Pick a date range</span>;
		}
		if (!dateRange.to) {
			return format(dateRange.from, "LLL dd, y");
		}
		return (
			<>
				{format(dateRange.from, "LLL dd, y")} -{" "}
				{format(dateRange.to, "LLL dd, y")}
			</>
		);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger nativeButton={false}>
				<Button
					className={cn(
						"w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
						className
					)}
					data-empty={!dateRange?.from}
					variant="outline"
				>
					<CalendarIcon />
					{rangeLabel()}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="range"
					onSelect={(selectedRange) => {
						onSelect?.(selectedRange);
						if (selectedRange?.from && selectedRange?.to) {
							setOpen(false);
						}
					}}
					selected={dateRange}
				/>
			</PopoverContent>
		</Popover>
	);
}

export { DatePicker, DateRangePicker };
