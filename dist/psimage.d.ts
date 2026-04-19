import { Transform } from "node:stream";
import { AvifOptions, WebpOptions } from "sharp";
import { Config as SvgOptions } from "svgo";

//#region src/psimage.d.ts
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
declare function psimage(options?: {
  mozjpegOptions?: object | undefined;
  optipngOptions?: object | undefined;
  svgoOptions?: SvgOptions | undefined;
  gifsicleOptions?: object | undefined;
  avifOptions?: AvifOptions | undefined;
  webpOptions?: WebpOptions | undefined;
  convert?: 'none' | 'avif' | 'webp' | undefined;
  silent?: boolean | undefined;
  verbose?: boolean | undefined;
}): Transform;
//#endregion
export { type AvifOptions, type SvgOptions, type WebpOptions, psimage };