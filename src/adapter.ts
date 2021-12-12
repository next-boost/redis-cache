import Cache, { CacheOptions } from './'

export class Adapter {
  cache?: Cache
  options: CacheOptions

  /**
   * Init the redis adapter
   *
   * @param conf the cache's config, with defaults:
   *  - ttl: 3600
   *  - tbd: 3600
   *  - uri: redis://127.0.0.1:6379
   * @returns the redis cache instance
   */
  constructor(options?: CacheOptions) {
    this.options = options || {}
  }

  async init() {
    this.cache = new Cache(this.options)
    console.log(`  Redis cache inited: ${JSON.stringify(this.options)}`)
    return this.cache
  }

  async shutdown() {
    if (this.cache) this.cache.redis.disconnect(false)
    console.log('  Redis cache shutdown')
  }
}
