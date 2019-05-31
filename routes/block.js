var express = require('express')
var router = express.Router()

var async = require('async')
var Web3 = require('web3')
var config = require('../config')
var utils = require('ethers/utils')
var format = require('../utils/blockformatter.js')

var Api = require('@parity/api')

router.get('/:block', function (req, res, next) {

  const provider = new Api.Provider.Http(config.rpc.parity)
  const api = new Api(provider)

  Promise
    .all([
      config.providers.parity.send('eth_getBlockByNumber', [utils.bigNumberify(req.params.block).toHexString(), true]),
      api.trace.block(req.params.block)
    ])
    .then(([block, traces]) => {
      if (!block) {
        return next({name: 'BlockNotFoundError', message: 'Block not found!'})
      }

      block.transactions.forEach(function (tx) {
        tx.traces = []
        tx.failed = false
        if (traces != null) {
          traces.forEach(function (trace) {
            if (tx.hash === trace.transactionHash) {
              tx.traces.push(trace)
              if (trace.error) {
                tx.failed = true
                tx.error = trace.error
              }
            }
          })
        }
        // console.log(tx);
      })
      try {
        block = format(block)
        block.signerName = config.names[block.signer]

        res.render('block', {block: block})
      } catch (e) {
        console.log(e)
      }

    })

})

router.get('/uncle/:hash/:number', function (req, res, next) {

  var config = req.app.get('config')
  var web3 = new Web3()
  web3.setProvider(config.provider)

  async.waterfall([
    function (callback) {
      web3.eth.getUncle(req.params.hash, req.params.number, true, function (err, result) {
        callback(err, result)
      })
    }, function (result, callback) {
      if (!result) {
        return next({name: 'UncleNotFoundError', message: 'Uncle not found!'})
      }

      callback(null, result)
    }
  ], function (err, uncle) {
    if (err) {
      return next(err)
    }

    res.render('uncle', {uncle: uncle, blockHash: req.params.hash})
  })

})

module.exports = router
