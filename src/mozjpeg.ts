import { Buffer } from 'node:buffer'

import { mozjpeg } from 'mozjpeg-neo'

import execBuffer from './exec-buffer.js'
import isJpg from './is-jpg.js'

interface MozjpegOptions {
  trellis?: boolean
  trellisDC?: boolean
  overshoot?: boolean
  quality?: number
  progressive?: boolean
  targa?: boolean
  revert?: boolean
  fastCrush?: boolean
  dcScanOpt?: number
  tune?: string
  arithmetic?: boolean
  dct?: string
  quantBaseline?: number
  quantTable?: number
  smooth?: number
  maxMemory?: number
  sample?: number[]
  // Deprecated, handled as errors
  fastcrush?: never
  maxmemory?: never
  notrellis?: never
  noovershoot?: never
}

export default (options: MozjpegOptions = {}) =>
  async (buffer: Uint8Array): Promise<Uint8Array> => {
    const opts = {
      quality: 95,
      progressive: true,
      trellis: true,
      trellisDC: true,
      overshoot: true,
      ...options,
    }

    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('Expected a buffer')
    }

    if (!isJpg(buffer)) {
      return buffer
    }

    // TODO: Remove these sometime far in the future
    if (options.fastcrush) {
      throw new Error('Option `fastcrush` was renamed to `fastCrush`')
    }

    if (options.maxmemory) {
      throw new Error('Option `maxmemory` was renamed to `maxMemory`')
    }

    if (options.notrellis) {
      throw new Error('Option `notrellis` was renamed to `trellis` and inverted')
    }

    if (options.noovershoot) {
      throw new Error('Option `noovershoot` was renamed to `overshoot` and inverted')
    }

    const args: (string | symbol)[] = []

    if (typeof opts.quality !== 'undefined') {
      args.push('-quality', String(opts.quality))
    }

    if (opts.progressive === false) {
      args.push('-baseline')
    }

    if (opts.targa) {
      args.push('-targa')
    }

    if (opts.revert) {
      args.push('-revert')
    }

    if (opts.fastCrush) {
      args.push('-fastcrush')
    }

    if (typeof opts.dcScanOpt !== 'undefined') {
      args.push('-dc-scan-opt', String(opts.dcScanOpt))
    }

    if (!opts.trellis) {
      args.push('-notrellis')
    }

    if (!opts.trellisDC) {
      args.push('-notrellis-dc')
    }

    if (opts.tune) {
      args.push(`-tune-${opts.tune}`)
    }

    if (!opts.overshoot) {
      args.push('-noovershoot')
    }

    if (opts.arithmetic) {
      args.push('-arithmetic')
    }

    if (opts.dct) {
      args.push('-dct', opts.dct)
    }

    if (opts.quantBaseline) {
      args.push('-quant-baseline', String(opts.quantBaseline))
    }

    if (typeof opts.quantTable !== 'undefined') {
      args.push('-quant-table', String(opts.quantTable))
    }

    if (opts.smooth) {
      args.push('-smooth', String(opts.smooth))
    }

    if (opts.maxMemory) {
      args.push('-maxmemory', String(opts.maxMemory))
    }

    if (opts.sample) {
      args.push('-sample', opts.sample.join(','))
    }

    // Добавляем плейсхолдеры для входного и выходного файлов
    args.push('-outfile', execBuffer.output)
    args.push(execBuffer.input)

    return execBuffer({
      input: buffer,
      bin: mozjpeg,
      args,
    })
  }
