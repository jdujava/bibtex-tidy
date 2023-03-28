import { writeFile, mkdir, chmod, readFile } from 'fs/promises';
import { join } from 'path';
import { env } from 'process';
import { transform as swc, type Options, type Output } from '@swc/core';
import { generateDtsBundle } from 'dts-bundle-generator';
import {
	build,
	context,
	type OnLoadResult,
	type OutputFile,
	type Plugin,
} from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import prettier from 'prettier';
//@ts-expect-error
import rewritePattern from 'regexpu-core';
import autoPreprocess from 'svelte-preprocess';
import { version, author, homepage } from './package.json';
import { functionWords, MODIFIERS, SPECIAL_MARKERS } from './src/generateKeys';
import {
	DEFAULT_KEY_TEMPLATE,
	optionDefinitions,
} from './src/optionDefinitions';
import { wrapText } from './src/utils';

const SRC_PATH = join(__dirname, 'src');
const BUILD_PATH = join(SRC_PATH, '__generated__');
const WEB_PATH = join(__dirname, 'docs');
const CLI_BIN = env.BIBTEX_TIDY_BIN ?? join(__dirname, 'bin', 'bibtex-tidy');

/**
 * Browser features
 *
 * -----------------------------------------------------------
 *                            Chrome  Edge  Safari  FF   IE
 * -----------------------------------------------------------
 * Summary/details element      12     79      6    49  None
 * CSS variables                49     16     10    36  None
 * Flexbox                      21     12     6.1   28   11
 * WOFF2                        35     14     10    39  None
 * HTML main                    26     12      7    21  None
 * CSS appearance: none          4     12     3.1   2   None   (not essential)
 * regexp u flag                50     12     10    46  None   (polyfilled)
 * regexp \p{} char classes     64     79     11.1  78  None   (polyfilled)
 * -----------------------------------------------------------
 * Min supported                49     79     10    49  None
 * -----------------------------------------------------------
 */
// TODO: test on browserstack

const BROWSER_TARGETS = {
	chrome: '49',
	edge: '79',
	safari: '10',
	firefox: '49',
};

const NODE_TARGET: string[] = ['node12'];

const banner: string[] = [
	`bibtex-tidy v${version}`,
	'https://github.com/FlamingTempura/bibtex-tidy',
	'',
	'DO NOT EDIT THIS FILE. This file is automatically generated',
	"using `npm run build`. Edit files in './src' then rebuild.",
];

const jsBanner: string[] = [
	'/**',
	...banner.map((line) => ` * ${line}`.trimEnd()),
	' **/',
	'',
];

async function generateOptionTypes() {
	const { outputFiles } = await build({
		entryPoints: [join(SRC_PATH, 'optionDefinitions.ts')],
		write: false,
		format: 'esm',
		target: ['esnext'],
	});
	const outputFile = outputFiles[0];
	if (!outputFile) throw new Error('Error building options definitions');
	const bundle = new TextDecoder().decode(outputFile.contents);
	// Bundle creates an export which eval doesn't know what to do with. Assign to
	// var instead.
	const options = eval(bundle.replace(/^export/m, 'const res = ') + '; res');

	const ts: string[] = [];

	ts.push(...jsBanner);
	ts.push('export type BibTeXTidyOptions = {');
	for (const opt of options.optionDefinitions) {
		ts.push('\t/**');
		ts.push(`\t * ${opt.title}`);
		if (opt.description) {
			ts.push('\t *');
			for (const line of opt.description) {
				ts.push(`\t * ${line}`);
			}
		}
		ts.push('\t */');
		ts.push(`\t${opt.key}?: ${opt.type};`);
	}
	ts.push('};');
	ts.push('');

	await writeFile(join(BUILD_PATH, 'optionsType.ts'), ts.join('\n'));
}

async function generateVersionFile() {
	await writeFile(
		join(BUILD_PATH, 'version.ts'),
		`export const version = "${version}";`
	);
}

const NAME = `BibTeX Tidy v${version}`;
const DESCRIPTION = [
	'Cleaner and formatter for BibTeX files.',
	'',
	'If no input or output file is specified, bibtex-tidy reads the standard input or writes to the standard output respectively. Use -m to overwrite the input file.',
];

const SYNOPSIS = 'bibtex-tidy [infile] [-o outfile] [option...]';

async function generateCLIHelp() {
	const help: string[] = [
		`Usage: ${SYNOPSIS}`,
		'',
		NAME,
		'='.repeat(NAME.length),
		...DESCRIPTION.map((d) => wrapText(d, 84).join('\n')),
		'',
		'Options:',
		...formatOptions(2, 84),
		`Full documentation <${homepage}>`,
	];
	await writeFile(
		join(BUILD_PATH, 'manPage.ts'),
		jsBanner.join('\n') +
			`export const manPage = ${JSON.stringify(help, null, '\t')};`
	);
}

async function generateManPage() {
	await writeFile(
		'bibtex-tidy.0',
		[
			'NAME',
			`    ${NAME}`,
			'',
			'SYNOPSIS',
			`    ${SYNOPSIS}`,
			'',
			'DESCRIPTION',
			...DESCRIPTION.map((d) =>
				wrapText(d, 61)
					.map((line) => `    ${line}`)
					.join('\n')
			),
			'',
			'OPTIONS',
			...formatOptions(4, 65),
			'BUGS',
			`    ${homepage}`,
			'',
			'AUTHOR',
			`    ${author}`,
		].join('\n')
	);
}

async function generateReadme() {
	const readme = await readFile(join(__dirname, 'README.md'), 'utf8');
	await writeFile(
		join(__dirname, 'README.md'),
		readme.replace(
			/```manpage.*?```/s,
			'```manpage\n' + formatOptions(2, 84).join('\n') + '\n```'
		)
	);
}

async function generateKeyTemplatePage() {
	let doc = await readFile(
		join(__dirname, 'docs/manual/key-generation.html'),
		'utf8'
	);
	const markers = Object.entries(SPECIAL_MARKERS).map(
		([k, { description }]) => `<li><code>[${k}]</code>: ${description}</li>`
	);
	const modifiers = Object.entries(MODIFIERS).map(
		([k, { description }]) => `<li><code>:${k}</code>: ${description}</li>`
	);

	doc = doc
		.replace(
			/<!--DEFAULT_KEY-->.*?<!--END-->/s,
			`<!--DEFAULT_KEY-->${DEFAULT_KEY_TEMPLATE}<!--END-->`
		)
		.replace(
			/<!--MARKERS-->.*?<!--END-->/s,
			`<!--MARKERS-->${markers.join('\n')}<!--END-->`
		)
		.replace(
			/<!--MODIFIERS-->.*?<!--END-->/s,
			`<!--MODIFIERS-->${modifiers.join('\n')}<!--END-->`
		)
		.replace(
			/<!--WORDS-->.*?<!--END-->/s,
			`<!--WORDS-->${[...functionWords].join(', ')}<!--END-->`
		);
	await writeFile(join(__dirname, 'docs/manual/key-generation.html'), doc);
}

function formatOptions(indent: number, lineWidth: number): string[] {
	return optionDefinitions.flatMap((opt) => {
		if (opt.deprecated) return [];

		const description: string[] = [];

		if (opt.description) {
			description.push(...opt.description.flatMap((line) => [line, '\n']));
		}

		if (opt.examples && opt.examples.length > 0) {
			description.push(
				'Examples:',
				opt.examples.filter((example) => example).join(', '),
				''
			);
		}

		return [
			Object.keys(opt.cli).join(', '),
			...description.flatMap((line) =>
				wrapText(line, lineWidth - indent - 4).map((line) => `    ${line}`)
			),
		].map((line) => `${' '.repeat(indent)}${line}`);
	});
}

async function buildJSBundle() {
	console.time('JS bundle built');
	const { outputFiles } = await build({
		entryPoints: ['./src/index.ts'],
		bundle: true,
		write: false,
		format: 'esm',
		keepNames: true,
		banner: { js: jsBanner.join('\n') },
		plugins: [regexpuPlugin],
		target: ['esnext'],
	});
	const bundle = outputFiles[0];
	if (!bundle) throw new Error('Failed to build JS bundle');
	const result = await transpileForOldBrowsers(bundle, {
		module: { type: 'commonjs' },
	});
	const text = prettier.format(result.code, {
		parser: 'babel',
		printWidth: 1000,
	});
	await writeFile(
		'bibtex-tidy.js',
		text + `\nmodule.exports = exports.default;`
	);
	console.timeEnd('JS bundle built');
}

async function buildTypeDeclarations() {
	console.time('Type declarations');
	const typeFile = generateDtsBundle([
		{ filePath: './src/index.ts', output: { noBanner: true } },
	])[0];
	if (!typeFile) throw new Error('Failed to generate type file');
	await writeFile('bibtex-tidy.d.ts', typeFile);
	console.timeEnd('Type declarations');
}

async function buildCLI() {
	console.time('CLI built');
	await build({
		bundle: true,
		platform: 'node',
		banner: {
			js: '#!/usr/bin/env node\n' + jsBanner.join('\n'),
		},
		target: ['esnext', ...NODE_TARGET],
		entryPoints: [join(SRC_PATH, 'cli', 'cli.ts')],
		sourcemap: env.NODE_ENV === 'coverage' ? 'inline' : false,
		sourceRoot: './',
		outfile: CLI_BIN,
	});
	await chmod(CLI_BIN, 0o755); // rwxr-xr-x
	console.timeEnd('CLI built');
}

async function buildWebBundle() {
	console.time('Web bundle built');

	const { outputFiles } = await build({
		platform: 'browser',
		entryPoints: ['./src/ui/index.ts'],
		// esbuild replaces the extension, e.g. js for css
		outfile: join(WEB_PATH, 'bundle.js'),
		bundle: true,
		write: false,
		keepNames: true,
		minify: true,
		target: ['esnext'],
		plugins: [
			sveltePlugin({ preprocess: autoPreprocess() }),
			googleFontPlugin,
			regexpuPlugin,
		],
	});

	for (const file of outputFiles) {
		let text = file.text;
		if (file.path.endsWith('.js')) {
			text = (await transpileForOldBrowsers(file, { minify: true })).code;
			text = jsBanner.join('\n') + text;
			text = prettier.format(text, { parser: 'babel', printWidth: 400 });
		}
		await writeFile(file.path, text);
	}

	console.timeEnd('Web bundle built');
}

async function serveWeb() {
	const ctx = await context({
		platform: 'browser',
		entryPoints: ['./src/ui/index.ts'],
		// esbuild replaces the extension, e.g. js for css
		outfile: join(WEB_PATH, 'bundle.js'),
		bundle: true,
		sourcemap: true,
		write: false,
		plugins: [
			sveltePlugin({
				preprocess: autoPreprocess(),
				compilerOptions: { enableSourcemap: true },
			}),
			googleFontPlugin,
		],
	});
	const server = await ctx.serve({ servedir: WEB_PATH });
	console.log(`Access on http://localhost:${server.port}`);
}

// Transforms unicode regexps for older browsers. This needs to be an esbuild
// plugin so it can transform regexp literals before esbuild transforms them
// into RegExp constructors. May be supported by swc in future
// https://github.com/swc-project/swc/issues/1649
const regexpuPlugin: Plugin = {
	name: 'regexpu',
	setup(build) {
		build.onLoad({ filter: /\.m?[jt]s$/, namespace: '' }, async (args) => {
			const contents = await readFile(args.path, 'utf8');
			const newContents = contents.replace(
				/\(\/(.*)\/([a-z]*u[a-z]*)/g,
				(_, pattern, flags) => {
					const newPattern = rewritePattern(pattern, flags, {
						unicodeFlag: 'transform',
						unicodePropertyEscapes: 'transform',
					});
					return `(/${newPattern}/${flags.replace('u', '')}`;
				}
			);
			return { contents: newContents, loader: 'ts' };
		});
	},
};

// Downloads google fonts and injects them as base64 urls into bundle css
const googleFontPlugin: Plugin = {
	name: 'google-font-loader',
	setup(build) {
		build.onResolve({ filter: /^https?:\/\/fonts\./ }, (args) => ({
			path: args.path,
			namespace: 'http-url',
		}));
		build.onLoad(
			{ filter: /.*/, namespace: 'http-url' },
			async (args): Promise<OnLoadResult> => {
				const res = await fetch(args.path, {
					headers: {
						// ensures google responds with woff2 fonts
						'User-Agent': 'Mozilla/5.0 Firefox/90.0',
					},
				});
				const contents = Buffer.from(await res.arrayBuffer());
				const loader = args.path.endsWith('.woff2') ? 'dataurl' : 'css';
				return { contents, loader };
			}
		);
	},
};

/**
 * swc converts js syntax to support older browsers. ESBuild can kinda do this
 * but only for more recent browsers. swc is also far easier to configure than
 * babel. This has to happen after esbuild has finished because esbuild adds
 * syntax that needs to be transformed.
 */
async function transpileForOldBrowsers(
	bundle: OutputFile,
	options?: Options
): Promise<Output> {
	return await swc(bundle.text, {
		filename: bundle.path,
		env: { targets: BROWSER_TARGETS },
		...options,
	});
}

if (process.argv.includes('--serve')) {
	serveWeb();
} else {
	mkdir(BUILD_PATH, { recursive: true })
		.then(() =>
			Promise.all([
				generateOptionTypes(),
				generateVersionFile(),
				generateManPage(),
				generateKeyTemplatePage(),
				generateCLIHelp(),
				generateReadme(),
			])
		)
		.then(() =>
			Promise.all([
				!process.argv.includes('--no-defs')
					? buildTypeDeclarations()
					: undefined,
				buildJSBundle(),
				buildCLI(),
				buildWebBundle(),
			])
		);
}
