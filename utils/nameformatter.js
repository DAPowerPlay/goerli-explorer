
function nameFormatter(config) {
  this.conf = config;

  this.format = function(address) {
    if (this.conf.names[address.toLowerCase()]) {
      return this.conf.names[address.toLowerCase()];
    } else {
      return address;
    }
  }
}
module.exports = nameFormatter;
