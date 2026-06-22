import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, "manifest.json");
const dist = join(root, "build", "revenge");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

await mkdir(dist, { recursive: true });

await build({
	entryPoints: [join(root, manifest.main)],
	outfile: join(dist, "index.js"),
	bundle: true,
	format: "iife",
	globalName: "$",
	banner: { js: "(()=>{" },
	footer: { js: "return $;})();" },
	platform: "neutral",
	target: "es2018",
	jsxFactory: "React.createElement",
	jsxFragment: "React.Fragment",
	minify: true,
	plugins: [
		{
			name: "vendetta-globals",
			setup(buildApi) {
				buildApi.onResolve({ filter: /^@vendetta\/?/ }, ({ path }) => ({
					path,
					namespace: "vendetta",
				}));
				buildApi.onLoad({ filter: /.*/, namespace: "vendetta" }, ({ path }) => ({
					contents: `module.exports = ${path.slice(1).replace(/\//g, ".")};`,
					loader: "js",
				}));
			},
		},
	],
});

const code = await readFile(join(dist, "index.js"), "utf8");
await writeFile(
	join(dist, "manifest.json"),
	JSON.stringify(
		{
			...manifest,
			main: "index.js",
			hash: createHash("sha256").update(code).digest("hex"),
		},
		null,
		"\t",
	),
);

console.log(`Built Better Spotify RPC to ${dist}`);
