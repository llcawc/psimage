# psimage

[![GitHub](https://img.shields.io/badge/github-llcawc/psimage-blue)](https://github.com/llcawc/psimage)

Gulp plugin for optimizing and minimizing JPG/PNG/GIF/SVG images, and converting to WebP and AVIF formats. Based on imagemin and sharp.

The plugin uses various image optimization libraries (imagemin, imagemin-gifsicle, imagemin-mozjpeg, imagemin-optipng, imagemin-svgo) and supports formats such as JPG, JPEG, PNG, SVG, and GIF. Conversion to WebP and AVIF formats is performed using sharp. The plugin logs the progress and results of the optimization and conversion process, and provides statistics on the total number of bytes saved and optimized files.

## Install

```sh
npm add -D psimage
```

or with pnpm:

```sh
pnpm add -D psimage
```

or with yarn:

```sh
yarn add -D psimage
```

## Usage

```js
// import modules
import { src, dest, series, watch } from "gulp";
import { psimage } from "psimage";

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

## Options

| Option            | Type                         | Default                                                      | Description                                                                     |
| ----------------- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `mozjpegOptions`  | `object`                     | `{ quality: 75, progressive: true }`                         | Options for the `imagemin-mozjpeg` plugin.                                      |
| `optipngOptions`  | `object`                     | `{ optimizationLevel: 5 }`                                   | Options for the `imagemin-optipng` plugin.                                      |
| `svgoOptions`     | `object`                     | `{ plugins: [{ name: "preset-default" }, "removeViewBox"] }` | Options for the `imagemin-svgo` plugin.                                         |
| `gifsicleOptions` | `object`                     | `{ interlaced: true, optimizationLevel: 1, colors: 256 }`    | Options for the `imagemin-gifsicle` plugin.                                     |
| `avifOptions`     | `AvifOptions`                | `{ quality: 50 }`                                            | AVIF options for the `sharp` plugin.                                            |
| `webpOptions`     | `WebpOptions`                | `{ quality: 50 }`                                            | WebP options for the `sharp` plugin.                                            |
| `convert`         | `'none' \| 'avif' \| 'webp'` | `'none'`                                                     | Enable conversion to AVIF or WebP. If `'none'`, only optimization is performed. |
| `silent`          | `boolean`                    | `false`                                                      | If `true`, the final summary message is disabled.                               |
| `verbose`         | `boolean`                    | `false`                                                      | If `true`, messages are displayed for each processed file.                      |

### Default options

```js
const options = {
  mozjpegOptions: { quality: 75, progressive: true },
  optipngOptions: { optimizationLevel: 5 },
  svgoOptions: { plugins: [{ name: "preset-default" }, "removeViewBox"] },
  gifsicleOptions: { interlaced: true, optimizationLevel: 1, colors: 256 },
  avifOptions: { quality: 50 },
  webpOptions: { quality: 50 },
  convert: "none", // 'none' | 'avif' | 'webp'
  silent: false,
  verbose: false,
};
```

## Notes

- The WebP and AVIF conversion plugins work with TIF, PNG, JPG, GIF, WebP, and AVIF images.
- If the WebP or AVIF plugin is enabled (`convert: 'webp'` or `convert: 'avif'`), the supported files are converted without using other optimization plugins.
- SVG files are always optimized with SVGO, regardless of the `convert` setting.

## License

MIT License. Copyright (c) 2021 pasmurno by [llcawc](https://github.com/llcawc). Made with ❤️ to beautiful architecture.
