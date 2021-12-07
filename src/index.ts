import Redis from 'ioredis'

type CacheStatus = 'hit' | 'stale' | 'miss'

export interface CacheOptions {
  uri?: string
  ttl?: number
  tbd?: number
}

class Cache {
  redis: Redis.Redis
  ttl = 3600 // time to live
  tbd = 3600 // time before deletion

  constructor({ uri, ttl, tbd }: CacheOptions = {}) {
    try {
      this.redis = new Redis(uri || 'redis://127.0.1:6379')
      if (ttl) this.ttl = ttl
      if (tbd) this.tbd = tbd
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  async set(key: string, value: Buffer, ttl?: number) {
    if (!ttl) ttl = this.ttl

    try {
      const now = new Date().getTime() / 1000
      await this.redis.set(`${key}:ttl`, now + ttl, 'EX', this.tbd)
      await this.redis.setBuffer(key, value, 'EX', this.tbd)
    } catch (e) {
      console.error(e)
    }
  }

  async get(key: string, defaultValue?: Buffer): Promise<Buffer | undefined> {
    try {
      const rv = await this.redis.getBuffer(key)
      if (!rv) return defaultValue
      return rv
    } catch (e) {
      console.error(e)
      return defaultValue
    }
  }

  async has(key: string): Promise<CacheStatus> {
    try {
      const now = new Date().getTime() / 1000
      const rv = await this.redis.get(`${key}:ttl`)
      return !rv ? 'miss' : Number(rv) > now ? 'hit' : 'stale'
    } catch (e) {
      console.error(e)
      return 'miss'
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(key)
      await this.redis.del(`${key}:ttl`)
    } catch (e) {
      console.error(e)
    }
  }
}

export default Cache
