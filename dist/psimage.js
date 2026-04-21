import { Buffer as Buffer$1 } from "node:buffer";
import { Transform } from "node:stream";
import chalk from "chalk";
import log from "fancy-log";
import imagemin from "imagemin";
import PluginError from "plugin-error";
import plur from "plur";
import prettyBytes from "pretty-bytes";
import sharp from "sharp";
import { gifsicle } from "gifsicle-neo";
import { execFile } from "node:child_process";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TextDecoder, promisify } from "node:util";
import { mozjpeg } from "mozjpeg-neo";
import optipng from "optipng-bin";
import isSvg from "is-svg";
import { optimize } from "svgo";
//#region src/avifcon.ts
const defaultAvifOptions = {
	quality: 90,
	lossless: false,
	speed: 5,
	chromaSubsampling: "4:2:0"
};
var avifcon_default = (options) => async (buffer) => {
	try {
		const mergedOptions = {
			...defaultAvifOptions,
			...options
		};
		return await sharp(buffer).avif(mergedOptions).toBuffer();
	} catch (err) {
		throw new PluginError("psimage", err);
	}
};
//#endregion
//#region src/exec-buffer.ts
const execFileAsync = promisify(execFile);
const inputPlaceholder = Symbol.for("exec-buffer.inputPath");
const outputPlaceholder = Symbol.for("exec-buffer.outputPath");
async function execBuffer(options) {
	const { input, bin, args } = options;
	const tempDir = tmpdir();
	const inputPath = join(tempDir, `exec-buffer-input-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	const outputPath = join(tempDir, `exec-buffer-output-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	try {
		await writeFile(inputPath, input);
		await execFileAsync(bin, args.map((arg) => {
			if (arg === inputPlaceholder) return inputPath;
			if (arg === outputPlaceholder) return outputPath;
			return arg;
		}));
		return await readFile(outputPath);
	} finally {
		try {
			await unlink(inputPath);
		} catch {}
		try {
			await unlink(outputPath);
		} catch {}
	}
}
const execBufferWithProps = Object.assign(execBuffer, {
	input: inputPlaceholder,
	output: outputPlaceholder
});
//#endregion
//#region src/is-gif.ts
/**
* Determines if a given buffer contains a GIF image by checking its magic number.
*
* @param buffer - A Uint8Array (or null/undefined) representing the file data.
* @returns `true` if the buffer starts with the GIF signature (0x47 0x49 0x46), `false` otherwise.
*
* @example
* ```ts
* const data = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
* console.log(isGif(data)); // true
* ```
*/
function isGif(buffer) {
	if (!buffer || buffer.length < 3) return false;
	return buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70;
}
//#endregion
//#region src/gifsicle.ts
var gifsicle_default = (options = {}) => async (buffer) => {
	options = {
		optimizationLevel: 3,
		interlaced: false,
		colors: 256,
		...options
	};
	if (!Buffer$1.isBuffer(buffer)) throw new TypeError("Expected a buffer");
	if (!isGif(buffer)) return buffer;
	const args = ["--no-warnings", "--no-app-extensions"];
	if (options.interlaced) args.push("--interlace");
	if (options.optimizationLevel) args.push(`--optimize=${options.optimizationLevel}`);
	if (options.colors) args.push(`--colors=${options.colors}`);
	args.push("-o", execBufferWithProps.output);
	args.push(execBufferWithProps.input);
	return execBufferWithProps({
		input: buffer,
		bin: gifsicle,
		args
	});
};
//#endregion
//#region src/is-jpg.ts
/**
* Determines if a given buffer contains a JPEG image by checking its magic number.
*
* @param buffer - A Uint8Array (or null/undefined) representing the file data.
* @returns `true` if the buffer starts with the JPEG signature (0xFF 0xD8 0xFF), `false` otherwise.
*
* @example
* ```ts
* const data = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
* console.log(isJpg(data)); // true
* ```
*/
function isJpg(buffer) {
	if (!buffer || buffer.length < 3) return false;
	return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
}
//#endregion
//#region src/mozjpeg.ts
var mozjpeg_default = (options = {}) => async (buffer) => {
	const opts = {
		quality: 95,
		progressive: true,
		trellis: true,
		trellisDC: true,
		overshoot: true,
		...options
	};
	if (!Buffer$1.isBuffer(buffer)) throw new TypeError("Expected a buffer");
	if (!isJpg(buffer)) return buffer;
	if (options.fastcrush) throw new Error("Option `fastcrush` was renamed to `fastCrush`");
	if (options.maxmemory) throw new Error("Option `maxmemory` was renamed to `maxMemory`");
	if (options.notrellis) throw new Error("Option `notrellis` was renamed to `trellis` and inverted");
	if (options.noovershoot) throw new Error("Option `noovershoot` was renamed to `overshoot` and inverted");
	const args = [];
	if (typeof opts.quality !== "undefined") args.push("-quality", String(opts.quality));
	if (opts.progressive === false) args.push("-baseline");
	if (opts.targa) args.push("-targa");
	if (opts.revert) args.push("-revert");
	if (opts.fastCrush) args.push("-fastcrush");
	if (typeof opts.dcScanOpt !== "undefined") args.push("-dc-scan-opt", String(opts.dcScanOpt));
	if (!opts.trellis) args.push("-notrellis");
	if (!opts.trellisDC) args.push("-notrellis-dc");
	if (opts.tune) args.push(`-tune-${opts.tune}`);
	if (!opts.overshoot) args.push("-noovershoot");
	if (opts.arithmetic) args.push("-arithmetic");
	if (opts.dct) args.push("-dct", opts.dct);
	if (opts.quantBaseline) args.push("-quant-baseline", String(opts.quantBaseline));
	if (typeof opts.quantTable !== "undefined") args.push("-quant-table", String(opts.quantTable));
	if (opts.smooth) args.push("-smooth", String(opts.smooth));
	if (opts.maxMemory) args.push("-maxmemory", String(opts.maxMemory));
	if (opts.sample) args.push("-sample", opts.sample.join(","));
	args.push("-outfile", execBufferWithProps.output);
	args.push(execBufferWithProps.input);
	return execBufferWithProps({
		input: buffer,
		bin: mozjpeg,
		args
	});
};
//#endregion
//#region src/is-png.ts
/**
* Determines if a given buffer contains a PNG image by checking its magic number.
*
* @param buffer - A Uint8Array (or null/undefined) representing the file data. Only the first 8 bytes are needed.
* @returns `true` if the buffer starts with the PNG signature (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A), `false` otherwise.
*
* @example
* ```ts
* // Node.js:
* import {readChunk} from 'read-chunk';
* import isPng from './is-png';
*
* const buffer = await readChunk('unicorn.png', {length: 8});
* console.log(isPng(buffer)); // true
* ```
*
* @example
* ```ts
* // Browser:
* import isPng from './is-png';
*
* const response = await fetch('unicorn.png');
* const buffer = await response.arrayBuffer();
* console.log(isPng(new Uint8Array(buffer))); // true
* ```
*/
function isPng(buffer) {
	if (!buffer || buffer.length < 8) return false;
	return buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10;
}
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
	if (!isPng(buffer)) return buffer;
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
		bin: optipng,
		args: arguments_
	});
};
//#endregion
//#region src/svgo.ts
const defaultSvgoOptions = { multipass: true };
var svgo_default = (options = {}) => async (buffer) => {
	try {
		const mergedOptions = {
			...defaultSvgoOptions,
			...options
		};
		const contents = new TextDecoder().decode(buffer);
		if (!isSvg(contents)) return buffer;
		const { data } = optimize(contents, mergedOptions);
		return Buffer$1.from(data);
	} catch (err) {
		throw new PluginError("psimage", err);
	}
};
//#endregion
//#region src/webpcon.ts
const defaultWebpOptions = {
	quality: 90,
	lossless: false
};
var webpcon_default = (options) => async (buffer) => {
	try {
		const mergedOptions = {
			...defaultWebpOptions,
			...options
		};
		return await sharp(buffer).webp(mergedOptions).toBuffer();
	} catch (err) {
		throw new PluginError("psimage", err);
	}
};
//#endregion
//#region src/psimage.ts
const REGEX_IMAGE_EXT = /png|jp?g|gif/i;
const REGEX_WEBP_CONVERT_EXT = /ti?f|png|jp?g|gif|webp|avif/i;
const REGEX_AVIF_CONVERT_EXT = /ti?f|png|jp?g|gif|webp|avif/i;
const REGEX_SVG_EXT = /svg/i;
/**
* Function for image optimization and conversion.
* @param options - Options for image optimization and conversion.
* @param options.mozjpegOptions - Options for the "mozjpeg" plugin.
* @param options.optipngOptions - Options for the "optipng" plugin.
* @param options.svgoOptions - SvgOptions for the "svgo" plugin.
* @param options.gifsicleOptions - Options for the "gifsicle" plugin.
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
	return new Transform({
		objectMode: true,
		async transform(file, _, cb) {
			if (file.isNull()) return cb(null, file);
			if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, "Streaming is not supported"));
			if (file.isBuffer()) try {
				const originalSize = Number(file.contents.length);
				let supportFlag = false;
				if (convert === "none") if (REGEX_IMAGE_EXT.test(file.extname)) sizeLog(file, originalSize, await transform(file, [
					mozjpeg_default(mozjpegOptions),
					optipng_default(optipngOptions),
					gifsicle_default(gifsicleOptions)
				]));
				else supportFlag = true;
				if (convert === "webp") if (REGEX_WEBP_CONVERT_EXT.test(file.extname)) {
					const optimizedSize = await transform(file, [webpcon_default(webpOptions)]);
					file.extname = ".webp";
					sizeLog(file, originalSize, optimizedSize);
				} else supportFlag = true;
				if (convert === "avif") if (REGEX_AVIF_CONVERT_EXT.test(file.extname)) {
					const optimizedSize = await transform(file, [avifcon_default(avifOptions)]);
					file.extname = ".avif";
					sizeLog(file, originalSize, optimizedSize);
				} else supportFlag = true;
				if (supportFlag) if (REGEX_SVG_EXT.test(file.extname)) sizeLog(file, originalSize, await transform(file, [svgo_default(svgoOptions)]));
				else unsuppLog(file);
			} catch (err) {
				cb(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
			}
			cb(null, file);
		},
		flush(cb) {
			if (!silent) {
				const percent = totalBytes > 0 ? totalSavedBytes / totalBytes * 100 : 0;
				let message = `Total ${totalFiles} ${plur("image", totalFiles)} created`;
				if (totalFiles > 0) message += chalk.yellow(` (saved ${prettyBytes(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, "")}%)`);
				log(chalk.cyan(`${PLUGIN_NAME}: ${message}`));
			}
			cb();
		}
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
		const savedMessage = `saved ${prettyBytes(saved)} - ${percent.toFixed(1).replace(/\.0$/, "")}%`;
		const message = saved > 0 ? savedMessage : "already optimized";
		if (saved > 0) {
			totalBytes += originalSize;
			totalSavedBytes += saved;
			totalFiles++;
		}
		if (verbose) log(chalk.cyan.dim(`${PLUGIN_NAME}:`), chalk.bold.green("🗸 ") + chalk.grey(file.relative) + chalk.yellow.dim(` (${message})`));
	}
	/**
	* logs unsupported file
	* @param file
	*/
	function unsuppLog(file) {
		if (verbose) log(chalk.cyan.dim(`${PLUGIN_NAME}: `) + chalk.red("✘ ") + chalk.magenta("Unsupported file copied: ") + chalk.blue(file.relative));
	}
	/**
	* Convert image file using provided plugins.
	* @param file - The image file to convert.
	* @param plugins - The plugins to use for conversion.
	* @returns The size of the converted image.
	*/
	async function transform(file, plugins) {
		const content = file.contents;
		const data = await imagemin.buffer(content, { plugins });
		file.contents = Buffer$1.from(data);
		return Number(data.length);
	}
}
//#endregion
export { psimage };
