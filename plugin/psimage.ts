import { Buffer } from 'node:buffer'
import path from 'node:path'
import colors from 'colors'
import prettyBytes from 'pretty-bytes'
import plur from 'plur'
import through2 from 'through2'
import PluginError from 'plugin-error'

import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng from 'imagemin-optipng'
import svgo from 'imagemin-svgo'

/**
 * Minify and clear only png, jpg and svg files - this used imagemin & plugins
 */
export default function gulpImg(
  mozjpegOptions = { quality: 75, progressive: true },
  optipngOptions = { optimizationLevel: 5 },
  svgoOptions = { plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }] },
  silent = false,
  verbose = true
) {
  let totalBytes = 0
  let totalSavedBytes = 0
  let totalFiles = 0

  const plugins = [mozjpeg(mozjpegOptions), optipng(optipngOptions), svgo(svgoOptions)]
  const options = {
    silent,
    verbose,
  }
  const PLUGIN_NAME = 'psimage'
  const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.svg'])

  return through2.obj(
    async function (file, _, cb) {
      // empty
      if (file.isNull()) {
        return cb(null, file)
      }
      // imagemin
      if (file.isBuffer()) {
        try {
          if (!validExtensions.has(path.extname(file.path).toLowerCase())) {
            if (options.verbose) {
              console.log(
                colors.cyan(`${PLUGIN_NAME}: `) +
                  colors.red('✘ ') +
                  colors.magenta('Пропуск неподходящего файла ') +
                  colors.blue(file.relative)
              )
            }
          } else {
            const localPlugins = await Promise.all(plugins)
            const content = <Buffer<ArrayBufferLike>>file.contents
            const data = await imagemin.buffer(content, { plugins: localPlugins })
            const originalSize = content.length
            const optimizedSize = data.length
            const saved = originalSize - optimizedSize
            const percent = originalSize > 0 ? (saved / originalSize) * 100 : 0
            const savedMessage = `saved ${prettyBytes(saved)} - ${percent.toFixed(1).replace(/\.0$/, '')}%`
            const message = saved > 0 ? savedMessage : 'already optimized'

            if (saved > 0) {
              totalBytes += originalSize
              totalSavedBytes += saved
              totalFiles++
            }

            if (options.verbose) {
              console.log(
                colors.cyan.dim(`${PLUGIN_NAME}:`),
                colors.bold.green('🗸 ') + colors.grey(file.relative) + colors.dim.yellow(` (${message})`)
              )
            }

            file.contents = Buffer.from(data)
          }
        } catch (err) {
          const opts = Object.assign({}, mozjpegOptions, optipngOptions, svgoOptions, options, { fileName: file.path })
          const error = new PluginError(PLUGIN_NAME, err as string | Error, opts)
          cb(error)
        }
      }
      cb(null, file)
    },

    function (cb) {
      if (!options.silent) {
        const percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0
        let message = `Minified ${totalFiles} ${plur('image', totalFiles)}`

        if (totalFiles > 0) {
          message += colors.yellow(
            ` (saved ${prettyBytes(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, '')}%)`
          )
        }

        console.log(colors.cyan(`${PLUGIN_NAME}: ${message}`))
      }
      cb()
    }
  )
}
