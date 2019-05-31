const config = require('../../config')
const redis = config.redis.client
const redisAsync = require('./utils/redis')

const ACCOUNTS_TXS_PREFIX = 'explorer-accounts-txs-'

class AccountTxCache {

  async addAccountTransactions (address, txs) {
    const multi = redis.multi()
    const setKey = ACCOUNTS_TXS_PREFIX + address.toLowerCase()
    txs.forEach((tx) => {
      multi.zadd(setKey, tx.block, JSON.stringify(tx))
    })
    return await multi.exec()
  }

  getAccountTransactions (address, page = 0, count = 10) {
    try {
      const key = ACCOUNTS_TXS_PREFIX + address
      const offset = page * count
      return redisAsync.ZREVRANGEBYSCORE(key, '+inf', '-inf', 'LIMIT', offset, count)
        .then(array => {
          array.forEach(function (elem, i, arr) {
            arr[i] = JSON.parse(elem)
          })
          return array
        })
    } catch (e) {
      console.log(e)
      return []
    }
  }

  getTotalAccountTrasactions (address) {
    const key = ACCOUNTS_TXS_PREFIX + address
    return redisAsync.zcount(key, '-inf', '+inf')
  }

}

module.exports = new AccountTxCache()
