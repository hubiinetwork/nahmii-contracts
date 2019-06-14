const debug = require('debug')('helpers');

exports.hasArg = (argName) => {
    const arg = `--${argName}`;
    return process.argv.some(a => a == arg);
};

exports.parseStringArg = (argName) => {
    const arg = `--${argName}`;

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == arg) {
            if (i >= process.argv.length + 1)
                throw new Error(`Error: Missing argument for '${arg}'`);

            return process.argv[i + 1];
        }
    }
    throw new Error(`Error: Missing '${arg}' parameter`);
};

exports.parseIntArg = (argName) => {
    const result = parseInt(exports.parseStringArg(argName));
    if (isNaN(result))
        throw new Error(`Error: Non-integer specified in '--${argName}' argument`);
    return result;
};

exports.parseAddressArg = (argName) => {
    let address = exports.parseStringArg(argName);
    if (address.substr(0, 2).toLowerCase() == '0x')
        address = address.substr(2); //remove prefix
    if (!/^[0-9a-f]{40}$/i.test(address))
        throw new Error(`Error: Invalid address specified in '--${argName}' argument`);
    return '0x' + address;
};

exports.parseDeployerArg = () => {
    return exports.parseAddressArg('deployer');
};

exports.parsePasswordArg = () => {
    const password = exports.parseStringArg('password');
    if (0 == password.length)
        throw new Error(`Error: Empty parameter in '--password' argument`);
    return password;
};

exports.parseNetworkArg = () => {
    return exports.parseStringArg('network');
};

exports.unlockAddress = async (web3, address, password, timeoutInSecs) => {
    const personal = web3.eth.personal || web3.personal;
    const succeeded = await personal.unlockAccount(address, password, timeoutInSecs);
    debug(`unlock of address ${address} for ${timeoutInSecs}s: ${succeeded ? 'successful' : 'unsuccessful'}`);
    return succeeded;
};

exports.lockAddress = async (web3, address) => {
    const personal = web3.eth.personal || web3.personal;
    const succeeded = await personal.lockAccount(address);
    debug(`lock of address ${address}: ${succeeded ? 'successful' : 'unsuccessful'}`);
    return succeeded;
};

exports.isTestNetwork = (network) => {
    return (network.includes('develop') || network.includes('ganache'));
};

exports.getFiltersFromArgs = () => {
    let finalFilters = [];

    for (let i = 0; i < process.argv.length; i++) {
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

exports.isResetArgPresent = () => {
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '--reset')
            return true;
    }
    return false;
};

exports.networkIdToName = (id) => {
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

exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

