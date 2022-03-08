import { expect } from 'chai'
import Redis from 'ioredis'

import Cache from '../src'

export const sleep = async (t: number) => {
  return new Promise((resolve) => setTimeout(resolve, t))
}

const configs = [
  {
    uri: process.env.REDIS_URL,
    ttl: 100,
    tbd: 300,
    title: 'redis cache with ttl',
  },
  {
    redis: new Redis.Cluster([
      {
        host: process.env.REDIS_CLUSER_HOST || '127.0.0.1 ',
        port: Number.parseInt(process.env.REDIS_CLUSTER_PORT || '6379'),
      },
    ]),
    ttl: 100,
    tbd: 30,
    title: 'provided redis cluster cache with ttl',
  },
  {
    redis: new Redis(process.env.REDIS_URL),
    ttl: 100,
    tbd: 30,
    title: 'provided redis client cache with ttl',
  },
]

for (const config of configs) {
  describe(config.title, () => {
    let cache: Cache
    const { uri, ttl, tbd, redis } = config
    before(async () => {
      const start = Date.now()
      cache = new Cache({ uri, ttl, tbd, redis })

      await cache.del('miss')
      await cache.del('hit')
      await cache.del('stale')
      const finish = Date.now()
      console.log(`redis startup time: ${finish - start}ms`)
    })

    after(async () => {
      cache.redis.disconnect()
    })

    it('set / get', async () => {
      const v = Buffer.from('B')
      const start = Date.now()
      await cache.set('A', v)
      const finish = Date.now()
      console.log(`set / get time: ${finish - start}ms`)
      expect(await cache.get('A')).to.deep.eq(v)

      const v2 = Buffer.from('AAA')
      await cache.set('A', v2)
      expect(await cache.get('A')).to.deep.eq(v2)

      const defaultValue = Buffer.from('AA')
      expect(await cache.get('B', defaultValue)).to.eq(defaultValue)
    })

    it('set / get stale / hit / miss', async () => {
      const key = 'key:1'
      await cache.set(key, Buffer.from('1'), 0.8)
      let s = await cache.has(key)
      expect(s).to.eq('hit')
      await sleep(1000)
      s = await cache.has(key)
      expect(s).to.eq('stale')
      const v = await cache.get(key)
      expect(v).to.deep.eq(Buffer.from('1'))
      s = await cache.has('key:2')
      expect(s).to.eq('miss')
    })

    it('set / get large buffer', async () => {
      const key1 = 'key:l1'
      const d = new Array(20000).fill('A')
      const buf = Buffer.from(d)
      await cache.set(key1, buf, 0.8)
      expect(await cache.get(key1)).to.deep.eq(buf)
    })

    it('del / get miss', async () => {
      await cache.set('A', Buffer.from('1'))
      expect(await cache.get('A')).to.deep.eq(Buffer.from('1'))
      await cache.del('A')
      expect(await cache.get('A')).to.be.undefined
      await cache.del('not-exist')
    })

    it('inc, count', async () => {
      await cache.inc('miss')
      expect(await cache.count(['miss'])).to.deep.eq([1])

      await cache.inc('hit')
      await cache.inc('miss')
      expect(await cache.count(['miss', 'hit', 'stale'])).to.deep.eq([2, 1, 0])
    })
  })
}
