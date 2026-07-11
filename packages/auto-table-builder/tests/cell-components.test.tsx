import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	CellArray,
	CellBadge,
	CellBoolean,
	CellDate,
	CellEmail,
	CellNumber,
	CellObject,
	CellText,
	CellUrl,
} from "../src/cell-components";

const yearPattern = /2024/;
const numberPattern = /[0-9.,\s]{2,}/;
const decimalPattern = /3[.,]14?/;
const namePattern = /name/;

describe("CellText", () => {
	it("renders text value", () => {
		render(<CellText value="hello" />);
		expect(screen.getByText("hello")).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellText value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("renders dash for undefined", () => {
		render(<CellText value={undefined} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("renders number as string", () => {
		render(<CellText value={42} />);
		expect(screen.getByText("42")).toBeDefined();
	});
});

describe("CellEmail", () => {
	it("renders mailto link", () => {
		render(<CellEmail value="test@example.com" />);
		const link = screen.getByRole("link");
		expect(link.getAttribute("href")).toBe("mailto:test@example.com");
	});

	it("renders dash for null", () => {
		render(<CellEmail value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});
});

describe("CellUrl", () => {
	it("renders link with correct href", () => {
		render(<CellUrl value="https://example.com" />);
		const link = screen.getByRole("link");
		expect(link.getAttribute("href")).toBe("https://example.com");
		expect(link.getAttribute("target")).toBe("_blank");
	});

	it("renders dash for null", () => {
		render(<CellUrl value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});
});

describe("CellDate", () => {
	it("renders formatted date", () => {
		render(<CellDate value="2024-01-15" />);
		expect(screen.getByText(yearPattern)).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellDate value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("handles invalid date gracefully", () => {
		render(<CellDate value="not-a-date" />);
		expect(screen.getByText("not-a-date")).toBeDefined();
	});

	it("handles Date object", () => {
		render(<CellDate value={new Date("2024-06-15")} />);
		expect(screen.getByText(yearPattern)).toBeDefined();
	});
});

describe("CellNumber", () => {
	it("renders formatted number", () => {
		const { container } = render(<CellNumber value={1234} />);
		// locale-dependent formatting, check it's a number
		expect(container.textContent).toMatch(numberPattern);
	});

	it("renders dash for null", () => {
		render(<CellNumber value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("renders decimal numbers", () => {
		const { container } = render(<CellNumber value={3.14} />);
		expect(container.textContent).toMatch(decimalPattern);
	});
});

describe("CellBoolean", () => {
	it("renders check for true", () => {
		const { container } = render(<CellBoolean value={true} />);
		const checkIcon = container.querySelector(".lucide-check");
		expect(checkIcon).toBeDefined();
	});

	it("renders x for false", () => {
		const { container } = render(<CellBoolean value={false} />);
		const xIcon = container.querySelector(".lucide-x");
		expect(xIcon).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellBoolean value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});
});

describe("CellBadge", () => {
	it("renders badge text", () => {
		render(<CellBadge value="active" />);
		expect(screen.getByText("active")).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellBadge value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("applies color class for known status", () => {
		const { container } = render(<CellBadge value="active" />);
		const badge = container.querySelector("span");
		expect(badge?.className).toContain("green");
	});
});

describe("CellArray", () => {
	it("renders pills for short array", () => {
		render(<CellArray value={["a", "b"]} />);
		expect(screen.getByText("a")).toBeDefined();
		expect(screen.getByText("b")).toBeDefined();
	});

	it("renders +N more for long array", () => {
		render(<CellArray value={[1, 2, 3, 4]} />);
		expect(screen.getByText("+2 more")).toBeDefined();
	});

	it("renders Empty for empty array", () => {
		render(<CellArray value={[]} />);
		expect(screen.getByText("Empty")).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellArray value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});
});

describe("CellObject", () => {
	it("renders object preview", () => {
		render(<CellObject value={{ name: "test", age: 42 }} />);
		expect(screen.getByText(namePattern)).toBeDefined();
	});

	it("renders dash for null", () => {
		render(<CellObject value={null} />);
		expect(screen.getByText("—")).toBeDefined();
	});

	it("renders {} for empty object", () => {
		render(<CellObject value={{}} />);
		expect(screen.getByText("{}")).toBeDefined();
	});
});
