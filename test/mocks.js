const ethers = require('ethers');
const ethutil = require('ethereumjs-util');
const keccak256 = require("augmented-keccak256");

const Wallet = ethers.Wallet;
const utils = ethers.utils;

exports.liquidityRoles = ['Maker', 'Taker'];
exports.intentions = ['Buy', 'Sell'];
exports.dealTypes = ['Trade', 'Payment'];
exports.sidednesses = ['OneSided', 'TwoSided'];
exports.challengePhases = ['Dispute', 'Closed'];
exports.challengeStatuses = ['Unknown', 'Qualified', 'Disqualified'];
exports.challengeCandidateTypes = ['None', 'Order', 'Trade', 'Payment'];

exports.mockOrder = async (exchange, params) => {
    const wallet = Wallet.createRandom();

    const order = exports.mergeDeep({
        nonce: utils.bigNumberify(1),
        wallet: wallet.address,
        placement: {
            intention: exports.intentions.indexOf('Buy'),
            immediateSettlement: true,
            amount: utils.parseUnits('100', 18),
            rate: utils.bigNumberify(1000),
            currencies: {
                intended: '0x0000000000000000000000000000000000000001',
                conjugate: '0x0000000000000000000000000000000000000002'
            },
            residuals: {
                current: utils.parseUnits('400', 18),
                previous: utils.parseUnits('500', 18)
            }
        },
        blockNumber: utils.bigNumberify(0)
    }, params);

    const exchangeSigner = exports.createWeb3Signer(exchange);

    const walletSigner = (
        order.wallet === wallet.address ?
            exports.createEthutilSigner(wallet) :
            exports.createWeb3Signer(order.wallet)
    );

    return await exports.augmentOrderSeals(order, exchangeSigner, walletSigner);
};

exports.mockTrade = async (exchange, params) => {
    const trade = exports.mergeDeep({
        nonce: utils.bigNumberify(1),
        immediateSettlement: true,
        amount: utils.parseUnits('100', 18),
        rate: utils.bigNumberify(1000),
        currencies: {
            intended: '0x0000000000000000000000000000000000000001',
            conjugate: '0x0000000000000000000000000000000000000002'
        },
        buyer: {
            wallet: Wallet.createRandom().address,
            nonce: utils.bigNumberify(1),
            rollingVolume: utils.bigNumberify(0),
            liquidityRole: exports.liquidityRoles.indexOf('Maker'),
            order: {
                amount: utils.parseUnits('1000', 18),
                hashes: {
                    wallet: Wallet.createRandom().address,
                    exchange: Wallet.createRandom().address
                },
                residuals: {
                    current: utils.parseUnits('400', 18),
                    previous: utils.parseUnits('500', 18)
                }
            },
            balances: {
                intended: {
                    current: utils.parseUnits('9599.8', 18),
                    previous: utils.parseUnits('9499.9', 18)
                },
                conjugate: {
                    current: utils.parseUnits('9.4', 18),
                    previous: utils.parseUnits('9.5', 18)
                }
            },
            netFees: {
                intended: utils.parseUnits('0.2', 18),
                conjugate: utils.parseUnits('0.0', 18)
            }
        },
        seller: {
            wallet: Wallet.createRandom().address,
            nonce: utils.bigNumberify(1),
            rollingVolume: utils.bigNumberify(0),
            liquidityRole: exports.liquidityRoles.indexOf('Taker'),
            order: {
                amount: utils.parseUnits('1000', 18),
                hashes: {
                    wallet: Wallet.createRandom().address,
                    exchange: Wallet.createRandom().address
                },
                residuals: {
                    current: utils.parseUnits('600', 18),
                    previous: utils.parseUnits('700', 18)
                }
            },
            balances: {
                intended: {
                    current: utils.parseUnits('19500', 18),
                    previous: utils.parseUnits('19600', 18)
                },
                conjugate: {
                    current: utils.parseUnits('19.6996', 18),
                    previous: utils.parseUnits('19.5998', 18)
                }
            },
            netFees: {
                intended: utils.parseUnits('0.0', 18),
                conjugate: utils.parseUnits('0.0004', 18)
            }
        },
        transfers: {
            intended: {
                single: utils.parseUnits('100', 18),
                net: utils.parseUnits('200', 18)
            },
            conjugate: {
                single: utils.parseUnits('0.1', 18),
                net: utils.parseUnits('0.2', 18)
            }
        },
        singleFees: {
            intended: utils.parseUnits('0.1', 18),
            conjugate: utils.parseUnits('0.0002', 18)
        },
        blockNumber: utils.bigNumberify(0)
    }, params);

    const exchangeSigner = exports.createWeb3Signer(exchange);

    return await exports.augmentTradeSeal(trade, exchangeSigner);
};

exports.mockPayment = async (exchange, params) => {
    const senderWallet = Wallet.createRandom();
    const recipientWallet = Wallet.createRandom();

    const payment = exports.mergeDeep({
        nonce: utils.bigNumberify(1),
        immediateSettlement: true,
        amount: utils.parseUnits('100', 18),
        currency: '0x0000000000000000000000000000000000000001',
        sender: {
            wallet: senderWallet.address,
            nonce: utils.bigNumberify(1),
            balances: {
                current: utils.parseUnits('9399.8', 18),
                previous: utils.parseUnits('9500', 18)
            },
            netFee: utils.parseUnits('0.2', 18)
        },
        recipient: {
            wallet: recipientWallet.address,
            nonce: utils.bigNumberify(1),
            balances: {
                current: utils.parseUnits('19700', 18),
                previous: utils.parseUnits('19600', 18)
            },
            netFee: utils.parseUnits('0.0', 18)
        },
        transfers: {
            single: utils.parseUnits('100', 18),
            net: utils.parseUnits('200', 18)
        },
        singleFee: utils.parseUnits('0.2', 18),
        blockNumber: utils.bigNumberify(0)
    }, params);

    const exchangeSigner = exports.createWeb3Signer(exchange);

    const walletSigner = (
        payment.sender.wallet === senderWallet.address ?
            exports.createEthutilSigner(senderWallet) :
            exports.createWeb3Signer(payment.sender.wallet)
    );

    return await exports.augmentPaymentSeals(payment, exchangeSigner, walletSigner);
};

exports.mergeDeep = (target, sender) => {
    if (isObject(target) && isObject(sender)) {
        Object.keys(sender).forEach(key => {
            if (isObject(sender[key])) {
                if (!target[key])
                    Object.assign(target, {[key]: {}});
                exports.mergeDeep(target[key], sender[key]);
            } else {
                Object.assign(target, {[key]: sender[key]});
            }
        });
    }
    return target;
};

// https://ethereum.stackexchange.com/questions/44735/sign-data-with-private-key-inside-a-truffle-test-file?rq=1
exports.createEthutilSigner = (wallet) => {
    return async (hash) => {
        const prefixedHash = new Buffer(
            exports.hashTyped(
                {value: '\x19Ethereum Signed Message:\n32', type: 'string'},
                {value: hash.toString('hex'), types: 'hex'}
            ).slice(2), 'hex'
        );
        const sig = ethutil.ecsign(prefixedHash, new Buffer(wallet.privateKey.slice(2), 'hex'));
        return exports.ethutilToStdSig(sig)
    };
};

exports.createWeb3Signer = (address) => {
    return async (hash) => {
        const sig = await web3.eth.sign(address, hash);
        return exports.rpcToStdSig(sig);
    };
};

exports.augmentOrderSeals = async (order, exchangeSign, walletSign) => {
    const walletHash = exports.hashOrderAsWallet(order);
    order.seals = {
        wallet: {
            hash: walletHash,
            signature: await walletSign(walletHash)
        },
    };
    const exchangeHash = exports.hashOrderAsExchange(order);
    order.seals.exchange = {
        hash: exchangeHash,
        signature: await exchangeSign(exchangeHash)
    };
    return order;
};

exports.augmentTradeSeal = async (trade, exchangeSign) => {
    const hash = exports.hashTrade(trade);
    trade.seal = {
        hash: hash,
        signature: await exchangeSign(hash)
    };
    return trade;
};

exports.augmentPaymentSeals = async (payment, exchangeSign, walletSign) => {
    const walletHash = exports.hashPaymentAsWallet(payment);
    payment.seals = {
        wallet: {
            hash: walletHash,
            signature: await walletSign(walletHash)
        }
    };
    // TODO Replace wallet hasher with exchange hasher
    const exchangeHash = exports.hashPaymentAsExchange(payment);
    // const exchangeHash = exports.hashPaymentAsWallet(payment);
    payment.seals.exchange = {
        hash: exchangeHash,
        signature: await exchangeSign(exchangeHash)
    };
    return payment;
};

exports.hashOrderAsWallet = (order) => {
    return exports.hashString(
        order.nonce.toNumber()
    );
};

exports.hashOrderAsExchange = (order) => {
    return exports.hashTyped(
        {value: order.placement.residuals.current.toHexString(), type: 'hex'},
        {value: order.placement.residuals.previous.toHexString(), type: 'hex'},
        {value: exports.stdToRpcSig(order.seals.wallet.signature), type: 'string'}
    );
};

exports.hashTrade = (trade) => {
    return exports.hashString(
        trade.nonce.toNumber()
    );
};

exports.hashPaymentAsWallet = (payment) => {
    return exports.hashString(
        payment.nonce.toNumber()
    );
};

exports.hashPaymentAsExchange = (payment) => {
    return exports.hashString(
        payment.nonce.toNumber()
    );
    // return exports.hashTyped(
    //     {value: exports.stdToRpcSig(payment.seals.wallet.signature), type: 'string'}
    // );
    // TODO Try alternative below
    // return `0x${ethutil.keccak(exports.stdToRpcSig(payment.seals.wallet.signature).slice(2)).toString('hex')}`;
};

exports.hashString = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d));
    return `0x${hasher.digest()}`;
};

exports.hashTyped = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d.value, d.type));
    return `0x${hasher.digest()}`;
};

exports.ethutilToStdSig = (sig) => {
    return {
        v: utils.bigNumberify(sig.v),
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`
    };
};

exports.rpcToStdSig = (sig) => {
    sig = ethutil.fromRpcSig(sig);
    return exports.ethutilToStdSig(sig);
};

exports.stdToEthutilSig = (sig) => {
    return {
        v: sig.v.toNumber(),
        r: Buffer.from(sig.r.slice(2), 'hex'), // TODO Try ethutil.toBuffer instead
        s: Buffer.from(sig.s.slice(2), 'hex')
    }
};

exports.stdToRpcSig = (sig) => {
    sig = exports.stdToEthutilSig(sig);
    return ethutil.toRpcSig(sig.v, sig.r, sig.s);
};

const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
};
