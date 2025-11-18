import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Cache Manager - Stores generated mockups to avoid regeneration
 */
export class CacheManager {
  private cacheDir: string
  private enabled: boolean

  constructor(cacheDir: string = '.cache/mockups', enabled: boolean = true) {
    this.cacheDir = path.join(process.cwd(), cacheDir)
    this.enabled = enabled
  }

  /**
   * Generate cache key from generation parameters
   */
  generateKey(templateId: string, designHash: string, configHash?: string): string {
    const parts = [templateId, designHash]
    if (configHash) parts.push(configHash)
    
    return crypto
      .createHash('md5')
      .update(parts.join(':'))
      .digest('hex')
  }

  /**
   * Hash a buffer (for design files)
   */
  hashBuffer(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex')
  }

  /**
   * Hash an object (for config)
   */
  hashObject(obj: any): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
  }

  /**
   * Get cached mockup if exists
   */
  async get(cacheKey: string): Promise<Buffer | null> {
    if (!this.enabled) return null

    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.png`)
      const buffer = await fs.readFile(cachePath)
      return buffer
    } catch (error) {
      return null
    }
  }

  /**
   * Store mockup in cache
   */
  async set(cacheKey: string, buffer: Buffer): Promise<void> {
    if (!this.enabled) return

    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
      const cachePath = path.join(this.cacheDir, `${cacheKey}.png`)
      await fs.writeFile(cachePath, buffer)
    } catch (error) {
      console.error('Failed to cache mockup:', error)
    }
  }

  /**
   * Check if cached version exists
   */
  async has(cacheKey: string): Promise<boolean> {
    if (!this.enabled) return false

    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.png`)
      await fs.access(cachePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Delete specific cached item
   */
  async delete(cacheKey: string): Promise<boolean> {
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.png`)
      await fs.unlink(cachePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      )
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    count: number
    totalSize: number
    oldestFile?: string
    newestFile?: string
  }> {
    try {
      const files = await fs.readdir(this.cacheDir)
      let totalSize = 0
      let oldestTime = Infinity
      let newestTime = 0
      let oldestFile: string | undefined
      let newestFile: string | undefined

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file)
        const stats = await fs.stat(filePath)
        totalSize += stats.size

        if (stats.mtimeMs < oldestTime) {
          oldestTime = stats.mtimeMs
          oldestFile = file
        }
        if (stats.mtimeMs > newestTime) {
          newestTime = stats.mtimeMs
          newestFile = file
        }
      }

      return {
        count: files.length,
        totalSize,
        oldestFile,
        newestFile
      }
    } catch {
      return { count: 0, totalSize: 0 }
    }
  }

  /**
   * Clean old cache entries (older than maxAge in ms)
   */
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const files = await fs.readdir(this.cacheDir)
      const now = Date.now()
      let cleaned = 0

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file)
        const stats = await fs.stat(filePath)

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath)
          cleaned++
        }
      }

      return cleaned
    } catch {
      return 0
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()
