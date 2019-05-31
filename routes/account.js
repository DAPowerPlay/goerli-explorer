var express = require('express')
var router = express.Router()

var async = require('async')
var Web3 = require('web3')
const config = require('../config')
const parity = config.providers.parity

const accountTxCache = require('../utils/cache/account-tx')
const VerifiedContractsDb = require('../utils/db/contracts')

router.get('/:account', async (req, res) => {

  if (req.params.account.length === 40)
    req.params.account = '0x' + req.params.account

  // not a valid account
  if (req.params.account.length !== 42) {
    var err = new Error('Not valid')
    err.status = 400
    res.render('error', {message: 'Account format not valid.', error: err})
    return
  }

  const currentPage = parseInt(req.query.page) || 1;

  const db = req.app.get('db')

  const account = {
    address: req.params.account
  }


  const [balance, code, source, txCount, transactions] = await Promise.all([
    parity.getBalance(account.address),
    parity.getCode(account.address),
    new VerifiedContractsDb(db).getContractSource(account.address),
    accountTxCache.getTotalAccountTrasactions(account.address.toLowerCase()),
    accountTxCache.getAccountTransactions(account.address.toLowerCase(), currentPage - 1)
  ])

  account.balance = balance

  account.transactions = transactions
  account.total = txCount

  account.code = code
  if (code !== '0x') {
    account.isContract = true
  }

  if (source) {
    account.source = JSON.parse(source)

    account.contractState = []
    if (account.source.abi) {
      const web3 = new Web3()
      web3.setProvider(config.provider)
      const abi = account.source.abi
      const contract = web3.eth.contract(abi).at(req.params.account)
      await new Promise(resolve => {
        async.eachSeries(abi, function (item, eachCallback) {
          if (item.type === 'function' && item.inputs.length === 0 && item.constant) {
            try {
              contract[item.name](function (err, result) {
                account.contractState.push({name: item.name, result: result})
                eachCallback()
              })
            } catch (e) {
              console.log(e)
              eachCallback()
            }
          } else {
            eachCallback()
          }
        }, function () {
          resolve()
        })
      })
    }
  }

  const totalPages = Math.ceil(account.total / 10)

  const firstPage = currentPage - 1 < 1 ? 1 : currentPage - 1;

  const pages = [];

  for(let i = firstPage; i <= totalPages && i <= firstPage + 10; i++) {
    pages.push(i);
  }

  console.log({totalPages})

  res.render('account', {account, currentPage, pages, totalPages})

})

module.exports = router
