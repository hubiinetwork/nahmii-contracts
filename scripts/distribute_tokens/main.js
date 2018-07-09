const fs = require('fs');
const path = require('path');
const BlueBird = require('bluebird');

const RevenueToken = artifacts.require("RevenueToken");

var fs_readFilePromise = BlueBird.promisify(fs.readFile);

const MINT_COUNT_PER_ROUND = 100;

//------------------------------------------------------------------------------

var config, state;
var revenueToken;
var addresses = [];

module.exports = function(callback) {

	//read config
	try {
		config = require(__dirname + path.sep + "config.json");
	}
	catch (err) {
		callback(new Error("Unable to read configuration."));
		return;
	}

	//read last processed address
	try {
		state = require(__dirname + path.sep + "state.json");
	}
	catch (err) {
		if (err.code !== 'MODULE_NOT_FOUND') {
			callback(new Error("Unable to read current state."));
			return;
		}
		state = {};
	}

	if (typeof state.nextToProcessIndex !== 'number')
		state.nextToProcessIndex = 0;
	else if (state.nextToProcessIndex < 0)
		state.nextToProcessIndex = 0;

	//check owner setting
	config.owner = validateAddress(config.owner);
	if (!config.owner) {
		callback(new Error("Invalid revenue token owner address."));
		return;
	}

	//check revenue token address setting
	config.revenueTokenAddress = validateAddress(config.revenueTokenAddress);
	if (!config.revenueTokenAddress) {
		callback(new Error("Invalid revenue token address."));
		return;
	}
	revenueToken = RevenueToken.at(config.revenueTokenAddress);

	//check address file setting
	if (typeof config.addressFile !== 'string') {
		callback(new Error("Invalid address filename."));
		return;
	}

	config.addressFile = path.resolve(__dirname, config.addressFile);

	fs_readFilePromise(config.addressFile, { encoding: 'utf8' }).then((contents) => {
		var lines = contents.match(/[^\r\n]+/g);

		lines = lines.filter(lines => lines.length > 0); //filter empty lines

		//for each line, extract address and amount
		for (let i = 0; i < lines.length; i++) {
			var fields = lines[i].split(',');

			if (fields < 2) {
				return Promise.reject(new Error("Invalid address file."));
			}

			fields[0] = validateAddress(superTrim(fields[0]));
			if (!fields[0]) {
				return Promise.reject(new Error("Invalid address found in address file."));
			}

			try {
				fields[1] = new web3.BigNumber(superTrim(fields[1]));
			}
			catch (err) {
				return Promise.reject(new Error("Invalid amount found in address file."));
			}

			//add address to list
			addresses.push({
				address: fields[0],
				amount: fields[1]
			});
		}

		return Promise.resolve();
	}).then(async () => {

		//start minting from last index
		let i = state.nextToProcessIndex;
		while (i < addresses.length) {
			let _to = [];
			let _amounts = [];
			let count = 0;

			while (i < addresses.length && count < MINT_COUNT_PER_ROUND) {
				_to.push(addresses[i].address);
				_amounts.push(addresses[i].amount);
				i++;
				count++;
			}

			try {
				let tx = await revenueToken.multiMint(_to, _amounts, {
					from: config.owner
				});

				//if transaction was sent, update state
				state.nextToProcessIndex = i;
				fs.writeFileSync(__dirname + path.sep + "state.json", JSON.stringify(state), { encoding: 'utf8' });
			}
			catch (err) {
				callback(err);
				return;
			}
		}

		callback();
	}).catch((err) => {
		callback(err);
	});
}

//------------------------------------------------------------------------------

function validateAddress(address)
{
	if (typeof address !== 'string')
		return null;
	if (address.substr(0, 2).toLowerCase() == '0x')
		address = address.substr(2);
	if (!/^[0-9a-f]{40}$/i.test(address))
		return null;
	return '0x' + address;
}

function superTrim(str)
{
	return str.replace(/^\s+|\s+$/gm,'');
}
