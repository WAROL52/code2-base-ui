// @vitest-environment node
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PACKAGE_ROOT = resolve(import.meta.dirname, "..");

describe("npm package installation", () => {
	let tmpDir: string;
	let tarballPath: string;

	beforeAll(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "auto-form-install-"));
	});

	afterAll(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	it("pnpm pack creates a tarball with expected files", () => {
		execSync(`pnpm pack --pack-destination ${tmpDir}`, {
			cwd: PACKAGE_ROOT,
			stdio: "pipe",
		});

		const files = execSync(`ls ${tmpDir}`, { encoding: "utf-8" })
			.trim()
			.split("\n");
		const tarball = files.find((f) =>
			f.startsWith("code2-base-ui-auto-form-builder-")
		);
		expect(tarball).toBeDefined();
		tarballPath = join(tmpDir, tarball as string);
		expect(existsSync(tarballPath)).toBe(true);

		const contents = execSync(`tar tzf ${tarballPath}`, {
			encoding: "utf-8",
			stdio: "pipe",
		});

		expect(contents).toContain("package/src/index.ts");
		expect(contents).toContain("package/src/auto-form-builder.tsx");
		expect(contents).toContain("package/src/adapters/tanstack.tsx");
		expect(contents).toContain("package/src/adapters/rhf.tsx");
		expect(contents).toContain("package/src/adapters/formisch.tsx");
		expect(contents).toContain("package/src/fields/field-components.tsx");
		expect(contents).toContain("package/src/layout/shadcn.tsx");
		expect(contents).toContain("package/src/testing.tsx");
		expect(contents).toContain("package/src/validate.ts");
		expect(contents).toContain("package/package.json");
	});

	it("tarball can be extracted and contains valid package.json", () => {
		const extractDir = join(tmpDir, "extracted");
		mkdirSync(extractDir, { recursive: true });

		execSync(`tar xzf ${tarballPath} -C ${extractDir}`, {
			stdio: "pipe",
		});

		const pkgJson = resolve(extractDir, "package", "package.json");
		expect(existsSync(pkgJson)).toBe(true);

		const pkg = JSON.parse(
			execSync(`cat ${pkgJson}`, { encoding: "utf-8", stdio: "pipe" })
		);
		expect(pkg.name).toBe("@code2-base-ui/auto-form-builder");
		expect(pkg.version).toBeDefined();
		expect(pkg.exports).toBeDefined();
		expect(pkg.exports["."]).toBeDefined();
		expect(pkg.exports["./adapters"]).toBeDefined();
		expect(pkg.exports["./adapters/tanstack"]).toBeDefined();
		expect(pkg.exports["./adapters/rhf"]).toBeDefined();
		expect(pkg.exports["./adapters/formisch"]).toBeDefined();
		expect(pkg.exports["./fields"]).toBeDefined();
		expect(pkg.exports["./layout"]).toBeDefined();
		expect(pkg.exports["./testing"]).toBeDefined();
		expect(pkg.exports["./validate"]).toBeDefined();
	});
});
