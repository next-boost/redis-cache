import { expect } from 'chai'

import Cache from '../src'

export const sleep = async (t: number) => {
  return new Promise((resolve) => setTimeout(resolve, t))
}

describe('redis cache with ttl', () => {
  let cache: Cache

  it('init', () => {
    cache = new Cache({ uri: process.env.REDIS_URL, ttl: 100, tbd: 300 })
  })

  after(async () => {
    cache.redis.disconnect()
  })

  it('set / get', async () => {
    const v = Buffer.from('B')
    await cache.set('A', v)
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
})
