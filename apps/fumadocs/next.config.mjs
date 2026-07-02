import { createNextStory } from "@fumadocs/story/next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const withStory = createNextStory();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
};

export default withStory(withMDX(config));
