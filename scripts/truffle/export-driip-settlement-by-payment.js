/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_driip_settlement_by_payment');

const DriipSettlementByPayment = artifacts.require('DriipSettlementByPayment');

let web3DriipSettlementByPayment, ethersDriipSettlementByPayment;

const rootDir = 'state/export/DriipSettlementByPayment';
const fromBlock = 0;

const iface = new utils.Interface(DriipSettlementByPayment.abi);

async function parseLogs(eventName) {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementByPayment.interface.events[eventName].topic],
        fromBlock,
        address: ethersDriipSettlementByPayment.address
    });
    debug(`# ${eventName}: ${logs.length}`);
    return Promise.all(logs.map(async (log) => ({
        values: iface.parseLog(log).values,
        blockNumber: log.blockNumber,
        blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp
    })));
}

async function writeJSON(data, fileName) {
    if (!data || !data.length)
        return;

    await fs.mkdir(rootDir, {recursive: true});

    await fs.writeFile(
        `${rootDir}/${ethersDriipSettlementByPayment.address}-${fileName}.json`,
        JSON.stringify(
            data,
            null, 2
        )
    );
}

async function exportSettlePayment() {
    const logs = await parseLogs('SettlePaymentEvent');

    function totalFees(partyFeesTotal) {
        if (!partyFeesTotal)
            return [];
    }

    return writeJSON(logs.map(log => {
        const d = {
            wallet: log.values.wallet.toLowerCase(),
            blockNumber: log.blockNumber,
            blockTimestamp: log.blockTimestamp
        };

        if (!log.values.payment[1].length) // Old schema, 1.1 on mainnet
            d.data = {
                amount: log.values.payment[1].toString(),
                currency: {
                    ct: log.values.payment[2][0].toLowerCase(),
                    id: log.values.payment[2][1].toNumber()
                },
                sender: {
                    nonce: log.values.payment[3][0].toNumber(),
                    wallet: log.values.payment[3][1].toLowerCase(),
                    balances: {
                        current: log.values.payment[3][2][0].toString(),
                        previous: log.values.payment[3][2][1].toString()
                    },
                    fees: {
                        single: {
                            amount: log.values.payment[3][3][0][0].toString(),
                            currency: {
                                ct: log.values.payment[3][3][0][1][0].toLowerCase(),
                                id: log.values.payment[3][3][0][1][1].toNumber(),
                            }
                        },
                        total: log.values.payment[3][3][1].length ? log.values.payment[3][3][1].map(d => ({
                            originId: d[0].toNumber(),
                            figure: {
                                amount: d[1][0].toString(),
                                currency: {
                                    ct: d[1][1][0].toLowerCase(),
                                    id: d[1][1][1].toNumber(),
                                }
                            }
                        })) : []
                    }
                },
                recipient: {
                    nonce: log.values.payment[4][0].toNumber(),
                    wallet: log.values.payment[4][1].toLowerCase(),
                    balances: {
                        current: log.values.payment[4][2][0].toString(),
                        previous: log.values.payment[4][2][1].toString()
                    },
                    fees: {
                        total: log.values.payment[4][3][0].length ? log.values.payment[4][3][0].map(d => ({
                            originId: d[0].toNumber(),
                            figure: {
                                amount: d[1][0].toString(),
                                currency: {
                                    ct: d[1][1][0].toLowerCase(),
                                    id: d[1][1][1].toNumber(),
                                }
                            }
                        })) : []
                    }
                },
                seals: {
                    wallet: {
                        hash: log.values.payment[6][0][0],
                        signature: {
                            r: log.values.payment[6][0][1][0],
                            s: log.values.payment[6][0][1][1],
                            v: log.values.payment[6][0][1][2]
                        }
                    },
                    operator: {
                        hash: log.values.payment[6][1][0],
                        signature: {
                            r: log.values.payment[6][1][1][0],
                            s: log.values.payment[6][1][1][1],
                            v: log.values.payment[6][1][1][2]
                        }
                    },
                },
                blockNumber: log.values.payment[7].toNumber()
            };

        else // New schema, 1.3 on mainnet
            d.data = {
                amount: log.values.payment[0].toString(),
                currency: {
                    ct: log.values.payment[1][0].toLowerCase(),
                    id: log.values.payment[1][1].toNumber()
                },
                sender: {
                    nonce: log.values.payment[2][0].toNumber(),
                    wallet: log.values.payment[2][1].toLowerCase(),
                    balances: {
                        current: log.values.payment[2][2][0].toString(),
                        previous: log.values.payment[2][2][1].toString()
                    },
                    fees: {
                        single: {
                            amount: log.values.payment[2][3][0][0].toString(),
                            currency: {
                                ct: log.values.payment[2][3][0][1][0].toLowerCase(),
                                id: log.values.payment[2][3][0][1][1].toNumber(),
                            }
                        },
                        total: log.values.payment[2][3][1].length ? log.values.payment[2][3][1].map(d => ({
                            originId: d[0].toNumber(),
                            figure: {
                                amount: d[1][0].toString(),
                                currency: {
                                    ct: d[1][1][0].toLowerCase(),
                                    id: d[1][1][1].toNumber(),
                                }
                            }
                        })) : []
                    }
                },
                recipient: {
                    nonce: log.values.payment[3][0].toNumber(),
                    wallet: log.values.payment[3][1].toLowerCase(),
                    balances: {
                        current: log.values.payment[3][2][0].toString(),
                        previous: log.values.payment[3][2][1].toString()
                    },
                    fees: {
                        total: log.values.payment[3][3][0].length ? log.values.payment[3][3][0].map(d => ({
                            originId: d[0].toNumber(),
                            figure: {
                                amount: d[1][0].toString(),
                                currency: {
                                    ct: d[1][1][0].toLowerCase(),
                                    id: d[1][1][1].toNumber(),
                                }
                            }
                        })) : []
                    }
                },
                seals: {
                    wallet: {
                        hash: log.values.payment[5][0][0],
                        signature: {
                            r: log.values.payment[5][0][1][0],
                            s: log.values.payment[5][0][1][1],
                            v: log.values.payment[5][0][1][2]
                        }
                    },
                    operator: {
                        hash: log.values.payment[5][1][0],
                        signature: {
                            r: log.values.payment[5][1][1][0],
                            s: log.values.payment[5][1][1][1],
                            v: log.values.payment[5][1][1][2]
                        }
                    },
                },
                blockNumber: log.values.payment[6].toNumber()
            };

        return d;
    }), 'settle-payment');
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3DriipSettlementByPayment = await DriipSettlementByPayment.deployed();
        ethersDriipSettlementByPayment = new Contract(web3DriipSettlementByPayment.address, DriipSettlementByPayment.abi, provider);

        // Settle payment
        await exportSettlePayment();

    } catch (e) {
        callback(e);
    }

    callback();
};
