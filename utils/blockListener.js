const config = require('../config')
const blocks = require('./cache/blocks')
const transactions = require('./cache/transactions')
const parity = config.providers.parity;
const utils = require('ethers/utils')

class BlockListener {

  listen() {
    parity.on('block', this.onEachBlock)
  }

  async onEachBlock (blockNumber) {
    const blockIndexer = require('./block-indexer')
    const block = await config.providers.parity.send('eth_getBlockByNumber', [utils.hexlify(blockNumber), true])
    blockIndexer.indexBlock(block)
    blocks.add(block)
    transactions.addAll(block.transactions)
  }
}

module.exports = new BlockListener();
