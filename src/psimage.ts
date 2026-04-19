import type File from 'vinyl'

import { Buffer } from 'node:buffer'
import { Transform } from 'node:stream'

import chalk from 'chalk'
import log from 'fancy-log'
import imagemin, { type Plugin } from 'imagemin'
import svgo from 'imagemin-svgo'
import PluginError from 'plugin-error'
import plur from 'plur'
import prettyBytes from 'pretty-bytes'
import { type WebpOptions, type AvifOptions } from 'sharp'

import avifcon from './avifcon.js'
import gifsicle from './gifsicle.js'
import mozjpeg from './mozjpeg.js'
import optipng from './optipng.js'
import webpcon from './webpcon.js'

// Regular expressions for file extension matching (compiled once)
const REGEX_IMAGE_EXT = /png|jp?g|gif/i
const REGEX_WEBP_CONVERT_EXT = /ti?f|png|jp?g|gif|webp|avif/i
const REGEX_AVIF_CONVERT_EXT = /ti?f|png|jp?g|gif|webp|avif/i
const REGEX_SVG_EXT = /svg/i

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
function psimage(
  options: {
    mozjpegOptions?: object | undefined
    optipngOptions?: object | undefined
    svgoOptions?: object | undefined
    gifsicleOptions?: object | undefined
    avifOptions?: AvifOptions | undefined
    webpOptions?: WebpOptions | undefined
    convert?: 'none' | 'avif' | 'webp' | undefined
    silent?: boolean | undefined
    verbose?: boolean | undefined
  } = {},
): Transform {
  const mozjpegOptions = options.mozjpegOptions ?? { quality: 75, progressive: true }
  const optipngOptions = options.optipngOptions ?? { optimizationLevel: 5 }
  const svgoOptions = options.svgoOptions ?? { plugins: [{ name: 'preset-default' }, 'removeViewBox'] }
  const gifsicleOptions = options.gifsicleOptions ?? { interlaced: true, optimizationLevel: 1, colors: 256 }
  const avifOptions = options.avifOptions ?? { quality: 50 }
  const webpOptions = options.webpOptions ?? { quality: 50 }
  const convert = options.convert ?? 'none'
  const silent = options.silent ?? false
  const verbose = options.verbose ?? false

  const PLUGIN_NAME = 'psimage'

  let totalBytes = 0
  let totalSavedBytes = 0
  let totalFiles = 0

  return new Transform({
    objectMode: true,
    async transform(file: File, _, cb) {
      if (file.isNull()) {
        return cb(null, file)
      }
      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, 'Streaming is not supported'))
      }
      if (file.isBuffer()) {
        try {
          const originalSize = Number(file.contents.length)
          let supportFlag: boolean = false

          // default optimize and minify
          if (convert === 'none') {
            if (REGEX_IMAGE_EXT.test(file.extname)) {
              const optimizedSize = await transform(file, [
                mozjpeg(mozjpegOptions),
                optipng(optipngOptions),
                gifsicle(gifsicleOptions),
              ])
              sizeLog(file, originalSize, optimizedSize)
            } else {
              supportFlag = true
            }
          }

          // webp converted
          if (convert === 'webp') {
            if (REGEX_WEBP_CONVERT_EXT.test(file.extname)) {
              const optimizedSize = await transform(file, [webpcon(webpOptions)])
              file.extname = '.webp'
              sizeLog(file, originalSize, optimizedSize)
            } else {
              supportFlag = true
            }
          }

          // avif converted
          if (convert === 'avif') {
            if (REGEX_AVIF_CONVERT_EXT.test(file.extname)) {
              const optimizedSize = await transform(file, [avifcon(avifOptions)])
              file.extname = '.avif'
              sizeLog(file, originalSize, optimizedSize)
            } else {
              supportFlag = true
            }
          }

          // skip unsupported file
          if (supportFlag) {
            // svg optimize and minify
            if (REGEX_SVG_EXT.test(file.extname)) {
              const optimizedSize = await transform(file, [svgo(svgoOptions)])
              sizeLog(file, originalSize, optimizedSize)
            } else {
              unsuppLog(file)
            }
          }
        } catch (err) {
          // Pass only necessary information to PluginError
          const error = new PluginError(PLUGIN_NAME, err as string | Error, { fileName: file.path })
          cb(error)
        }
      }
      cb(null, file)
    },

    flush(cb) {
      if (!silent) {
        const percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0
        let message = `Total ${totalFiles} ${plur('image', totalFiles)} created`

        if (totalFiles > 0) {
          message += chalk.yellow(
            ` (saved ${prettyBytes(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, '')}%)`,
          )
        }

        log(chalk.cyan(`${PLUGIN_NAME}: ${message}`))
      }
      cb()
    },
  })

  /**
   * logs the progress and results of the optimization and conversion process,
   * as well as provides statistics on the total number of bytes saved and optimized files
   * @param file
   * @param originalSize
   * @param optimizedSize
   */
  function sizeLog(file: File, originalSize: number, optimizedSize: number) {
    const saved = originalSize - optimizedSize
    const percent = originalSize > 0 ? (saved / originalSize) * 100 : 0
    const savedMessage = `saved ${prettyBytes(saved)} - ${percent.toFixed(1).replace(/\.0$/, '')}%`
    const message = saved > 0 ? savedMessage : 'already optimized'

    if (saved > 0) {
      totalBytes += originalSize
      totalSavedBytes += saved
      totalFiles++
    }

    if (verbose) {
      log(
        chalk.cyan.dim(`${PLUGIN_NAME}:`),
        chalk.bold.green('🗸 ') + chalk.grey(file.relative) + chalk.yellow.dim(` (${message})`),
      )
    }
  }

  /**
   * logs unsupported file
   * @param file
   */
  function unsuppLog(file: File) {
    if (verbose) {
      log(
        chalk.cyan.dim(`${PLUGIN_NAME}: `) +
          chalk.red('✘ ') +
          chalk.magenta('Unsupported file copied: ') +
          chalk.blue(file.relative),
      )
    }
  }

  /**
   * Convert image file using provided plugins.
   * @param file - The image file to convert.
   * @param plugins - The plugins to use for conversion.
   * @returns The size of the converted image.
   */
  async function transform(file: File, plugins: Plugin[]) {
    const content = file.contents as Uint8Array
    const data = await imagemin.buffer(content, { plugins })

    file.contents = Buffer.from(data)
    return Number(data.length)
  }
}

export { psimage }
export { type WebpOptions, type AvifOptions }
