import { execFile } from 'node:child_process'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface ExecBufferOptions {
  input: Buffer | Uint8Array
  bin: string
  args: (string | symbol)[]
}

const inputPlaceholder = Symbol.for('exec-buffer.inputPath')
const outputPlaceholder = Symbol.for('exec-buffer.outputPath')

async function execBuffer(options: ExecBufferOptions): Promise<Buffer> {
  const { input, bin, args } = options

  // Создаем временные файлы
  const tempDir = tmpdir()
  const inputPath = join(tempDir, `exec-buffer-input-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const outputPath = join(tempDir, `exec-buffer-output-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  try {
    // Записываем входные данные во временный файл
    await writeFile(inputPath, input)

    // Заменяем плейсхолдеры в аргументах на реальные пути
    const processedArgs = args.map((arg) => {
      if (arg === inputPlaceholder) {
        return inputPath
      }
      if (arg === outputPlaceholder) {
        return outputPath
      }
      return arg as string
    })

    // Запускаем бинарник
    await execFileAsync(bin, processedArgs)

    // Читаем выходной файл
    const outputBuffer = await readFile(outputPath)
    return outputBuffer
  } finally {
    // Удаляем временные файлы, игнорируем ошибки
    try {
      await unlink(inputPath)
    } catch {}
    try {
      await unlink(outputPath)
    } catch {}
  }
}

// Тип для функции со свойствами
type ExecBufferFunction = {
  (options: ExecBufferOptions): Promise<Buffer>
  readonly input: symbol
  readonly output: symbol
}

// Создаем объект с функцией и свойствами
const execBufferWithProps: ExecBufferFunction = Object.assign(execBuffer, {
  input: inputPlaceholder,
  output: outputPlaceholder,
})

// Экспортируем как default
export default execBufferWithProps
