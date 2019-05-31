const redis = require('./utils/redis')

const LAST_PROCESSED_BLOCK_KEY = 'explorer-last-indexed-key';

class BlockIndexerTracker {

  async getLastIndexedBlock() {
    try {
      return parseInt(await redis.getAsync(LAST_PROCESSED_BLOCK_KEY) || 0);
    } catch (e) {
      console.log(e);
      return 0;
    }
  }

  setLastIndexedBlock(num) {

    return redis.setAsync(LAST_PROCESSED_BLOCK_KEY, num);
  }

}

module.exports = new BlockIndexerTracker();
