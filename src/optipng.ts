import { optipng } from 'optipng-neo'

import execBuffer from './exec-buffer.js'
import isPng from './is-png.js'

interface OptiPng {
  optimizationLevel?: number
  bitDepthReduction?: boolean
  colorTypeReduction?: boolean
  paletteReduction?: boolean
  interlaced?: boolean
  errorRecovery?: boolean
}

export default (options: OptiPng = {}) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    options = {
      optimizationLevel: 3,
      bitDepthReduction: true,
      colorTypeReduction: true,
      paletteReduction: true,
      interlaced: false,
      errorRecovery: true,
      ...options,
    }

    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('Expected a buffer')
    }

    if (!isPng(buffer)) {
      return buffer
    }

    const arguments_ = ['-strip', 'all', '-clobber', '-o', String(options.optimizationLevel), '-out', execBuffer.output]

    if (options.errorRecovery) {
      arguments_.push('-fix')
    }

    if (!options.bitDepthReduction) {
      arguments_.push('-nb')
    }

    if (typeof options.interlaced === 'boolean') {
      arguments_.push('-i', options.interlaced ? '1' : '0')
    }

    if (!options.colorTypeReduction) {
      arguments_.push('-nc')
    }

    if (!options.paletteReduction) {
      arguments_.push('-np')
    }

    arguments_.push(execBuffer.input)

    return execBuffer({
      input: buffer,
      bin: optipng,
      args: arguments_,
    })
  }
