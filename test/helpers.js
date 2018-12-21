const BlueBird = require('bluebird');

module.exports.augmentWeb3 = function (web3)
{
	web3.eth.sendTransactionPromise = BlueBird.promisify(web3.eth.sendTransaction);
	web3.eth.getBalancePromise = BlueBird.promisify(web3.eth.getBalance);
	web3.eth.getTransactionPromise = BlueBird.promisify(web3.eth.getTransaction);
	web3.eth.getTransactionReceiptPromise = BlueBird.promisify(web3.eth.getTransactionReceipt);
	web3.eth.getBlockPromise = BlueBird.promisify(web3.eth.getBlock);
};

module.exports.TestCounter = function ()
{
	function TestCounter()
	{
		var testCounter = 0;

		this.next = function()
		{
			testCounter++;
			return 'T' + ('000' + testCounter.toString()).slice(-3);
		}
	}
	return new TestCounter();
};

module.exports.futureEpoch = (futureInSeconds) => {
	return Math.floor(Date.now() / 1000) + futureInSeconds;
};