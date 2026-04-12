Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let node_buffer = require("node:buffer");
let colors = require("colors");
colors = __toESM(colors);
let fancy_log = require("fancy-log");
fancy_log = __toESM(fancy_log);
let imagemin = require("imagemin");
imagemin = __toESM(imagemin);
let imagemin_gifsicle = require("imagemin-gifsicle");
imagemin_gifsicle = __toESM(imagemin_gifsicle);
let imagemin_mozjpeg = require("imagemin-mozjpeg");
imagemin_mozjpeg = __toESM(imagemin_mozjpeg);
let imagemin_svgo = require("imagemin-svgo");
imagemin_svgo = __toESM(imagemin_svgo);
let plugin_error = require("plugin-error");
plugin_error = __toESM(plugin_error);
let plur = require("plur");
plur = __toESM(plur);
let pretty_bytes = require("pretty-bytes");
pretty_bytes = __toESM(pretty_bytes);
let through2 = require("through2");
through2 = __toESM(through2);
let sharp = require("sharp");
sharp = __toESM(sharp);
let is_png = require("is-png");
is_png = __toESM(is_png);
let optipng_bin = require("optipng-bin");
optipng_bin = __toESM(optipng_bin);
let node_child_process = require("node:child_process");
let node_fs_promises = require("node:fs/promises");
let node_os = require("node:os");
let node_path = require("node:path");
let node_util = require("node:util");
//#region src/avifcon.ts
const defaultAvifOptions = {
	quality: 90,
	lossless: false,
	speed: 5,
	chromaSubsampling: "4:2:0"
};
var avifcon_default = (options) => async (buffer) => {
	try {
		const mergedOptions = Object.assign({}, defaultAvifOptions, options);
		return await (0, sharp.default)(buffer).avif(mergedOptions).toBuffer();
	} catch (err) {
		throw new plugin_error.default("psimage", err);
	}
};
//#endregion
//#region src/exec-buffer.ts
const execFileAsync = (0, node_util.promisify)(node_child_process.execFile);
const inputPlaceholder = Symbol.for("exec-buffer.inputPath");
const outputPlaceholder = Symbol.for("exec-buffer.outputPath");
async function execBuffer(options) {
	const { input, bin, args } = options;
	const tempDir = (0, node_os.tmpdir)();
	const inputPath = (0, node_path.join)(tempDir, `exec-buffer-input-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	const outputPath = (0, node_path.join)(tempDir, `exec-buffer-output-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	try {
		await (0, node_fs_promises.writeFile)(inputPath, input);
		await execFileAsync(bin, args.map((arg) => {
			if (arg === inputPlaceholder) return inputPath;
			if (arg === outputPlaceholder) return outputPath;
			return arg;
		}));
		return await (0, node_fs_promises.readFile)(outputPath);
	} finally {
		try {
			await (0, node_fs_promises.unlink)(inputPath);
		} catch {}
		try {
			await (0, node_fs_promises.unlink)(outputPath);
		} catch {}
	}
}
const execBufferWithProps = Object.assign(execBuffer, {
	input: inputPlaceholder,
	output: outputPlaceholder
});
//#endregion
//#region src/optipng.ts
var optipng_default = (options = {}) => async (buffer) => {
	options = {
		optimizationLevel: 3,
		bitDepthReduction: true,
		colorTypeReduction: true,
		paletteReduction: true,
		interlaced: false,
		errorRecovery: true,
		...options
	};
	if (!Buffer.isBuffer(buffer)) throw new TypeError("Expected a buffer");
	if (!(0, is_png.default)(buffer)) return buffer;
	const arguments_ = [
		"-strip",
		"all",
		"-clobber",
		"-o",
		String(options.optimizationLevel),
		"-out",
		execBufferWithProps.output
	];
	if (options.errorRecovery) arguments_.push("-fix");
	if (!options.bitDepthReduction) arguments_.push("-nb");
	if (typeof options.interlaced === "boolean") arguments_.push("-i", options.interlaced ? "1" : "0");
	if (!options.colorTypeReduction) arguments_.push("-nc");
	if (!options.paletteReduction) arguments_.push("-np");
	arguments_.push(execBufferWithProps.input);
	return execBufferWithProps({
		input: buffer,
		bin: optipng_bin.default,
		args: arguments_
	});
};
//#endregion
//#region src/webpcon.ts
const defaultWebpOptions = {
	quality: 90,
	lossless: false
};
var webpcon_default = (options) => async (buffer) => {
	try {
		const mergedOptions = Object.assign({}, defaultWebpOptions, options);
		return await (0, sharp.default)(buffer).webp(mergedOptions).toBuffer();
	} catch (err) {
		throw new plugin_error.default("psimage", err);
	}
};
//#endregion
//#region src/psimage.ts
/**
* Function for image optimization and conversion.
* @param options - Options for image optimization and conversion.
* @param options.mozjpegOptions - Options for the "imagemin-mozjpeg" plugin.
* @param options.optipngOptions - Options for the "imagemin-optipng" plugin.
* @param options.svgoOptions - Options for the "imagemin-svgo" plugin.
* @param options.gifsicleOptions - Options for the "imagemin-gifsicle" plugin.
* @param options.avifOptions - AvifOptions for the "sharp" plugin.
* @param options.webpOptions - WebpOptions for the "sharp" plugin.
* @param options.convert - Options for enabling conversion using 'avif' or 'webp' plugins.
* @param options.silent - If true, the final message with the calculation of savings is disabled.
* @param options.verbose - If true, messages are displayed for each file.
* @returns object stream.
*
* @example
*
* ```js
*
* // import modules
* import { dest, src } from 'gulp'
* import { psimage } from 'psimage'
*
* // default options:
* const options = {
*   mozjpegOptions: { quality: 75, progressive: true },
*   optipngOptions: { optimizationLevel: 5 },
*   svgoOptions: { plugins: [{ name: 'preset-default' }, 'removeViewBox'] },
*   gifsicleOptions: { interlaced: true, optimizationLevel: 1, colors: 256 },
*   avifOptions: { quality: 50 },
*   webpOptions: { quality: 50 },
*   convert: 'none', // types: 'none' | 'avif' | 'webp' | undefined
*   silent: false,   // types: boolean | undefined
*   verbose: false,  // types: boolean | undefined
* }
*
* // images task
* function images() {
*   return src(['.src/images/*.*'], { base: 'src', encoding: false })
*   .pipe(psimage(options))
*   .pipe(dest("dist"));
* }
*
* // export
* export { images }
*
* ```
*/
function psimage(options = {}) {
	const mozjpegOptions = options.mozjpegOptions ?? {
		quality: 75,
		progressive: true
	};
	const optipngOptions = options.optipngOptions ?? { optimizationLevel: 5 };
	const svgoOptions = options.svgoOptions ?? { plugins: [{ name: "preset-default" }, "removeViewBox"] };
	const gifsicleOptions = options.gifsicleOptions ?? {
		interlaced: true,
		optimizationLevel: 1,
		colors: 256
	};
	const avifOptions = options.avifOptions ?? { quality: 50 };
	const webpOptions = options.webpOptions ?? { quality: 50 };
	const convert = options.convert ?? "none";
	const silent = options.silent ?? false;
	const verbose = options.verbose ?? false;
	const PLUGIN_NAME = "psimage";
	let totalBytes = 0;
	let totalSavedBytes = 0;
	let totalFiles = 0;
	return through2.default.obj(async function(file, _, cb) {
		if (file.isNull()) return cb(null, file);
		if (file.isStream()) return cb(new plugin_error.default(PLUGIN_NAME, "Streaming is not supported"));
		if (file.isBuffer()) try {
			const originalSize = Number(file.contents.length);
			let supportFlag = false;
			if (convert === "none") if (/png|jp?g|gif/i.test(file.extname)) sizeLog(file, originalSize, await transform(file, [
				(0, imagemin_mozjpeg.default)(mozjpegOptions),
				optipng_default(optipngOptions),
				(0, imagemin_gifsicle.default)(gifsicleOptions)
			]));
			else supportFlag = true;
			if (convert === "webp") if (/ti?f|png|jp?g|gif|webp|avif/i.test(file.extname)) {
				const optimizedSize = await transform(file, [webpcon_default(webpOptions)]);
				file.extname = ".webp";
				sizeLog(file, originalSize, optimizedSize);
			} else supportFlag = true;
			if (convert === "avif") if (/ti?f|png|jp?g|gif|webp|avif/i.test(file.extname)) {
				const optimizedSize = await transform(file, [avifcon_default(avifOptions)]);
				file.extname = ".avif";
				sizeLog(file, originalSize, optimizedSize);
			} else supportFlag = true;
			if (supportFlag) if (/svg/i.test(file.extname)) sizeLog(file, originalSize, await transform(file, [(0, imagemin_svgo.default)(svgoOptions)]));
			else unsuppLog(file);
		} catch (err) {
			cb(new plugin_error.default(PLUGIN_NAME, err, Object.assign({}, mozjpegOptions, optipngOptions, svgoOptions, options, { fileName: file.path })));
		}
		cb(null, file);
	}, function(cb) {
		if (!silent) {
			const percent = totalBytes > 0 ? totalSavedBytes / totalBytes * 100 : 0;
			let message = `Total ${totalFiles} ${(0, plur.default)("image", totalFiles)} created`;
			if (totalFiles > 0) message += colors.default.yellow(` (saved ${(0, pretty_bytes.default)(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, "")}%)`);
			(0, fancy_log.default)(colors.default.cyan(`${PLUGIN_NAME}: ${message}`));
		}
		cb();
	});
	/**
	* logs the progress and results of the optimization and conversion process,
	* as well as provides statistics on the total number of bytes saved and optimized files
	* @param file
	* @param originalSize
	* @param optimizedSize
	*/
	function sizeLog(file, originalSize, optimizedSize) {
		const saved = originalSize - optimizedSize;
		const percent = originalSize > 0 ? saved / originalSize * 100 : 0;
		const savedMessage = `saved ${(0, pretty_bytes.default)(saved)} - ${percent.toFixed(1).replace(/\.0$/, "")}%`;
		const message = saved > 0 ? savedMessage : "already optimized";
		if (saved > 0) {
			totalBytes += originalSize;
			totalSavedBytes += saved;
			totalFiles++;
		}
		if (verbose) (0, fancy_log.default)(colors.default.cyan.dim(`${PLUGIN_NAME}:`), colors.default.bold.green("🗸 ") + colors.default.grey(file.relative) + colors.default.dim.yellow(` (${message})`));
	}
	/**
	* logs unsupported file
	* @param file
	*/
	function unsuppLog(file) {
		if (verbose) (0, fancy_log.default)(colors.default.cyan.dim(`${PLUGIN_NAME}: `) + colors.default.red("✘ ") + colors.default.magenta("Unsupported file copied: ") + colors.default.blue(file.relative));
	}
	/**
	* Convert image file using provided plugins.
	* @param file - The image file to convert.
	* @param plugins - The plugins to use for conversion.
	* @returns The size of the converted image.
	*/
	async function transform(file, plugins) {
		const content = file.contents;
		const data = await imagemin.default.buffer(content, { plugins });
		file.contents = node_buffer.Buffer.from(data);
		return Number(data.length);
	}
}
//#endregion
exports.psimage = psimage;
