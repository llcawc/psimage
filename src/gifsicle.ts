import { Buffer } from 'node:buffer'

import { gifsicle } from 'gifsicle-neo'

import execBuffer from './exec-buffer.js'
import isGif from './is-gif.js'

interface GifOpt {
  optimizationLevel?: number
  interlaced?: boolean
  colors?: number
}

export default (options: GifOpt = {}) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    options = {
      optimizationLevel: 3,
      interlaced: false,
      colors: 256,
      ...options,
    }
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('Expected a buffer')
    }

    if (!isGif(buffer)) {
      return buffer
    }

    const args: (string | symbol)[] = ['--no-warnings', '--no-app-extensions']

    if (options.interlaced) {
      args.push('--interlace')
    }

    if (options.optimizationLevel) {
      args.push(`--optimize=${options.optimizationLevel}`)
    }

    if (options.colors) {
      args.push(`--colors=${options.colors}`)
    }

    args.push('-o', execBuffer.output)
    args.push(execBuffer.input)

    return execBuffer({
      input: buffer,
      bin: gifsicle,
      args,
    })
  }
