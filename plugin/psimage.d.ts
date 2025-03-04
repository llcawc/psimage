/**
 * Minify and clear only png, jpg and svg files - this used imagemin & plugins
 */
export default function gulpImg(mozjpegOptions?: {
    quality: number;
    progressive: boolean;
}, optipngOptions?: {
    optimizationLevel: number;
}, svgoOptions?: {
    plugins: {
        name: string;
        params: {
            overrides: {
                removeViewBox: boolean;
            };
        };
    }[];
}, silent?: boolean, verbose?: boolean): import("stream").Transform;
