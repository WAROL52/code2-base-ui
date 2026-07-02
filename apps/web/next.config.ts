import "@code2-base-ui/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	output: process.env.VERCEL ? undefined : "standalone",
	transpilePackages: ["shiki"],
};

export default nextConfig;
