// gulpfile.js • image • pasmurno by llcawc • https://github.com/llcawc

// import modules
import { deleteAsync } from 'del'
import { dest, series, src, watch } from 'gulp'
import psimage from './index.js'

// default options:
const options = {
  mozjpegOptions: { quality: 75, progressive: true },
  optipngOptions: { optimizationLevel: 5 },
  svgoOptions: { plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }] },
  gifsicleOptions: { interlaced: true, optimizationLevel: 1, colors: 256 },
  avifOptions: { quality: 50 },
  webpOptions: { quality: 50 },
  convert: 'avif', // types: 'none' | 'avif' | 'webp' | undefined
  silent: false, // types: boolean | undefined
  verbose: true, // types: boolean | undefined
}

// images task
// prettier-ignore
function images() {
  return src(['images/**/*.*'], { base: 'images', encoding: false })
    .pipe(psimage(options))
    .pipe(dest('dist'))
}

// clean task
async function clean() {
  return await deleteAsync(['dist'])
}

// watch
function watcher() {
  watch('images/**/*.*', images)
}

// export
export { clean, images }
export const build = series(clean, images)
export const dev = series(build, watcher)
