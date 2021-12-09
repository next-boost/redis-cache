[![Coverage Status](https://coveralls.io/repos/github/@next-boost/redis-cache/badge.svg?branch=master)](https://coveralls.io/github/next-boost/redis-cache?branch=master) [![Maintainability](https://api.codeclimate.com/v1/badges/853b19631069cf943e89/maintainability)](https://codeclimate.com/github/next-boost/redis-cache/maintainability)

# redis-cache

A redis-based cache for next-boost. If you have a cluster of next-boost running, using this plugin to share the cache between instances.

```bash
npm i @next-boost/redis-cache
```

## Usage

```javascript
// in .next-boost.js
const RedisCache = require('@next-boost/redis-cache/dist/adapter').default

module.exports = {
  cacheAdapter: RedisCache.init({
    uri: 'redis://<your-host>/<db>',
    ttl: 15,
    tbd: 3600,
  }),
  rules: [
    ...
  ],
}
```

## License

MIT. Copyright 2020, Rakuraku Jyo.
