# psimage

gulp plugin for optimizing and minimizing jpg/png/gif/svg images and for converting to webp and avif formats. based on imagemin.

The plugin uses various image optimization libraries such as imagemin, imagemin-gifsicle, imagemin-mozjpeg, imagemin-optipng, imagemin-svgo, imagemin-avif, imagemin-webp and supports various image formats such as jpg, jpeg, png, svg and gif. Conversion to webp and avif formats is also supported. The plugin logs the progress and results of the optimization and conversion process, as well as provides statistics on the total number of bytes saved and optimized files.

install:

```sh
npm add -D psimage
```

sample:

```js
// import modules
import { src, dest, series, watch } from "gulp";
import psimage from "psimage";

// Options for image optimization and conversion
const options = { verbose: true };

// images task
function images() {
  return src(["src/images/**/*.*"], { base: "src", encoding: false })
    .pipe(psimage(options))
    .pipe(dest("dist"));
}

// watch
function watcher() {
  watch("src/**/*.*", images);
}

// export
export { images };
export const dev = series(images, watcher);
```

Options for image optimization and conversion:

- mozjpegOptions - Options for the "imagemin-mozjpeg" plugin.
- optipngOptions - Options for the "imagemin-optipng" plugin.
- svgoOptions - Options for the "imagemin-svgo" plugin.
- gifsicleOptions - Options for the "imagemin-gifsicle" plugin.
- avifOptions - Options for the "imagemin-avif" plugin.
- webpOptions - Options for the "imagemin-webp" plugin.
- convert - Options for enabling conversion using 'avif' or 'webp' plugins.
- silent - If true, the final message with the calculation of savings is disabled.
- verbose - If true, messages are displayed for each file.

```js
// default options:
const options = {
  mozjpegOptions: { quality: 75, progressive: true }
  optipngOptions: { optimizationLevel: 5 }
  svgoOptions: { plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }], }
  gifsicleOptions: { interlaced: true, optimizationLevel: 1, colors: 256 }
  avifOptions: { quality: 50 }
  webpOptions: { quality: 50 }
  convert: 'none', // types: 'none' | 'avif' | 'webp' | undefined
  silent: false,   // types: boolean | undefined
  verbose: false,  // types: boolean | undefined
}
```
- Plugins webp for file conversion work with tif, png, jpg, and webp images.
- Plugins avif for file conversion work with tif, png, jpg, gif, webp and avif images.
- If the webp or avif plugins is enabled, the files they support are converted without using other plugins.

---

MIT License. ©2025 pasmurno by [llcawc](https://github.com/llcawc). Made with <span style="color:red;">❤</span> to beautiful architecture
