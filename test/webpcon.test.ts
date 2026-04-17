import { describe, it, expect } from 'vitest'
import webpcon from '../src/webpcon.ts'
import fs from 'fs'
import path from 'path'

describe('webpcon', () => {
  const imageDir = './images'

  // Тестируем конвертацию JPEG в WebP
  it('should convert JPEG to WebP', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = webpcon({ quality: 75 })
    const result = await plugin(buffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // WebP обычно меньше JPEG
    expect(result.length).toBeLessThan(buffer.length)
  })

  // Тестируем конвертацию PNG в WebP
  it('should convert PNG to WebP', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = webpcon({ quality: 75 })
    const result = await plugin(buffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем конвертацию GIF в WebP
  it('should convert GIF to WebP', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = webpcon({ quality: 75 })
    const result = await plugin(buffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем конвертацию AVIF в WebP
  it('should convert AVIF to WebP', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'shato.avif'))
    const plugin = webpcon({ quality: 75 })
    const result = await plugin(buffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем обработку WebP (может быть перекодирован, но должен остаться валидным)
  it('should process WebP and return valid buffer', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'waves.webp'))
    const plugin = webpcon({ quality: 75 })
    const result = await plugin(buffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })
})
