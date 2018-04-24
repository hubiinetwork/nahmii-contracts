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
