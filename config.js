var web3 = require('web3')
var redis = require('redis')
var names = require('./names/names.json')
const ethers = require('ethers')

var config = {
  logFormat: 'combined',
  rpc: {
    parity: process.env.RPC_URL_PARITY || 'http://parity-rpc:8545',
  },
  get rpcPath () {
    return this.rpc.parity
  },
  get provider () {
    return new web3.providers.HttpProvider(this.rpc.parity)
  },
  cache: process.env.CACHE_DRIVER || null,
  redis: {
    url: process.env.REDIS_URL
  },
  providers: {},
  bootstrapUrl: process.env.BOOTSTRAP_URL || 'https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/simplex/bootstrap.min.css',
  explorerName: 'Lisinski Block Explorer',
  legalNoticeLink: 'https://github.com/hpoa/lisinski-explorer/blob/master/LICENSE',
  names: names
}

config.providers.parity = new ethers.providers.JsonRpcProvider(config.rpc.parity)

if (config.cache === 'redis') {
  config.redis.client = redis.createClient(config.redis.url)
  config.redis.client.on('error', function (error) {
    console.log('Redis error: ' + error);
  })
}

module.exports = config
