const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const ethutil = require('ethereumjs-util');
const keccak256 = require("augmented-keccak256");
const DealSettlementChallenge = artifacts.require("DealSettlementChallenge");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;

const liquidityRoles = ['Maker', 'Taker'];
const intentions = ['Buy', 'Sell'];
const challengePhases = ['Dispute', 'Closed'];

module.exports = (glob) => {
    describe('DealSettlementChallenge', () => {
        let truffleDealSettlementChallenge, ethersDealSettlementChallenge;
        let truffleConfiguration, ethersConfiguration;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            truffleDealSettlementChallenge = glob.web3DealSettlementChallenge;
            ethersDealSettlementChallenge = glob.ethersIoDealSettlementChallenge;
            truffleConfiguration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;

            provider = glob.signer_owner.provider;

            await ethersDealSettlementChallenge.changeConfiguration(ethersConfiguration.address);
            await ethersDealSettlementChallenge.changeRevenueFund(ethersRevenueFund.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await truffleDealSettlementChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await truffleDealSettlementChallenge.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleDealSettlementChallenge.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await truffleDealSettlementChallenge.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    truffleDealSettlementChallenge.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getCancelledOrdersCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersDealSettlementChallenge.getCancelledOrdersCount(glob.owner);
                count.toNumber().should.equal(0);
            });
        });

        describe('getCancelledOrders()', () => {
            it('should equal value initialized', async () => {
                const orders = await ethersDealSettlementChallenge.getCancelledOrders(glob.owner, 0);
                orders.should.be.an('array').that.has.lengthOf(10);
                orders[0][0].toNumber().should.equal(0);
            });
        });

        describe('cancelOrders()', () => {
            let overrideOptions, order1, order2, topic, filter;

            before(() => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                order1 = {
                    nonce: utils.bigNumberify(1),
                    _address: glob.owner,
                    placement: {
                        intention: intentions.indexOf('Buy'),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                order1 = await augmentOrderSeals(order1, glob.owner, glob.owner);

                order2 = {
                    nonce: utils.bigNumberify(2),
                    _address: glob.owner,
                    placement: {
                        intention: intentions.indexOf('Sell'),
                        immediateSettlement: true,
                        amount: utils.parseUnits('100', 18),
                        rate: utils.bigNumberify(1000),
                        currencies: {
                            intended: '0x0000000000000000000000000000000000000001',
                            conjugate: '0x0000000000000000000000000000000000000002'
                        },
                        residuals: {
                            current: utils.parseUnits('600', 18),
                            previous: utils.parseUnits('700', 18)
                        }
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                };

                order2 = await augmentOrderSeals(order2, glob.owner, glob.owner);

                topic = ethersDealSettlementChallenge.interface.events.CancelOrdersEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if orders are genuine', () => {
                it('should successfully cancel order', async () => {
                    await ethersDealSettlementChallenge.cancelOrders([order1, order2], overrideOptions);
                    const count = await ethersDealSettlementChallenge.getCancelledOrdersCount(glob.owner);
                    count.toNumber().should.equal(2);
                    const orders = await ethersDealSettlementChallenge.getCancelledOrders(glob.owner, 0);
                    orders[0][0].toNumber().should.equal(order1.nonce.toNumber());
                    orders[1][0].toNumber().should.equal(order2.nonce.toNumber());
                });
            });

            describe('if _address differs from msg.sender', () => {
                beforeEach(() => {
                    order1._address = glob.user_a;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by correct party', () => {
                beforeEach(() => {
                    order1.seals.party.hash = order1.seals.exchange.hash;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(() => {
                    order1.seals.exchange.hash = order1.seals.party.hash;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });
        });

        describe('challengeCancelledOrder()', () => {
            let overrideOptions, order, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                order = {
                    nonce: utils.bigNumberify(1),
                    _address: glob.owner,
                    placement: {
                        intention: intentions.indexOf('Buy'),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                order = await augmentOrderSeals(order, glob.owner, glob.owner);

                trade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.owner,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: order.seals.party.hash,
                                exchange: order.seals.exchange.hash
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
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
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
                                current: utils.parseUnits('19.4996', 18),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersDealSettlementChallenge.interface.events.ChallengeCancelledOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order cancelled', () => {
                describe('if cancel order challenge timeout has not expired', () => {
                    let cancelOrderChallengeTimeout;

                    beforeEach(async () => {
                        cancelOrderChallengeTimeout = await ethersConfiguration.cancelOrderChallengeTimeout();
                        await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
                        await ethersDealSettlementChallenge.cancelOrders([order], overrideOptions);
                    });

                    afterEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(cancelOrderChallengeTimeout);
                    });

                    it('should successfully accept the challenge candidate trade', async () => {
                        await ethersDealSettlementChallenge.challengeCancelledOrder(trade, glob.owner, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if cancel order challenge timeout has expired', () => {
                    let cancelOrderChallengeTimeout;

                    beforeEach(async () => {
                        cancelOrderChallengeTimeout = await ethersConfiguration.cancelOrderChallengeTimeout();
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);
                        await ethersDealSettlementChallenge.cancelOrders([order], overrideOptions);
                    });

                    afterEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(cancelOrderChallengeTimeout);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallenge.challengeCancelledOrder(trade, glob.owner, overrideOptions).should.be.rejected;
                    });
                });
            });

            describe('if order has not been cancelled', () => {
                let cancelOrderChallengeTimeout;

                beforeEach(async () => {
                    cancelOrderChallengeTimeout = await ethersConfiguration.cancelOrderChallengeTimeout();
                    await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
                    await ethersDealSettlementChallenge.cancelOrders([order], overrideOptions);

                    trade.buyer.order.hashes.exchange = hashString('some exchange buyer order hash');
                });

                afterEach(async () => {
                    await ethersConfiguration.setCancelOrderChallengeTimeout(cancelOrderChallengeTimeout);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.challengeCancelledOrder(trade, glob.owner, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by owner', () => {
                beforeEach(() => {
                    trade.seal.hash = hashString('some trade hash');
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.challengeCancelledOrder(trade, glob.owner, overrideOptions).should.be.rejected;
                });
            })
        });

        describe('cancelledOrdersChallengePhase()', () => {

            describe('if no order has been cancelled for wallet', () => {
                it('should return value corresponding to Closed', async () => {
                    const phase = await ethersDealSettlementChallenge.cancelledOrdersChallengePhase(glob.user_a);
                    phase.should.equal(challengePhases.indexOf('Closed'));
                });
            });

            describe('if order has been cancelled for wallet', () => {
                let overrideOptions, order;

                before(() => {
                    overrideOptions = {gasLimit: 1e6};
                });

                beforeEach(async () => {
                    order = {
                        nonce: utils.bigNumberify(1),
                        _address: glob.owner,
                        placement: {
                            intention: intentions.indexOf('Buy'),
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
                        blockNumber: utils.bigNumberify(blockNumber10)
                    };

                    order = await augmentOrderSeals(order, glob.owner, glob.owner);
                });

                describe('if cancelled order challenge timeout has not expired', () => {
                    let cancelOrderChallengeTimeout;

                    beforeEach(async () => {
                        cancelOrderChallengeTimeout = await ethersConfiguration.cancelOrderChallengeTimeout();
                        await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
                        await ethersDealSettlementChallenge.cancelOrders([order], overrideOptions);
                    });

                    afterEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(cancelOrderChallengeTimeout);
                    });

                    it('should return value corresponding to Dispute', async () => {
                        const phase = await ethersDealSettlementChallenge.cancelledOrdersChallengePhase(glob.owner);
                        phase.should.equal(challengePhases.indexOf('Dispute'));
                    });
                });

                describe('if cancelled order challenge timeout has expired', () => {
                    let cancelOrderChallengeTimeout;

                    beforeEach(async () => {
                        cancelOrderChallengeTimeout = await ethersConfiguration.cancelOrderChallengeTimeout();
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);
                        await ethersDealSettlementChallenge.cancelOrders([order], overrideOptions);
                    });

                    afterEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(cancelOrderChallengeTimeout);
                    });

                    it('should return value corresponding to Dispute', async () => {
                        const phase = await ethersDealSettlementChallenge.cancelledOrdersChallengePhase(glob.owner);
                        phase.should.equal(challengePhases.indexOf('Closed'));
                    });
                });
            });
        });

        describe('getDealSettlementChallengeFromTradeCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallenge.getDealSettlementChallengeFromTradeCount(glob.user_a);
                count.toNumber().should.equal(0);
            });
        });

        describe('getDealSettlementChallengeFromPaymentCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallenge.getDealSettlementChallengeFromPaymentCount(glob.user_a);
                count.toNumber().should.equal(0);
            });
        });

        describe('startDealSettlementChallengeFromTrade()', () => {
            let overrideOptions, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                trade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
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
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
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
                                current: utils.parseUnits('19.4996', 18),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersDealSettlementChallenge.interface.events.StartDealSettlementChallengeFromTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or trade party', () => {
                it('should operate successfully', async () => {
                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions);
                    const count = await ethersDealSettlementChallenge.getDealSettlementChallengeFromTradeCount(glob.user_a);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade is not signed by owner', () => {
                beforeEach(async () => {
                    trade.seal.signature = await sign(glob.user_a, trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                let ethersDealSettlementChallengeUserC;

                beforeEach(() => {
                    ethersDealSettlementChallengeUserC = ethersDealSettlementChallenge.connect(glob.signer_c);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserC.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                let dealSettlementChallengeTimeout;

                beforeEach(async () => {
                    dealSettlementChallengeTimeout = await ethersConfiguration.dealSettlementChallengeTimeout();
                    await ethersConfiguration.setDealSettlementChallengeTimeout(1e3);
                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions);
                });

                afterEach(async () => {
                    await ethersConfiguration.setDealSettlementChallengeTimeout(dealSettlementChallengeTimeout);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('startDealSettlementChallengeFromPayment()', () => {
            let overrideOptions, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                payment = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('9399.8', 18),
                            previous: utils.parseUnits('9500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('19700', 18),
                            previous: utils.parseUnits('19600', 18)
                        },
                        netFee: utils.parseUnits('0.0', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('100', 18),
                        net: utils.parseUnits('100', 18)
                    },
                    singleFee: utils.parseUnits('0.2', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                payment = await augmentPaymentSeals(payment, glob.user_a, glob.owner);

                topic = ethersDealSettlementChallenge.interface.events.StartDealSettlementChallengeFromPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or payment party', () => {
                it('should operate successfully', async () => {
                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions);
                    const count = await ethersDealSettlementChallenge.getDealSettlementChallengeFromPaymentCount(glob.user_a);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment is not signed by owner', () => {
                beforeEach(async () => {
                    payment.seals.exchange.signature = await sign(glob.user_b, payment.seals.exchange.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not signed by payment source', () => {
                beforeEach(async () => {
                    payment.seals.party.signature = await sign(glob.user_b, payment.seals.party.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                let ethersDealSettlementChallengeUserC;

                beforeEach(() => {
                    ethersDealSettlementChallengeUserC = ethersDealSettlementChallenge.connect(glob.signer_c);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserC.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                let dealSettlementChallengeTimeout;

                beforeEach(async () => {
                    dealSettlementChallengeTimeout = await ethersConfiguration.dealSettlementChallengeTimeout();
                    await ethersConfiguration.setDealSettlementChallengeTimeout(1e3);
                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions);
                });

                afterEach(async () => {
                    await ethersConfiguration.setDealSettlementChallengeTimeout(dealSettlementChallengeTimeout);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('getChallengedDealAsTrade()', () => {
            let overrideOptions, trade;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                trade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
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
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
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
                                current: utils.parseUnits('19.4996', 18),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                trade = await augmentTradeSeal(trade, glob.owner);

                await ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_a, overrideOptions);
            });

            describe('if called with address whose deal settlement challenge was started on trade', () => {
                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallenge.getChallengedDealAsTrade(glob.user_a);
                    result[0].toNumber().should.equal(trade.nonce.toNumber());
                });
            });

            describe('if called with address for which no deal settlement challenge has ever been started', () => {
                it('should revert', async () => {
                    ethersDealSettlementChallenge.getChallengedDealAsTrade(glob.user_b).should.be.rejected;
                });
            });

            describe('if called with address whose deal settlement challenge was started on payment', () => {
                let payment;

                beforeEach(async () => {
                    payment = {
                        nonce: utils.bigNumberify(1),
                        immediateSettlement: true,
                        amount: utils.parseUnits('100', 18),
                        currency: '0x0000000000000000000000000000000000000001',
                        source: {
                            _address: glob.user_a,
                            nonce: utils.bigNumberify(1),
                            balances: {
                                current: utils.parseUnits('9399.8', 18),
                                previous: utils.parseUnits('9500', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        destination: {
                            _address: glob.user_b,
                            nonce: utils.bigNumberify(1),
                            balances: {
                                current: utils.parseUnits('19700', 18),
                                previous: utils.parseUnits('19600', 18)
                            },
                            netFee: utils.parseUnits('0.0', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('100', 18)
                        },
                        singleFee: utils.parseUnits('0.2', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    };

                    payment = await augmentPaymentSeals(payment, glob.user_a, glob.owner);

                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_b, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.getChallengedDealAsTrade(glob.user_b).should.be.rejected;
                });
            });
        });

        describe('getChallengedDealAsPayment()', () => {
            let overrideOptions, payment;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                payment = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('9399.8', 18),
                            previous: utils.parseUnits('9500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('19700', 18),
                            previous: utils.parseUnits('19600', 18)
                        },
                        netFee: utils.parseUnits('0.0', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('100', 18),
                        net: utils.parseUnits('100', 18)
                    },
                    singleFee: utils.parseUnits('0.2', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                payment = await augmentPaymentSeals(payment, glob.user_a, glob.owner);

                await ethersDealSettlementChallenge.startDealSettlementChallengeFromPayment(payment, glob.user_a, overrideOptions);
            });

            describe('if called with address whose deal settlement challenge was started on payment', () => {
                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallenge.getChallengedDealAsPayment(glob.user_a);
                    result[0].toNumber().should.equal(payment.nonce.toNumber());
                });
            });

            describe('if called with address for which no deal settlement challenge has ever been started', () => {
                it('should revert', async () => {
                    ethersDealSettlementChallenge.getChallengedDealAsPayment(glob.user_b).should.be.rejected;
                });
            });

            describe('if called with address whose deal settlement challenge was started on trade', () => {
                let trade;

                beforeEach(async () => {
                    trade = {
                        nonce: utils.bigNumberify(1),
                        immediateSettlement: true,
                        amount: utils.parseUnits('100', 18),
                        rate: utils.bigNumberify(1000),
                        currencies: {
                            intended: '0x0000000000000000000000000000000000000001',
                            conjugate: '0x0000000000000000000000000000000000000002'
                        },
                        buyer: {
                            _address: glob.user_a,
                            nonce: utils.bigNumberify(1),
                            rollingVolume: utils.bigNumberify(0),
                            liquidityRole: liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('100', 18),
                                hashes: {
                                    party: hashString('some party buy order hash'),
                                    exchange: hashString('some exchange buy order hash')
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
                            _address: glob.user_b,
                            nonce: utils.bigNumberify(1),
                            rollingVolume: utils.bigNumberify(0),
                            liquidityRole: liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('100', 18),
                                hashes: {
                                    party: hashString('some party sell order hash'),
                                    exchange: hashString('some exchange sell order hash')
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
                                    current: utils.parseUnits('19.4996', 18),
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
                        blockNumber: utils.bigNumberify(blockNumber10)
                    };

                    trade = await augmentTradeSeal(trade, glob.owner);

                    await ethersDealSettlementChallenge.startDealSettlementChallengeFromTrade(trade, glob.user_b, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.getChallengedDealAsPayment(glob.user_b).should.be.rejected;
                });
            });
        });

        describe('challengeDealSettlementByOrder()', () => {
            let overrideOptions, order, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                order = {
                    nonce: utils.bigNumberify(1),
                    _address: glob.user_a,
                    placement: {
                        intention: intentions.indexOf('Buy'),
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                order = await augmentOrderSeals(order, glob.user_a, glob.owner);

                // trade = {
                //     nonce: utils.bigNumberify(1),
                //     immediateSettlement: true,
                //     amount: utils.parseUnits('100', 18),
                //     rate: utils.bigNumberify(1000),
                //     currencies: {
                //         intended: '0x0000000000000000000000000000000000000001',
                //         conjugate: '0x0000000000000000000000000000000000000002'
                //     },
                //     buyer: {
                //         _address: glob.user_a,
                //         nonce: utils.bigNumberify(1),
                //         rollingVolume: utils.bigNumberify(0),
                //         liquidityRole: liquidityRoles.indexOf('Maker'),
                //         order: {
                //             amount: utils.parseUnits('100', 18),
                //             hashes: {
                //                 party: hashString('some party buy order hash'),
                //                 exchange: hashString('some exchange buy order hash')
                //             },
                //             residuals: {
                //                 current: utils.parseUnits('400', 18),
                //                 previous: utils.parseUnits('500', 18)
                //             }
                //         },
                //         balances: {
                //             intended: {
                //                 current: utils.parseUnits('9599.8', 18),
                //                 previous: utils.parseUnits('9499.9', 18)
                //             },
                //             conjugate: {
                //                 current: utils.parseUnits('9.4', 18),
                //                 previous: utils.parseUnits('9.5', 18)
                //             }
                //         },
                //         netFees: {
                //             intended: utils.parseUnits('0.2', 18),
                //             conjugate: utils.parseUnits('0.0', 18)
                //         }
                //     },
                //     seller: {
                //         _address: glob.user_b,
                //         nonce: utils.bigNumberify(1),
                //         rollingVolume: utils.bigNumberify(0),
                //         liquidityRole: liquidityRoles.indexOf('Taker'),
                //         order: {
                //             amount: utils.parseUnits('100', 18),
                //             hashes: {
                //                 party: hashString('some party sell order hash'),
                //                 exchange: hashString('some exchange sell order hash')
                //             },
                //             residuals: {
                //                 current: utils.parseUnits('600', 18),
                //                 previous: utils.parseUnits('700', 18)
                //             }
                //         },
                //         balances: {
                //             intended: {
                //                 current: utils.parseUnits('19500', 18),
                //                 previous: utils.parseUnits('19600', 18)
                //             },
                //             conjugate: {
                //                 current: utils.parseUnits('19.4996', 18),
                //                 previous: utils.parseUnits('19.5998', 18)
                //             }
                //         },
                //         netFees: {
                //             intended: utils.parseUnits('0.0', 18),
                //             conjugate: utils.parseUnits('0.0004', 18)
                //         }
                //     },
                //     transfers: {
                //         intended: {
                //             single: utils.parseUnits('100', 18),
                //             net: utils.parseUnits('200', 18)
                //         },
                //         conjugate: {
                //             single: utils.parseUnits('0.1', 18),
                //             net: utils.parseUnits('0.2', 18)
                //         }
                //     },
                //     singleFees: {
                //         intended: utils.parseUnits('0.1', 18),
                //         conjugate: utils.parseUnits('0.0002', 18)
                //     },
                //     blockNumber: utils.bigNumberify(blockNumber10)
                // };

                // trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersDealSettlementChallenge.interface.events.ChallengeDealSettlementByOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe.only('if not signed by correct party', () => {
                beforeEach(() => {
                    order.seals.party.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallenge.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(() => {
                    order._address = glob.user_b
                });

                it('should revert');
            });

            describe('if order has previously been cancelled', async () => {
                it('should revert');
            });

            describe('if there is ongoing deal settlement challenge from trade', () => {
                describe('if order currency different than trade currencies', () => {
                    it('should revert');
                });

                describe('if order amount is within limits of deal balance', () => {
                    it('should revert');
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    it('should record challenge disqualification and emit event');
                });
            });

            describe('if there is ongoing deal settlement challenge from payment', () => {
                describe('if order currency different than payment currency', () => {
                    it('should revert');
                });

                describe('if order amount is within limits of deal balance', () => {
                    it('should revert');
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    it('should record challenge disqualification and emit event');
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersDealSettlementChallenge.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await truffleDealSettlementChallenge.configuration.call();
                });

                afterEach(async () => {
                    await truffleDealSettlementChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleDealSettlementChallenge.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await truffleDealSettlementChallenge.configuration();
                    configuration.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleDealSettlementChallenge.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};

const augmentTradeSeal = async (trade, address) => {
    const hash = hashTrade(trade);
    trade.seal = {
        hash: hash,
        signature: await sign(address, hash)
    };
    return trade;
};

const augmentPaymentSeals = async (payment, partyAddress, exchangeAddress) => {
    const partyHash = hashPaymentAsParty(payment);
    payment.seals = {
        party: {
            hash: partyHash,
            signature: await sign(partyAddress, partyHash)
        }
    };
    const exchangeHash = hashPaymentAsExchange(payment);
    payment.seals.exchange = {
        hash: exchangeHash,
        signature: await sign(exchangeAddress, exchangeHash)
    };
    return payment;
};

const augmentOrderSeals = async (order, partyAddress, exchangeAddress) => {
    const partyHash = hashOrderAsParty(order);
    order.seals = {
        party: {
            hash: partyHash,
            signature: await sign(partyAddress, partyHash)
        },
    };
    const exchangeHash = hashOrderAsExchange(order);
    order.seals.exchange = {
        hash: exchangeHash,
        signature: await sign(exchangeAddress, exchangeHash)
    };
    return order;
};

const hashTrade = (trade) => {
    return hashString(
        trade.nonce.toNumber()
    );
};

const hashPaymentAsParty = (payment) => {
    return hashString(
        payment.nonce.toNumber()
    );
};

const hashPaymentAsExchange = (payment) => {
    return hashTypedItems(
        {value: toRpcSig(payment.seals.party.signature), type: 'string'}
    );
};

const hashOrderAsParty = (order) => {
    return hashString(
        order.nonce.toNumber()
    );
};

const hashOrderAsExchange = (order) => {
    return hashTypedItems(
        {value: order.placement.residuals.current.toHexString(), type: 'hex'},
        {value: order.placement.residuals.previous.toHexString(), type: 'hex'},
        {value: toRpcSig(order.seals.party.signature), type: 'string'}
    );
};

const hashString = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d));
    return `0x${hasher.digest()}`;
};

const hashTypedItems = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d.value, d.type));
    return `0x${hasher.digest()}`;
};

const sign = async (address, hash) => {
    const sig = await web3.eth.sign(address, hash);
    return fromRpcSig(sig);
};

const fromRpcSig = (sig) => {
    sig = ethutil.fromRpcSig(sig);
    return {
        v: utils.bigNumberify(sig.v),
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`
    };
};

const toRpcSig = (sig) => {
    return ethutil.toRpcSig(
        sig.v.toNumber(),
        Buffer.from(sig.r.slice(2), 'hex'),
        Buffer.from(sig.s.slice(2), 'hex')
    );
};
