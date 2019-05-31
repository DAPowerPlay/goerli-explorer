const config = require('../../../config')
const {promisify} = require('util')
const redis = config.redis.client

class CircleList {

  constructor (redisKey, count) {
    this.redisKey = redisKey
    this.max = count
    this.redis = redis;
  }

  add (block) {
    //simulating circle list with 10 elements
    if (!redis) return
    const that = this
    redis.lpush(this.redisKey, JSON.stringify(block), function () {
      redis.ltrim(that.redisKey, 0, that.max - 1)
    })
  }

  clear () {
    if (!redis) return
    return this._asyncCommand('del')(this.redisKey)
  }

  count () {
    if (!redis) return 0
    return this._asyncCommand('llen')(this.redisKey)
  }

  recent () {
    if (!redis) return
    return this._asyncCommand('lrange')(this.redisKey, 0, this.max - 1)
      .then(function (array) {
        array.forEach(function (elem, i, arr) {
          arr[i] = JSON.parse(elem)
        })
        return array
      })
  }

  _asyncCommand (command) {
    return promisify(redis[command]).bind(redis)
  }

}


module.exports = CircleList;

