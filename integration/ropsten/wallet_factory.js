const {Wallet} = require('ethers');

const mnemonics = {
    deployer: 'canvas genre title hero mesh surface section change purity bird simple enrich',
    operator: 'weekend impose display trade degree bounce subway pink winner round decrease salon'
};

module.exports = {
    create: (key, provider) => {
        let wallet;

        if (mnemonics.hasOwnProperty(key)) { // Assume key is named mnemonic
            wallet = Wallet.fromMnemonic(mnemonics[key]);
            wallet.provider = provider;

        } else // Assume key is private key
            wallet = new Wallet(key, provider);

        return wallet;
    }
};

