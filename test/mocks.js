const {Wallet, utils} = require('ethers');
const ethutil = require('ethereumjs-util');
const {util: {cryptography}} = require('omphalos-commons');

exports.liquidityRoles = ['Maker', 'Taker'];
exports.intentions = ['Buy', 'Sell'];
exports.sidednesses = ['OneSided', 'TwoSided'];
exports.challengePhases = ['Dispute', 'Closed'];
exports.settlementStatuses = ['Qualified', 'Disqualified'];
exports.settlementRoles = ['Origin', 'Target'];

exports.hash0 = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.hash1 = '0x0000000000000000000000000000000000000000000000000000000000000001';
exports.hash2 = '0x0000000000000000000000000000000000000000000000000000000000000002';

exports.address0 = '0x0000000000000000000000000000000000000000';
exports.address1 = '0x0000000000000000000000000000000000000001';
exports.address2 = '0x0000000000000000000000000000000000000002';

let globalNonce = 1;

exports.mockOrder = async (operator, params) => {
    const wallet = Wallet.createRandom();

    const order = exports.mergeDeep({
        nonce: utils.bigNumberify(globalNonce++),
        wallet: wallet.address,
        placement: {
            intention: exports.intentions.indexOf('Buy'),
            amount: utils.parseUnits('1000', 18),
            currencies: {
                intended: {
                    ct: exports.address1,
                    id: utils.bigNumberify(0)
                },
                conjugate: {
                    ct: exports.address2,
                    id: utils.bigNumberify(0)
                }
            },
            rate: utils.bigNumberify(1000),
            residuals: {
                current: utils.parseUnits('400', 18),
                previous: utils.parseUnits('500', 18)
            }
        },
        blockNumber: utils.bigNumberify(0),
        operatorId: utils.bigNumberify(0)
    }, params);

    const operatorSigner = exports.createWeb3Signer(operator);

    const walletSigner = (
        order.wallet === wallet.address ?
            exports.createEthutilSigner(wallet) :
            exports.createWeb3Signer(order.wallet)
    );

    return await exports.augmentOrderSeals(order, operatorSigner, walletSigner);
};

exports.mockTrade = async (operator, params) => {
    const trade = exports.mergeDeep({
        nonce: utils.bigNumberify(globalNonce++),
        amount: utils.parseUnits('100', 18),
        currencies: {
            intended: {
                ct: exports.address1,
                id: utils.bigNumberify(0)
            },
            conjugate: {
                ct: exports.address2,
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
                    operator: cryptography.hash(Wallet.createRandom().address)
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
                        ct: exports.address1,
                        id: utils.bigNumberify(0)
                    }
                },
                total: [
                    {
                        originId: utils.bigNumberify(0),
                        figure: {
                            amount: utils.parseUnits('0.2', 18),
                            currency: {
                                ct: exports.address1,
                                id: utils.bigNumberify(0)
                            }
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
                    operator: cryptography.hash(Wallet.createRandom().address)
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
                        ct: exports.address2,
                        id: utils.bigNumberify(0)
                    }
                },
                total: [
                    {
                        originId: utils.bigNumberify(0),
                        figure: {
                            amount: utils.parseUnits('0.0004', 18),
                            currency: {
                                ct: exports.address2,
                                id: utils.bigNumberify(0)
                            }
                        }
                    }
                ]
            }
        },
        transfers: {
            intended: {
                single: utils.parseUnits('100', 18),
                total: utils.parseUnits('200', 18)
            },
            conjugate: {
                single: utils.parseUnits('0.1', 18),
                total: utils.parseUnits('0.2', 18)
            }
        },
        blockNumber: utils.bigNumberify(0),
        operatorId: utils.bigNumberify(0)
    }, params);

    const operatorSigner = exports.createWeb3Signer(operator);

    return await exports.augmentTradeSeal(trade, operatorSigner);
};

exports.mockPayment = async (operator, params) => {
    const senderWallet = Wallet.createRandom();
    const recipientWallet = Wallet.createRandom();

    const payment = exports.mergeDeep({
        nonce: utils.bigNumberify(globalNonce++),
        amount: utils.parseUnits('100', 18),
        currency: {
            ct: exports.address1,
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
                        ct: exports.address1,
                        id: utils.bigNumberify(0)
                    }
                },
                total: [
                    {
                        originId: utils.bigNumberify(0),
                        figure: {
                            amount: utils.parseUnits('0.2', 18),
                            currency: {
                                ct: exports.address1,
                                id: utils.bigNumberify(0)
                            }
                        }
                    }
                ]
            },
            data: 'some_sender_data'
        },
        recipient: {
            wallet: recipientWallet.address,
            nonce: utils.bigNumberify(1),
            balances: {
                current: utils.parseUnits('19700', 18),
                previous: utils.parseUnits('19600', 18)
            },
            fees: {
                total: [
                    // {
                    //     amount: utils.parseUnits('0.0', 18),
                    //     currency: {
                    //         ct: exports.address1,
                    //         id: utils.bigNumberify(0)
                    //     }
                    // }
                ]
            }
        },
        transfers: {
            single: utils.parseUnits('100', 18),
            total: utils.parseUnits('200', 18)
        },
        blockNumber: utils.bigNumberify(0),
        operator: {
            id: utils.bigNumberify(0),
            data: 'some_operator_data'
        }
    }, params);

    const operatorSigner = exports.createWeb3Signer(operator);

    const walletSigner = (
        payment.sender.wallet === senderWallet.address ?
            exports.createEthutilSigner(senderWallet) :
            exports.createWeb3Signer(payment.sender.wallet)
    );

    return await exports.augmentPaymentSeals(payment, operatorSigner, walletSigner);
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

exports.web3Sign = async (address, hash) => {
    const sig = await web3.eth.sign(address, hash);
    return exports.rpcToStdSig(sig);
};

exports.augmentOrderSeals = async (order, operatorSign, walletSign) => {
    const walletHash = exports.hashOrderAsWallet(order);
    order.seals = {
        wallet: {
            hash: walletHash,
            signature: await walletSign(walletHash)
        },
    };
    const operatorHash = exports.hashOrderAsOperator(order);
    order.seals.operator = {
        hash: operatorHash,
        signature: await operatorSign(operatorHash)
    };
    return order;
};

exports.augmentTradeSeal = async (trade, operatorSign) => {
    const hash = exports.hashTrade(trade);
    trade.seal = {
        hash: hash,
        signature: await operatorSign(hash)
    };
    return trade;
};

exports.augmentPaymentSeals = async (payment, operatorSign, walletSign) => {
    const walletHash = exports.hashPaymentAsWallet(payment);
    payment.seals = {
        wallet: {
            hash: walletHash,
            signature: await walletSign(walletHash)
        }
    };
    const operatorHash = exports.hashPaymentAsOperator(payment);
    payment.seals.operator = {
        hash: operatorHash,
        signature: await operatorSign(operatorHash)
    };
    return payment;
};

exports.hashOrderAsWallet = (order) => {
    const rootHash = cryptography.hash(
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
    return cryptography.hash(rootHash, placementHash);
};

exports.hashOrderAsOperator = (order) => {
    const rootHash = cryptography.hash(
        order.nonce
    );
    const walletSignatureHash = exports.hashSignature(order.seals.wallet.signature);
    const placementResidualsHash = cryptography.hash(
        order.placement.residuals.current,
        order.placement.residuals.previous
    );
    return cryptography.hash(rootHash, walletSignatureHash, placementResidualsHash);
};

exports.hashTrade = (trade) => {
    const rootHash = cryptography.hash(
        trade.nonce,
        trade.amount,
        trade.currencies.intended.ct,
        trade.currencies.intended.id,
        trade.currencies.conjugate.ct,
        trade.currencies.conjugate.id,
        trade.rate
    );
    const buyerHash = exports.hashTradeParty(trade.buyer);
    const sellerHash = exports.hashTradeParty(trade.seller);
    const transfersHash = cryptography.hash(
        trade.transfers.intended.single,
        trade.transfers.intended.total,
        trade.transfers.conjugate.single,
        trade.transfers.conjugate.total
    );
    return cryptography.hash(rootHash, buyerHash, sellerHash, transfersHash);
};

exports.hashTradeParty = (tradeParty) => {
    const rootHash = cryptography.hash(
        tradeParty.nonce,
        tradeParty.wallet,
        tradeParty.rollingVolume,
        {type: 'uint8', value: tradeParty.liquidityRole}
    );
    const orderHash = cryptography.hash(
        tradeParty.order.hashes.wallet,
        tradeParty.order.hashes.operator,
        tradeParty.order.amount,
        tradeParty.order.residuals.current,
        tradeParty.order.residuals.previous
    );
    const balancesHash = cryptography.hash(
        tradeParty.balances.intended.current,
        tradeParty.balances.intended.previous,
        tradeParty.balances.conjugate.current,
        tradeParty.balances.conjugate.previous
    );
    const singleFeeHash = exports.hashFigure(tradeParty.fees.single);
    const totalFeesHash = exports.hashOriginFigures(tradeParty.fees.total);

    return cryptography.hash(rootHash, orderHash, balancesHash, singleFeeHash, totalFeesHash);
};

exports.hashPaymentAsWallet = (payment) => {
    const amountCurrencyHash = cryptography.hash(
        payment.amount,
        payment.currency.ct,
        payment.currency.id
    );
    const senderHash = cryptography.hash(
        payment.sender.wallet,
        payment.sender.data
    );
    const recipientHash = cryptography.hash(
        payment.recipient.wallet
    );

    return cryptography.hash(amountCurrencyHash, senderHash, recipientHash);
};

exports.hashPaymentAsOperator = (payment) => {
    const walletSignatureHash = exports.hashSignature(payment.seals.wallet.signature);
    const senderHash = exports.hashPaymentSenderPartyAsOperator(payment.sender);
    const recipientHash = exports.hashPaymentRecipientPartyAsOperator(payment.recipient);
    const transfersHash = cryptography.hash(
        payment.transfers.single,
        payment.transfers.total
    );
    const operatorHash = cryptography.hash(
        payment.operator.data
    );

    return cryptography.hash(walletSignatureHash, senderHash, recipientHash, transfersHash, operatorHash);
};

exports.hashPaymentSenderPartyAsOperator = (sender) => {
    const rootHash = cryptography.hash(sender.nonce);
    const balancesHash = cryptography.hash(
        sender.balances.current,
        sender.balances.previous
    );
    const singleFeeHash = exports.hashFigure(sender.fees.single);
    const totalFeesHash = exports.hashOriginFigures(sender.fees.total);

    return cryptography.hash(rootHash, balancesHash, singleFeeHash, totalFeesHash);
};

exports.hashPaymentRecipientPartyAsOperator = (recipient) => {
    const rootHash = cryptography.hash(recipient.nonce);
    const balancesHash = cryptography.hash(
        recipient.balances.current,
        recipient.balances.previous
    );
    const totalFeesHash = exports.hashOriginFigures(recipient.fees.total);

    return cryptography.hash(rootHash, balancesHash, totalFeesHash);
};

exports.hashSignature = (signature) => {
    return cryptography.hash(
        {type: 'uint8', value: signature.v},
        signature.r,
        signature.s
    );
};

exports.hashFigure = (figure) => {
    return cryptography.hash(
        figure.amount,
        figure.currency.ct,
        figure.currency.id
    );
};

exports.hashOriginFigures = (originFigures) => {
    let hash = 0;
    for (let i = 0; i < originFigures.length; i++) {
        hash = cryptography.hash(
            hash,
            originFigures[i].originId,
            originFigures[i].figure.amount,
            originFigures[i].figure.currency.ct,
            originFigures[i].figure.currency.id
        );
    }
    return hash;
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
