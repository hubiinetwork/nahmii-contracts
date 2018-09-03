const {Wallet, utils} = require('ethers');
const ethutil = require('ethereumjs-util');
const cryptography = require('omphalos-commons').util.cryptography;

exports.liquidityRoles = ['Maker', 'Taker'];
exports.intentions = ['Buy', 'Sell'];
exports.driipTypes = ['Trade', 'Payment'];
exports.sidednesses = ['OneSided', 'TwoSided'];
exports.challengePhases = ['Dispute', 'Closed'];
exports.challengeStatuses = ['Unknown', 'Qualified', 'Disqualified'];
exports.challengeCandidateTypes = ['None', 'Order', 'Trade', 'Payment'];

exports.address0 = '0x0000000000000000000000000000000000000000';

let globalNonce = 1;

exports.mockOrder = async (exchange, params) => {
    const wallet = Wallet.createRandom();

    const order = exports.mergeDeep({
        nonce: utils.bigNumberify(globalNonce++),
        wallet: wallet.address,
        placement: {
            intention: exports.intentions.indexOf('Buy'),
            amount: utils.parseUnits('1000', 18),
            currencies: {
                intended: {
                    ct: '0x0000000000000000000000000000000000000001',
                    id: utils.bigNumberify(0)
                },
                conjugate: {
                    ct: '0x0000000000000000000000000000000000000002',
                    id: utils.bigNumberify(0)
                }
            },
            rate: utils.bigNumberify(1000),
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
        nonce: utils.bigNumberify(globalNonce++),
        amount: utils.parseUnits('100', 18),
        currencies: {
            intended: {
                ct: '0x0000000000000000000000000000000000000001',
                id: utils.bigNumberify(0)
            },
            conjugate: {
                ct: '0x0000000000000000000000000000000000000002',
                id: utils.bigNumberify(0)
            }
        },
        rate: utils.bigNumberify(1000),
        buyer: {
            wallet: Wallet.createRandom().address,
            nonce: utils.bigNumberify(1),
            rollingVolume: utils.bigNumberify(0),
            liquidityRole: exports.liquidityRoles.indexOf('Maker'),
            order: {
                amount: utils.parseUnits('1000', 18),
                hashes: {
                    wallet: cryptography.hash(Wallet.createRandom().address),
                    exchange: cryptography.hash(Wallet.createRandom().address)
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
            fees: {
                single: {
                    amount: utils.parseUnits('0.1', 18),
                    currency: {
                        ct: '0x0000000000000000000000000000000000000001',
                        id: utils.bigNumberify(0)
                    }
                },
                net: [
                    {
                        amount: utils.parseUnits('0.2', 18),
                        currency: {
                            ct: '0x0000000000000000000000000000000000000001',
                            id: utils.bigNumberify(0)
                        }
                    }
                ]
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
                    wallet: cryptography.hash(Wallet.createRandom().address),
                    exchange: cryptography.hash(Wallet.createRandom().address)
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
            fees: {
                single: {
                    amount: utils.parseUnits('0.0002', 18),
                    currency: {
                        ct: '0x0000000000000000000000000000000000000002',
                        id: utils.bigNumberify(0)
                    }
                },
                net: [
                    {
                        amount: utils.parseUnits('0.0004', 18),
                        currency: {
                            ct: '0x0000000000000000000000000000000000000002',
                            id: utils.bigNumberify(0)
                        }
                    }
                ]
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
        blockNumber: utils.bigNumberify(0)
    }, params);

    const exchangeSigner = exports.createWeb3Signer(exchange);

    return await exports.augmentTradeSeal(trade, exchangeSigner);
};

exports.mockPayment = async (exchange, params) => {
    const senderWallet = Wallet.createRandom();
    const recipientWallet = Wallet.createRandom();

    const payment = exports.mergeDeep({
        nonce: utils.bigNumberify(globalNonce++),
        amount: utils.parseUnits('100', 18),
        currency: {
            ct: '0x0000000000000000000000000000000000000001',
            id: utils.bigNumberify(0)
        },
        sender: {
            wallet: senderWallet.address,
            nonce: utils.bigNumberify(1),
            balances: {
                current: utils.parseUnits('9399.8', 18),
                previous: utils.parseUnits('9500', 18)
            },
            fees: {
                single: {
                    amount: utils.parseUnits('0.2', 18),
                    currency: {
                        ct: '0x0000000000000000000000000000000000000001',
                        id: utils.bigNumberify(0)
                    }
                },
                net: [
                    {
                        amount: utils.parseUnits('0.2', 18),
                        currency: {
                            ct: '0x0000000000000000000000000000000000000001',
                            id: utils.bigNumberify(0)
                        }
                    }
                ]
            }
        },
        recipient: {
            wallet: recipientWallet.address,
            nonce: utils.bigNumberify(1),
            balances: {
                current: utils.parseUnits('19700', 18),
                previous: utils.parseUnits('19600', 18)
            },
            fees: {
                net: [
                    // {
                    //     amount: utils.parseUnits('0.0', 18),
                    //     currency: {
                    //         ct: '0x0000000000000000000000000000000000000001',
                    //         id: utils.bigNumberify(0)
                    //     }
                    // }
                ]
            }
        },
        transfers: {
            single: utils.parseUnits('100', 18),
            net: utils.parseUnits('200', 18)
        },
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
            cryptography.hash('\x19Ethereum Signed Message:\n32', hash.toString('hex')).slice(2),
            'hex'
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
    const exchangeHash = exports.hashPaymentAsExchange(payment);
    payment.seals.exchange = {
        hash: exchangeHash,
        signature: await exchangeSign(exchangeHash)
    };
    return payment;
};

exports.hashOrderAsWallet = (order) => {
    const globalHash = cryptography.hash(
        order.nonce,
        order.wallet
    );
    const placementHash = cryptography.hash(
        {type: 'uint8', value: order.placement.intention},
        order.placement.amount,
        order.placement.currencies.intended.ct,
        order.placement.currencies.intended.id,
        order.placement.currencies.conjugate.ct,
        order.placement.currencies.conjugate.id,
        order.placement.rate
    );
    return cryptography.hash(globalHash, placementHash);
};

exports.hashOrderAsExchange = (order) => {
    const walletSignatureHash = cryptography.hash(
        {type: 'uint8', value: order.seals.wallet.signature.v},
        order.seals.wallet.signature.r,
        order.seals.wallet.signature.s
    );
    const placementResidualsHash = cryptography.hash(
        order.placement.residuals.current,
        order.placement.residuals.previous
    );
    return cryptography.hash(walletSignatureHash, placementResidualsHash);
};

exports.hashTrade = (trade) => {
    const globalHash = cryptography.hash(
        trade.nonce,
        trade.amount,
        trade.currencies.intended.ct,
        trade.currencies.intended.id,
        trade.currencies.conjugate.ct,
        trade.currencies.conjugate.id,
        trade.rate
    );
    const buyerHash = cryptography.hash(
        trade.buyer.nonce,
        trade.buyer.wallet,
        // TODO Consider adding 'trade.buyer.rollingVolume' and 'trade.buyer.liquidityRole' to hash
        // trade.buyer.rollingVolume,
        // {type: 'uint8', value: trade.buyer.liquidityRole},
        trade.buyer.order.hashes.wallet,
        trade.buyer.order.hashes.exchange,
        trade.buyer.order.amount,
        trade.buyer.order.residuals.current,
        trade.buyer.order.residuals.previous,
        trade.buyer.balances.intended.current,
        trade.buyer.balances.intended.previous,
        trade.buyer.balances.conjugate.current,
        trade.buyer.balances.conjugate.previous,
        trade.buyer.fees.single.currency.ct,
        trade.buyer.fees.single.currency.id,
        trade.buyer.fees.single.amount
        // TODO Consider adding dynamic size 'trade.buyer.fees.net' to hash
        // trade.buyer.fees.net
    );
    const sellerHash = cryptography.hash(
        trade.seller.nonce,
        trade.seller.wallet,
        // TODO Consider adding 'trade.seller.rollingVolume' and 'trade.seller.liquidityRole' to hash
        // trade.seller.rollingVolume,
        // {type: 'uint8', value: trade.seller.liquidityRole},
        trade.seller.order.hashes.wallet,
        trade.seller.order.hashes.exchange,
        trade.seller.order.amount,
        trade.seller.order.residuals.current,
        trade.seller.order.residuals.previous,
        trade.seller.balances.intended.current,
        trade.seller.balances.intended.previous,
        trade.seller.balances.conjugate.current,
        trade.seller.balances.conjugate.previous,
        trade.seller.fees.single.currency.ct,
        trade.seller.fees.single.currency.id,
        trade.seller.fees.single.amount
        // TODO Consider adding dynamic size 'trade.seller.fees.net' to hash
        // trade.seller.fees.net
    );
    const transfersHash = cryptography.hash(
        trade.transfers.intended.single,
        trade.transfers.intended.net,
        trade.transfers.conjugate.single,
        trade.transfers.conjugate.net
    );
    return cryptography.hash(globalHash, buyerHash, sellerHash, transfersHash);
};

exports.hashPaymentAsWallet = (payment) => {
    const amountCurrencyHash = cryptography.hash(
        payment.amount,
        payment.currency.ct,
        payment.currency.id
    );
    const senderHash = cryptography.hash(
        payment.sender.wallet
    );
    const recipientHash = cryptography.hash(
        payment.recipient.wallet
    );

    return cryptography.hash(amountCurrencyHash, senderHash, recipientHash);
};

exports.hashPaymentAsExchange = (payment) => {
    const walletSignatureHash = cryptography.hash(
        {type: 'uint8', value: payment.seals.wallet.signature.v},
        payment.seals.wallet.signature.r,
        payment.seals.wallet.signature.s
    );
    const nonceHash = cryptography.hash(
        payment.nonce
    );
    const senderHash = cryptography.hash(
        payment.sender.nonce,
        payment.sender.balances.current,
        payment.sender.balances.previous,
        payment.sender.fees.single.currency.ct,
        payment.sender.fees.single.currency.id,
        payment.sender.fees.single.amount
        // TODO Consider adding dynamic size 'payment.sender.fees.net' to exchange hash
        // payment.sender.fees.net
    );
    const recipientHash = cryptography.hash(
        payment.recipient.nonce,
        payment.recipient.balances.current,
        payment.recipient.balances.previous
        // TODO Consider adding dynamic size 'payment.recipient.fees.net' to exchange hash
        // payment.recipient.fees.net
    );
    const transfersHash = cryptography.hash(
        payment.transfers.single,
        payment.transfers.net
    );

    return cryptography.hash(walletSignatureHash, nonceHash, senderHash, recipientHash, transfersHash);
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
