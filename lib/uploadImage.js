import imagekit from '@/configs/imagekit'
import {
  UploadValidationError,
  validateImageUploadBuffer,
  buildSafeUploadFileName,
} from '@/lib/imageValidation'

/**
 * Validate buffer magic bytes and upload to ImageKit with a safe filename.
 * @param {Buffer} buffer
 * @param {{ folder: string, originalName?: string, transformations?: object[] }} options
 */
export async function uploadValidatedImage(buffer, options) {
  const { folder, originalName = 'upload', transformations = [] } = options

  let detectedType
  let safeFileName

  try {
    ;({ detectedType, safeFileName } = validateImageUploadBuffer(buffer))
    safeFileName = buildSafeUploadFileName(detectedType, originalName)
  } catch (error) {
    if (error instanceof UploadValidationError) {
      throw error
    }
    throw new UploadValidationError('Invalid image file')
  }

  const uploadResponse = await imagekit.upload({
    file: buffer,
    fileName: safeFileName,
    folder,
  })

  const optimizedUrl = imagekit.url({
    path: uploadResponse.filePath,
    transformation: transformations,
  })

  return {
    url: optimizedUrl,
    fileId: uploadResponse.fileId,
    detectedType,
  }
}

export { UploadValidationError }
