const BlueBird = require('bluebird');

module.exports = (web3) => {
    web3.eth.sendTransactionPromise = BlueBird.promisify(web3.eth.sendTransaction);
    web3.eth.getBalancePromise = BlueBird.promisify(web3.eth.getBalance);
    web3.eth.getTransactionPromise = BlueBird.promisify(web3.eth.getTransaction);
    web3.eth.getTransactionReceiptPromise = BlueBird.promisify(web3.eth.getTransactionReceipt);
    web3.eth.getBlockPromise = BlueBird.promisify(web3.eth.getBlock);
    web3.eth.getBlockNumberPromise = BlueBird.promisify(web3.eth.getBlockNumber);
};
