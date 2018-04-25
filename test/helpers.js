module.exports.augmentWeb3 = function (web3)
{
	web3.eth.sendTransactionPromise = function(transactionObject) {
		return new Promise((resolve, reject) => {
			web3.eth.sendTransaction(transactionObject, function (err) {
				if (!err)
					resolve();
				else
					reject(err);
			});
		});
	}

	web3.eth.getBalancePromise = function(addressHexString) {
		return new Promise((resolve, reject) => {
			web3.eth.getBalance(addressHexString, function (err, balance) {
				if (!err)
					resolve(balance);
				else
					reject(err);
			});
		});
	}
}

module.exports.TestCounter = function ()
{
	function TestCounter()
	{
		var testCounter = 0;

		this.next = function()
		{
			testCounter++;
			return "T" + ("000" + testCounter.toString()).slice(-3);
		}
	}
	return new TestCounter();
}