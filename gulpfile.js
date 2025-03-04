// gulpfile.js • image minify • pasmurno by llcawc • https://github.com/llcawc

// import modules
import { src, dest, series, watch } from 'gulp'
import { deleteAsync } from 'del'
import imagemin from './plugin/psimage.js'

// images task
function images() {
  return src(['src/**/*.*'], { base: 'src', encoding: false }).pipe(imagemin()).pipe(dest('dist'))
}

// clean task
async function clean() {
  return await deleteAsync(['dist'])
}

// watch
function watcher() {
  watch('src/**/*.{jpg,png,svg}', images)
}

// export
export { clean, images }
export const build = series(clean, images)
export const dev = series(build, watcher)
