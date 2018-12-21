exports.getOwnerAccountFromArgs = function () {
    let i;

    for (i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '--wallet') {
            if (i >= process.argv.length + 1)
                throw new Error('Error: Missing argument for \'--wallet\'');

            let address = process.argv[i + 1];
            if (address.substr(0, 2).toLowerCase() == '0x')
                address = address.substr(2); //remove prefix
            if (!/^[0-9a-f]{40}$/i.test(address))
                throw new Error('Error: Invalid address specified in \'--wallet\' argument');
            return '0x' + address;
        }
    }
    throw new Error('Error: Missing \'--wallet\' parameter');
};

exports.getPasswordFromArgs = function () {
    let i;

    for (i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '--password') {
            if (i >= process.argv.length + 1)
                throw new Error('Error: Missing argument for \'--password\'');

            let password = process.argv[i + 1];
            if (password.length == 0)
                throw new Error('Error: Invalid address specified in \'--password\' argument');
            return password;
        }
    }
    throw new Error('Error: Missing \'--password\' parameter');
};
/*
exports.unlockAddress = function (web3, address, password, timeoutInSecs) {
    web3.personal.unlockAccount(address, password, timeoutInSecs);
};

exports.lockAddress = function (web3, address) {
    web3.personal.lockAccount(address);
};
*/
exports.isTestNetwork = function (network) {
    return (network.includes('develop') || network.includes('ganache'));
};

exports.getFiltersFromArgs = function () {
    let finalFilters = [];
    let i;

    for (i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '--filter') {
            if (i >= process.argv.length + 1)
                throw new Error('Error: Missing argument for \'--filter\'');

            let filter = process.argv[i + 1];
            filter = filter.split(',');
            for (i = 0; i < filter.length; i++) {
                if (!(/^[0-9A-Za-z\*]+$/.test(filter[i])))
                    throw new Error('Error: Invalid filters specified in \'--filter\' argument');
                finalFilters.push(new RegExp('^' + filter[i].replace(/\*/g, '.*') + '$', 'i'));
            }
            break;
        }
    }
    return (finalFilters.length > 0) ? finalFilters : null;
};

exports.isResetArgPresent = function () {
    for (i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '--reset')
            return true;
    }
    return false;
};

exports.networkIdToName = function(id) {
    switch (id) {
        case '1':
            return 'mainnet';
        case '2':
            return 'morden';
        case '3':
            return 'ropsten';
        default:
            return '';
    }
};

exports.sleep = (ms) =>
{
    return new Promise(resolve => setTimeout(resolve, ms));
};

