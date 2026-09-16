export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_TOTAL_UPLOAD_BYTES = 9 * 1024 * 1024

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function isSupportedImage(file) {
  return supportedImageTypes.has(file?.type)
}
