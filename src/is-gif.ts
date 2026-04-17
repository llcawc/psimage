/**
 * Determines if a given buffer contains a GIF image by checking its magic number.
 *
 * @param buffer - A Uint8Array (or null/undefined) representing the file data.
 * @returns `true` if the buffer starts with the GIF signature (0x47 0x49 0x46), `false` otherwise.
 *
 * @example
 * ```ts
 * const data = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
 * console.log(isGif(data)); // true
 * ```
 */
export default function isGif(buffer: Uint8Array | null | undefined): boolean {
  if (!buffer || buffer.length < 3) {
    return false
  }

  return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
}
