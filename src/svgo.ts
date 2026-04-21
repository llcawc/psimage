import { Buffer } from 'node:buffer'
import { TextDecoder } from 'node:util'

import isSvg from 'is-svg'
import PluginError from 'plugin-error'
import { optimize, type Config as SvgOptions } from 'svgo'

const defaultSvgoOptions = {
  multipass: true,
} as SvgOptions

export default (options: SvgOptions = {}) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    try {
      const mergedOptions = { ...defaultSvgoOptions, ...options }
      const contents = new TextDecoder().decode(buffer)

      if (!isSvg(contents)) {
        return buffer
      }

      const { data } = optimize(contents, mergedOptions)
      return Buffer.from(data)
    } catch (err) {
      const error = err as Error
      throw new PluginError('psimage', error)
    }
  }
