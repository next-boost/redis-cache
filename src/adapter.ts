import Cache, { CacheOptions } from './'

let cache: Cache

/**
 * Init the redis adapter
 *
 * @param conf the cache's config, with defaults:
 *  - ttl: 3600
 *  - tbd: 3600
 *  - uri: redis://127.0.0.1:6379
 * @returns the redis cache instance
 */
function init(conf?: CacheOptions) {
  cache = new Cache(conf)
  console.log(`  Cache located at ${JSON.stringify(conf)}`)

  return cache
}

/**
 * Stop the purge timer
 */
function shutdown() {
  cache.redis.disconnect(false)
}

export default {
  init,
  shutdown,
}
