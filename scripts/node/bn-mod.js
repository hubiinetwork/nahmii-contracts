const BN = require('bn.js');

BN.prototype.isPos = function() {
    return !this.isNeg() && !this.isZero();
};

module.exports = BN;