/**
 * Determines if a given buffer contains a JPEG image by checking its magic number.
 *
 * @param buffer - A Uint8Array (or null/undefined) representing the file data.
 * @returns `true` if the buffer starts with the JPEG signature (0xFF 0xD8 0xFF), `false` otherwise.
 *
 * @example
 * ```ts
 * const data = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
 * console.log(isJpg(data)); // true
 * ```
 */
export default function isJpg(buffer: Uint8Array | null | undefined): boolean {
  if (!buffer || buffer.length < 3) {
    return false
  }

  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
}
