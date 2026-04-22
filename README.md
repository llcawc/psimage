# psimage

[![npm version](https://img.shields.io/npm/v/psimage?style=flat&logo=npm)](https://www.npmjs.com/package/psimage)
[![license](https://img.shields.io/npm/l/psimage?style=flat-square)](https://github.com/llcawc/psimage/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/psimage?style=flat&logo=node.js)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/psimage.svg?style=flat&logo=npm)](https://www.npmjs.com/package/psimage)
[![tests](https://img.shields.io/badge/tests-63%20passed-brightgreen?style=flat-square)](https://github.com/llcawc/psimage/actions)

> A high‑performance Gulp plugin for optimizing JPG, PNG, GIF, SVG images and converting them to modern WebP & AVIF formats. Built on **imagemin** and **sharp** – delivers maximum compression with minimal configuration.

## ✨ Features

- **Lossless optimization** for JPG (MozJPEG), PNG (OptiPNG), GIF (Gifsicle), SVG (SVGO)
- **Modern format conversion** to WebP and AVIF using Sharp
- **Smart pipeline** – automatically skips unsupported files, preserves original format when conversion is disabled
- **Detailed logging** – per‑file stats, total bytes saved, compression ratios
- **Fully configurable** – fine‑tune each optimizer’s settings
- **ESM & CJS support** – works with both `import` and `require`
- **Zero dependencies** on global binaries – everything runs through Node.js

## 🚀 Quick Start

Install as a development dependency:

```bash
npm install --save-dev psimage
# or
pnpm add -D psimage
# or
yarn add -D psimage
```

Add to your Gulpfile:

```js
import { src, dest } from "gulp";
import { psimage } from "psimage";

export function images() {
  return src("src/images/**/*.{jpg,png,gif,svg}")
    .pipe(psimage({ verbose: true }))
    .pipe(dest("dist/images"));
}
```

Run `gulp images` and watch your images shrink.

## 📦 Installation

Make sure you have **Node.js 20 or higher** and **Gulp 5** (or Gulp 4) installed.

```bash
npm install --save-dev gulp psimage
```

## 🛠 Usage

### Basic optimization (no conversion)

```js
import { src, dest } from "gulp";
import { psimage } from "psimage";

function optimizeImages() {
  return src("src/assets/**/*.{jpg,jpeg,png,gif,svg}").pipe(psimage()).pipe(dest("dist/assets"));
}
```

### Convert everything to WebP

```js
function convertToWebP() {
  return src("src/photos/*.{jpg,png,gif}")
    .pipe(psimage({ convert: "webp" }))
    .pipe(dest("dist/photos"));
}
```

### Convert to AVIF with custom quality

```js
function convertToAVIF() {
  return src("src/art/*.{jpg,png}")
    .pipe(
      psimage({
        convert: "avif",
        avifOptions: { quality: 70 },
        verbose: true,
      }),
    )
    .pipe(dest("dist/art"));
}
```

### Watch mode with Gulp

```js
import { watch } from "gulp";

export function watchImages() {
  watch("src/images/**/*", optimizeImages);
}

export const dev = series(optimizeImages, watchImages);
```

## ⚙️ Options

| Option            | Type                         | Default                                                      | Description                                                                                    |
| ----------------- | ---------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `mozjpegOptions`  | `object`                     | `{ quality: 75, progressive: true }`                         | Options passed to [`mozjpeg‑neo`](https://github.com/llcawc/mozjpeg-neo) (MozJPEG compressor). |
| `optipngOptions`  | `object`                     | `{ optimizationLevel: 5 }`                                   | Options for [`optipng‑neo`](https://github.com/llcawc/optipng-neo) (OptiPNG optimizer).        |
| `svgoOptions`     | `SvgOptions`                 | `{ plugins: [{ name: "preset‑default" }, "removeViewBox"] }` | Configuration for [`svgo`](https://github.com/svg/svgo) (SVG optimizer).                       |
| `gifsicleOptions` | `object`                     | `{ interlaced: true, optimizationLevel: 1, colors: 256 }`    | Settings for [`gifsicle‑neo`](https://github.com/llcawc/gifsicle-neo) (GIF optimizer).         |
| `avifOptions`     | `AvifOptions`                | `{ quality: 50 }`                                            | Sharp’s [AVIF encoding options](https://sharp.pixelplumbing.com/api-output/#avif).             |
| `webpOptions`     | `WebpOptions`                | `{ quality: 50 }`                                            | Sharp’s [WebP encoding options](https://sharp.pixelplumbing.com/api-output/#webp).             |
| `convert`         | `'none' \| 'avif' \| 'webp'` | `'none'`                                                     | Enable conversion to AVIF or WebP. If `'none'`, only optimization is performed.                |
| `silent`          | `boolean`                    | `false`                                                      | Disable the final summary message when `true`.                                                 |
| `verbose`         | `boolean`                    | `false`                                                      | Print a log entry for each processed file when `true`.                                         |

### Default configuration

```js
const defaultOptions = {
  mozjpegOptions: { quality: 75, progressive: true },
  optipngOptions: { optimizationLevel: 5 },
  svgoOptions: { plugins: [{ name: "preset‑default" }, "removeViewBox"] },
  gifsicleOptions: { interlaced: true, optimizationLevel: 1, colors: 256 },
  avifOptions: { quality: 50 },
  webpOptions: { quality: 50 },
  convert: "none", // 'none' | 'avif' | 'webp'
  silent: false,
  verbose: false,
};
```

## 📝 Notes

- **WebP & AVIF conversion** works with TIF, PNG, JPG, GIF, WebP, and AVIF source images.
- When `convert` is set to `'webp'` or `'avif'`, the corresponding Sharp plugin handles the file directly; other optimizers are skipped for that file.
- **SVG files** are always optimized with SVGO, regardless of the `convert` setting.
- The plugin preserves the original file extension unless conversion is active (outputs `.webp` or `.avif`).
- All processing is **buffer‑based** – no temporary files are written to disk.

## 🔧 Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/llcawc/psimage.git
cd psimage
pnpm install
```

Run the test suite:

```bash
pnpm test
```

Build the distribution:

```bash
pnpm build
```

## 📄 License

MIT © 2026 [llcawc](https://github.com/llcawc). Made with ❤️ for beautiful architecture and fast websites.

---

_If you find this plugin useful, consider giving it a ⭐ on [GitHub](https://github.com/llcawc/psimage)._
