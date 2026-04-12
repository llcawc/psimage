import PluginError from 'plugin-error'
import sharp, { type WebpOptions } from 'sharp'

const defaultWebpOptions = {
  quality: 90,
  lossless: false,
} as Partial<WebpOptions>

export default (options: WebpOptions) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    try {
      const mergedOptions = Object.assign({}, defaultWebpOptions, options)
      return await sharp(buffer).webp(mergedOptions).toBuffer()
    } catch (err) {
      const error = err as Error
      throw new PluginError('psimage', error)
    }
  }
