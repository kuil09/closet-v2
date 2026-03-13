const THUMBNAIL_MAX_SIZE = 200

export function getContainDimensions(width: number, height: number, maxSize: number) {
  if (width <= 0 || height <= 0 || maxSize <= 0) {
    return { width: maxSize, height: maxSize }
  }

  if (width > height) {
    return {
      width: maxSize,
      height: Math.round((height / width) * maxSize),
    }
  }

  return {
    width: Math.round((width / height) * maxSize),
    height: maxSize,
  }
}

export async function createThumbnail(imageBlob: Blob): Promise<Blob> {
  const imageBitmap = await createImageBitmap(imageBlob)

  const { width, height } = getContainDimensions(
    imageBitmap.width,
    imageBitmap.height,
    THUMBNAIL_MAX_SIZE
  )

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageBitmap, 0, 0, width, height)
  imageBitmap.close()

  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 })
}

export async function resizeImage(imageBlob: Blob, maxSize = 1024): Promise<Blob> {
  const imageBitmap = await createImageBitmap(imageBlob)

  const { width, height } = imageBitmap

  if (width <= maxSize && height <= maxSize) {
    imageBitmap.close()
    return imageBlob
  }

  const target = getContainDimensions(width, height, maxSize)

  const canvas = new OffscreenCanvas(target.width, target.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageBitmap, 0, 0, target.width, target.height)
  imageBitmap.close()

  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
}
