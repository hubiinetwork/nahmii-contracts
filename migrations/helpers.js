exports.getOwnerAccountFromArgs = function ()
{
	var i;

	for (i = 0; i < process.argv.length; i++) {
		if (process.argv[i] == '--wallet') {
			if (i >= process.argv.length + 1)
				throw new Error('Error: Missing argument for \'--wallet\'');

			var address = process.argv[i + 1];
			if (address.substr(0, 2).toLowerCase() == '0x')
				address = address.substr(2); //remove prefix
			if (!/^[0-9a-f]{40}$/i.test(address))
				throw new Error('Error: Invalid address specified in \'--wallet\' argument');
			return '0x' + address;
		}
	}
	throw new Error('Error: Missing \'--wallet\' parameter');
};

exports.getPasswordFromArgs = function ()
{
	var i;

	for (i = 0; i < process.argv.length; i++) {
		if (process.argv[i] == '--password') {
			if (i >= process.argv.length + 1)
				throw new Error('Error: Missing argument for \'--password\'');

			var password = process.argv[i + 1];
			if (password.length == 0)
				throw new Error('Error: Invalid address specified in \'--password\' argument');
			return password;
		}
	}
	throw new Error('Error: Missing \'--password\' parameter');
};

exports.unlockAddress = function (web3, address, password, timeoutInSecs)
{
	web3.personal.unlockAccount(address, password, timeoutInSecs);
};

exports.isTestNetwork = function (network)
{
	return (network.includes('develop') || network.includes('ganache'));
};
