# psimage

gulp plugin for jpg/png/svg image optimization and minify. based on imagemin.

install:

```bash
npm add -D psimage
```

sample:

```js
import { src, dest, series, watch } from "gulp";
import imagemin from "psimage";

// images task
function images() {
  return src(["src/**/*.*"], { base: "src", encoding: false }).pipe(imagemin()).pipe(dest("dist"));
}

// watch
function watcher() {
  watch("src/**/*.{jpg,png,svg}", images);
}

// export
export { images };
export const dev = series(images, watcher);
```

options:

```ts
imagemin( mozjpegOptions?: {}, optipngOptions?: {}, svgoOptions?: {}, silent?: boolean, verbose?: boolean )
```

default options:

```js
imagemin(
  (mozjpegOptions = { quality: 75, progressive: true }),
  (optipngOptions = { optimizationLevel: 5 }),
  (svgoOptions = { plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false } } }] }),
  (silent = false),
  (verbose = true)
);
```

---

MIT License. ©2025 pasmurno by [llcawc](https://github.com/llcawc). Made with <span style="color:red;">❤</span> to beautiful architecture
