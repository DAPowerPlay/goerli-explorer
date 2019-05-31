const blockIndexerTracker = require('./cache/block-indexer-tracker')
const blocks = require('./cache/blocks')
const config = require('../config')
const transactions = require('./cache/transactions')
const accountTransactionsCache = require('./cache/account-tx')
const blockListener = require('./blockListener')
const utils = require('ethers/utils')
const parity = config.providers.parity

class BlockIndexer {

  constructor() {}

  async start () {
    //clear stale data on startup
    await Promise.all([
      blocks.clear(),
      transactions.clear()
    ])
    if (!await this.isSynced()) {
      console.log('Chain syncing or not connected, postponing indexing for 3s...')
      await this._sleep(3000)
      await this.start()
    }
    console.log('Chain synced. Started indexing...')
    await this.indexBlocks()
    console.log('Finished chain indexing')
    blockListener.listen()
  }

  async isSynced () {
    try {
      const syncStatus = await parity.send('eth_syncing', [])
      return syncStatus === false
    } catch (e) {
      return false
    }
  }

  async indexBlocks () {
    let blockNum = (await blockIndexerTracker.getLastIndexedBlock()) + 1
    console.log('Indexing chain from block: ' + blockNum)
    while (true) {
      const block = await parity.send('eth_getBlockByNumber', [utils.hexlify(blockNum), true])
      if (!block) break
      try {
        await this.indexBlock(block)
      } catch (e) {
        console.log(e)
        console.log('Failed to index block ' + blockNum + '. Skipping...')
      }

      blockNum++
    }

  }

  async indexBlock (block) {
    const accounts = {}
    block.transactions.forEach((tx) => {
      if (tx.from) {
        (accounts[tx.from] = accounts[tx.from] || []).push(this._formatTransaction(tx, block.timestamp))
      }
      if (tx.to) {
        (accounts[tx.to] = accounts[tx.to] || []).push(this._formatTransaction(tx, block.timestamp))
      }
    })
    for (const address in accounts) {
      if (accounts.hasOwnProperty(address)) {
        await accountTransactionsCache.addAccountTransactions(address, accounts[address])
      }
    }
    await blockIndexerTracker.setLastIndexedBlock(utils.bigNumberify(block.number).toNumber())
  }

  _formatTransaction (tx, timestamp) {
    return {
      hash: tx.hash,
      block: utils.bigNumberify(tx.blockNumber).toNumber(),
      from: tx.from,
      to: tx.to,
      value: utils.bigNumberify(tx.value).toString(),
      gas: utils.bigNumberify(tx.gas).toString(),
      nonce: utils.bigNumberify(tx.nonce).toNumber(),
      contractAddress: tx.creates,
      timestamp: utils.bigNumberify(timestamp).toNumber()
    }
  }

  _sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

}

module.exports = new BlockIndexer()
