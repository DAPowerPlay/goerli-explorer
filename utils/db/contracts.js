class VerifiedContracts {

  constructor (db) {
    this.db = db
  }

  getContractSource (address) {
    return new Promise((resolve) => {
      this.db.get(address.toLowerCase(), function (err, value) {
        if (err) return resolve(null)
        return resolve(value)
      })
    })
  }

}

module.exports = VerifiedContracts;
