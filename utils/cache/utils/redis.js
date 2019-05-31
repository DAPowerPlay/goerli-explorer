const config = require('../../../config')
const {promisify} = require('util')
const redis = config.redis.client

module.exports = {
  getAsync: promisify(redis['get']).bind(redis),
  setAsync: promisify(redis['set']).bind(redis),
  zrangebyscore: promisify(redis['zrangebyscore']).bind(redis),
  ZREVRANGEBYSCORE: promisify(redis['ZREVRANGEBYSCORE']).bind(redis),
  zcount: promisify(redis['zcount']).bind(redis),
  persist: promisify(redis['bgsave']).bind(redis)
}
