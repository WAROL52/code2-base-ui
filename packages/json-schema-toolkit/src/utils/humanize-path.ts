export function humanizePath(path: string): string {
	return path
		.split("_")
		.flatMap((part) =>
			part
				.replace(/([a-z])([A-Z])/g, "$1 $2")
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()),
		)
		.join(" ");
}
