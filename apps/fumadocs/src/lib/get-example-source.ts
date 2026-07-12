import fs from "node:fs";
import path from "node:path";

const EXAMPLES_DIR = path.join(process.cwd(), "src/components/demo/examples");

export function getExampleSource(filename: string): string {
	const filePath = path.join(EXAMPLES_DIR, filename);
	return fs.readFileSync(filePath, "utf-8");
}
