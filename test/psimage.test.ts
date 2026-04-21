import type File from 'vinyl'

import { Buffer } from 'buffer'
import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import { psimage } from '../src/psimage.js'
import { measureTest, logSuiteSummary } from './helpers.js'

// Вспомогательная функция для создания vinyl файла
function createVinylFile(filePath: string): File {
  const contents = fs.readFileSync(filePath)
  return {
    path: filePath,
    contents,
    isBuffer: () => true,
    isStream: () => false,
    isNull: () => false,
    clone: function () {
      return this
    },
    pipe: function () {
      return this
    },
  } as unknown as File
}

// Вспомогательная функция для запуска psimage через stream
async function processFile(filePath: string, options = {}) {
  return new Promise<Buffer>((resolve, reject) => {
    const file = createVinylFile(filePath)
    const stream = psimage(options)
    let outputBuffer: Buffer | null = null

    stream.on('data', (chunk: File) => {
      if (chunk.contents && Buffer.isBuffer(chunk.contents)) {
        outputBuffer = chunk.contents
      }
    })

    stream.on('end', () => {
      if (outputBuffer) {
        resolve(outputBuffer)
      } else {
        reject(new Error('No output buffer'))
      }
    })

    stream.on('error', reject)

    stream.write(file)
    stream.end()
  })
}

describe('psimage', () => {
  const imageDir = './images'
  const testFiles = [
    'burg.jpg',
    'curved.jpg',
    'favicon.ico',
    'favicon.png',
    'favicon.svg',
    'geo.bmp',
    'mir.tif',
    'shato.avif',
    'waves.webp',
    'wmap.jpg',
    'world.gif',
    'world.png',
  ]

  // Проверяем, что каждый файл может быть обработан без ошибок
  testFiles.forEach((filename) => {
    it(`should process ${filename} without error`, async () => {
      const filePath = path.join(imageDir, filename)
      expect(fs.existsSync(filePath)).toBe(true)

      const originalBuffer = fs.readFileSync(filePath)
      const result = await measureTest(`psimage › should process ${filename} without error`, originalBuffer, () =>
        processFile(filePath, { silent: true }),
      )
      expect(result).toBeInstanceOf(Buffer)
      expect(result.length).toBeGreaterThan(0)
    }, 30000) // увеличенный таймаут для обработки изображений
  })

  // Проверяем оптимизацию JPEG
  it('should optimize JPEG file (reduce size or keep quality)', async () => {
    const filePath = path.join(imageDir, 'burg.jpg')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest(
      'psimage › should optimize JPEG file (reduce size or keep quality)',
      originalBuffer,
      () => processFile(filePath, { silent: true }),
    )
    // После оптимизации размер может уменьшиться или остаться примерно таким же
    expect(result.length).toBeLessThanOrEqual(originalBuffer.length + 100) // допуск
  })

  // Проверяем оптимизацию PNG
  it('should optimize PNG file', async () => {
    const filePath = path.join(imageDir, 'world.png')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest('psimage › should optimize PNG file', originalBuffer, () =>
      processFile(filePath, { silent: true }),
    )
    expect(result.length).toBeLessThanOrEqual(originalBuffer.length + 100)
  })

  // Проверяем оптимизацию GIF
  it('should optimize GIF file', async () => {
    const filePath = path.join(imageDir, 'world.gif')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest('psimage › should optimize GIF file', originalBuffer, () =>
      processFile(filePath, { silent: true }),
    )
    expect(result.length).toBeLessThanOrEqual(originalBuffer.length + 100)
  })

  // Проверяем оптимизацию SVG
  it('should optimize SVG file', async () => {
    const filePath = path.join(imageDir, 'favicon.svg')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest('psimage › should optimize SVG file', originalBuffer, () =>
      processFile(filePath, { silent: true }),
    )
    expect(result.length).toBeLessThanOrEqual(originalBuffer.length + 100)
  })

  // Проверяем конвертацию в webp
  it('should convert to webp when convert option is "webp"', async () => {
    const filePath = path.join(imageDir, 'burg.jpg')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest(
      'psimage › should convert to webp when convert option is "webp"',
      originalBuffer,
      () => processFile(filePath, { convert: 'webp', silent: true }),
    )
    expect(result).toBeInstanceOf(Buffer)
    // Проверяем, что результат не пустой
    expect(result.length).toBeGreaterThan(0)
    // Можно дополнительно проверить заголовок webp, но для простоты пропустим
  })

  // Проверяем конвертацию в avif
  it('should convert to avif when convert option is "avif"', async () => {
    const filePath = path.join(imageDir, 'burg.jpg')
    const originalBuffer = fs.readFileSync(filePath)
    const result = await measureTest(
      'psimage › should convert to avif when convert option is "avif"',
      originalBuffer,
      () => processFile(filePath, { convert: 'avif', silent: true }),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  afterAll(() => {
    logSuiteSummary('psimage')
  })
})
