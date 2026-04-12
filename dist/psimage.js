import { Buffer as Buffer$1 } from "node:buffer";
import colors from "colors";
import log from "fancy-log";
import imagemin from "imagemin";
import gifsicle from "imagemin-gifsicle";
import mozjpeg from "imagemin-mozjpeg";
import svgo from "imagemin-svgo";
import PluginError from "plugin-error";
import plur from "plur";
import prettyBytes from "pretty-bytes";
import through2 from "through2";
import sharp from "sharp";
import isPng from "is-png";
import optipng from "optipng-bin";
import { execFile } from "node:child_process";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
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
//#region src/webpcon.ts
const defaultWebpOptions = {
	quality: 90,
	lossless: false
};
var webpcon_default = (options) => async (buffer) => {
	try {
		const mergedOptions = Object.assign({}, defaultWebpOptions, options);
		return await sharp(buffer).webp(mergedOptions).toBuffer();
	} catch (err) {
		throw new PluginError("psimage", err);
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
	return through2.obj(async function(file, _, cb) {
		if (file.isNull()) return cb(null, file);
		if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, "Streaming is not supported"));
		if (file.isBuffer()) try {
			const originalSize = Number(file.contents.length);
			let supportFlag = false;
			if (convert === "none") if (/png|jp?g|gif/i.test(file.extname)) sizeLog(file, originalSize, await transform(file, [
				mozjpeg(mozjpegOptions),
				optipng_default(optipngOptions),
				gifsicle(gifsicleOptions)
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
			if (supportFlag) if (/svg/i.test(file.extname)) sizeLog(file, originalSize, await transform(file, [svgo(svgoOptions)]));
			else unsuppLog(file);
		} catch (err) {
			cb(new PluginError(PLUGIN_NAME, err, Object.assign({}, mozjpegOptions, optipngOptions, svgoOptions, options, { fileName: file.path })));
		}
		cb(null, file);
	}, function(cb) {
		if (!silent) {
			const percent = totalBytes > 0 ? totalSavedBytes / totalBytes * 100 : 0;
			let message = `Total ${totalFiles} ${plur("image", totalFiles)} created`;
			if (totalFiles > 0) message += colors.yellow(` (saved ${prettyBytes(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, "")}%)`);
			log(colors.cyan(`${PLUGIN_NAME}: ${message}`));
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
		const savedMessage = `saved ${prettyBytes(saved)} - ${percent.toFixed(1).replace(/\.0$/, "")}%`;
		const message = saved > 0 ? savedMessage : "already optimized";
		if (saved > 0) {
			totalBytes += originalSize;
			totalSavedBytes += saved;
			totalFiles++;
		}
		if (verbose) log(colors.cyan.dim(`${PLUGIN_NAME}:`), colors.bold.green("🗸 ") + colors.grey(file.relative) + colors.dim.yellow(` (${message})`));
	}
	/**
	* logs unsupported file
	* @param file
	*/
	function unsuppLog(file) {
		if (verbose) log(colors.cyan.dim(`${PLUGIN_NAME}: `) + colors.red("✘ ") + colors.magenta("Unsupported file copied: ") + colors.blue(file.relative));
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
