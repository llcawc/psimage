import PluginError from 'plugin-error'
import sharp, { type AvifOptions } from 'sharp'

const defaultAvifOptions = {
  quality: 90,
  lossless: false,
  speed: 5,
  chromaSubsampling: '4:2:0',
} as Partial<AvifOptions>

export default (options: AvifOptions) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    try {
      const mergedOptions = { ...defaultAvifOptions, ...options }
      return await sharp(buffer).avif(mergedOptions).toBuffer()
    } catch (err) {
      const error = err as Error
      throw new PluginError('psimage', error)
    }
  }
