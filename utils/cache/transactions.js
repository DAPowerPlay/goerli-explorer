const CircleList = require('./utils/circle-list')

class TransactionsCache extends CircleList {

  constructor() {
    super('explorer_recent_transactions', 10)
  }

  addAll(transactions) {
    //simulating circle list with 10 elements
    if (!this.redis || transactions.length === 0) return
    const that = this
    transactions.forEach(function (elem, i, arr) {
      arr[i] = JSON.stringify(elem)
    })
    this.redis.lpush(this.redisKey, transactions, function () {
      that.redis.ltrim(that.redisKey, 0, that.max - 1)
    })
  }
}

module.exports = new TransactionsCache()
