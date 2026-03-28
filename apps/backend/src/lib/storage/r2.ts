// src/lib/storage/r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import type { Env } from '../../config/env'

export class R2Client {
  private s3: S3Client
  private bucket: string
  private accountId: string

  constructor(env: Env) {
    this.accountId = env.CLOUDFLARE_R2_ACCOUNT_ID
    this.bucket = env.CLOUDFLARE_R2_BUCKET

    this.s3 = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_KEY,
      },
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
    })
  }

  async uploadDesignPreview(fileBuffer: Buffer, designId: string): Promise<string> {
    // Optimize image: 1200x1200 WebP
    const optimized = await sharp(fileBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const key = `designs/preview/${designId}.webp`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: optimized,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=86400',
      })
    )

    return this.getPublicUrl(key)
  }

  async uploadProductTemplate(fileBuffer: Buffer, productId: string): Promise<string> {
    // Keep original quality for product templates
    const key = `products/templates/${productId}.png`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=2592000', // 30 days
      })
    )

    return this.getPublicUrl(key)
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.${this.accountId}.r2.cloudflarestorage.com/${key}`
  }
}
