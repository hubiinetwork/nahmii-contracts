const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const DealSettlementChallenge = artifacts.require("DealSettlementChallenge");
const mocks = require('../mocks');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = (glob) => {
    describe.only('DealSettlementChallenge', () => {
        let web3DealSettlementChallenge, ethersDealSettlementChallengeOwner;
        let web3Configuration, ethersConfiguration;
        let provider;
        let ethersDealSettlementChallengeUserA, ethersDealSettlementChallengeUserB,
            ethersDealSettlementChallengeUserC, ethersDealSettlementChallengeUserD,
            ethersDealSettlementChallengeUserE;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            web3DealSettlementChallenge = glob.web3DealSettlementChallenge;
            ethersDealSettlementChallengeOwner = glob.ethersIoDealSettlementChallenge;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;

            ethersDealSettlementChallengeUserA = ethersDealSettlementChallengeOwner.connect(glob.signer_a);
            ethersDealSettlementChallengeUserB = ethersDealSettlementChallengeOwner.connect(glob.signer_b);
            ethersDealSettlementChallengeUserC = ethersDealSettlementChallengeOwner.connect(glob.signer_c);
            ethersDealSettlementChallengeUserD = ethersDealSettlementChallengeOwner.connect(glob.signer_d);
            ethersDealSettlementChallengeUserE = ethersDealSettlementChallengeOwner.connect(glob.signer_e);

            provider = glob.signer_owner.provider;

            await ethersDealSettlementChallengeOwner.changeConfiguration(ethersConfiguration.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setDealSettlementChallengeTimeout(1e4);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3DealSettlementChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3DealSettlementChallenge.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenge.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await web3DealSettlementChallenge.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenge.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getCancelledOrdersCount()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDealSettlementChallengeOwner.getCancelledOrdersCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('getCancelledOrders()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const orders = await ethersDealSettlementChallengeOwner.getCancelledOrders(address, 0);
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
                order1 = await mocks.mockOrder(glob.owner, {
                    _address: glob.user_a,
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                order2 = await mocks.mockOrder(glob.owner, {
                    nonce: utils.bigNumberify(2),
                    _address: glob.user_a,
                    residuals: {
                        current: utils.parseUnits('600', 18),
                        previous: utils.parseUnits('700', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                topic = ethersDealSettlementChallengeOwner.interface.events.CancelOrdersEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if orders are genuine', () => {
                it('should successfully cancel order', async () => {
                    await ethersDealSettlementChallengeUserA.cancelOrders([order1, order2], overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.getCancelledOrdersCount(glob.user_a);
                    count.toNumber().should.equal(2);
                    const orders = await ethersDealSettlementChallengeOwner.getCancelledOrders(glob.user_a, 0);
                    orders[0][0].toNumber().should.equal(order1.nonce.toNumber());
                    orders[1][0].toNumber().should.equal(order2.nonce.toNumber());
                });
            });

            describe('if _address differs from msg.sender', () => {
                beforeEach(async () => {
                    order1 = await mocks.mockOrder(glob.owner, {_address: glob.user_c});
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by party', () => {
                beforeEach(() => {
                    order1.seals.party.hash = order1.seals.exchange.hash;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(() => {
                    order1.seals.exchange.hash = order1.seals.party.hash;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });
        });

        describe('challengeCancelledOrder()', () => {
            let overrideOptions, order, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeCancelledOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order cancelled', () => {
                describe('if cancel order challenge timeout has not expired', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            _address: glob.user_b,
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });

                        await ethersDealSettlementChallengeUserB.cancelOrders([order], overrideOptions);

                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                _address: order._address,
                                order: {
                                    hashes: {
                                        party: order.seals.party.hash,
                                        exchange: order.seals.exchange.hash
                                    }
                                }
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                    });

                    it('should successfully accept the challenge candidate trade', async () => {
                        await ethersDealSettlementChallengeOwner.challengeCancelledOrder(trade, order._address, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if cancel order challenge timeout has expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);

                        order = await mocks.mockOrder(glob.owner, {
                            _address: glob.user_c
                        });

                        await ethersDealSettlementChallengeUserC.cancelOrders([order], overrideOptions);

                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                _address: order._address,
                                order: {
                                    hashes: {
                                        party: order.seals.party.hash,
                                        exchange: order.seals.exchange.hash
                                    }
                                }
                            }
                        });
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeCancelledOrder(trade, order._address, overrideOptions).should.be.rejected;
                    });
                });
            });

            describe('if order has not been cancelled', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeCancelledOrder(trade, trade.buyer._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeCancelledOrder(trade, trade.buyer._address, overrideOptions).should.be.rejected;
                });
            })
        });

        describe('cancelledOrdersChallengePhase()', () => {
            describe('if no order has been cancelled for wallet', () => {
                it('should return value corresponding to Closed', async () => {
                    const address = Wallet.createRandom().address;
                    const phase = await ethersDealSettlementChallengeOwner.cancelledOrdersChallengePhase(address);
                    phase.should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if order has been cancelled for wallet', () => {
                let overrideOptions, order;

                before(() => {
                    overrideOptions = {gasLimit: 1e6};
                });

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {
                        _address: glob.user_d
                    });
                });

                describe('if cancelled order challenge timeout has expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);
                        await ethersDealSettlementChallengeUserD.cancelOrders([order], overrideOptions);
                    });

                    it('should return value corresponding to Closed', async () => {
                        const phase = await ethersDealSettlementChallengeOwner.cancelledOrdersChallengePhase(order._address);
                        phase.should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });

                describe('if cancelled order challenge timeout has not expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
                        await ethersDealSettlementChallengeUserD.cancelOrders([order], overrideOptions);
                    });

                    it('should return value corresponding to Dispute', async () => {
                        const phase = await ethersDealSettlementChallengeOwner.cancelledOrdersChallengePhase(order._address);
                        phase.should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });
            });
        });

        describe('dealSettlementChallengeFromTradeCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDealSettlementChallengeOwner.dealSettlementChallengeFromTradeCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('dealSettlementChallengeFromPaymentCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDealSettlementChallengeOwner.dealSettlementChallengeFromPaymentCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('startDealSettlementChallengeFromTrade()', () => {
            let overrideOptions, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                topic = ethersDealSettlementChallengeOwner.interface.events.StartDealSettlementChallengeFromTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should operate successfully', async () => {
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.dealSettlementChallengeFromTradeCount(trade.buyer._address);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('startDealSettlementChallengeFromPayment()', () => {
            let overrideOptions, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                topic = ethersDealSettlementChallengeOwner.interface.events.StartDealSettlementChallengeFromPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or payment party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should operate successfully', async () => {
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.dealSettlementChallengeFromPaymentCount(payment.source._address);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment is not signed by exchange', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not signed by party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    const sign = mocks.createWeb3Signer(glob.user_b);
                    payment.seals.party.signature = await sign(payment.seals.party.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('getChallengedDealAsTrade()', () => {
            let overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            describe('if called with address whose deal settlement challenge was started on trade', () => {
                let trade;

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                });

                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(trade.buyer._address);
                    result[0].toNumber().should.equal(trade.nonce.toNumber());
                });
            });

            describe('if called with address for which no deal settlement challenge has ever been started', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(address).should.be.rejected;
                });
            });

            describe('if called with address whose deal settlement challenge was started on payment', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(payment.source._address).should.be.rejected;
                });
            });
        });

        describe('getChallengedDealAsPayment()', () => {
            let overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            describe('if called with address whose deal settlement challenge was started on payment', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.source._address, overrideOptions);
                });

                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(payment.source._address);
                    result[0].toNumber().should.equal(payment.nonce.toNumber());
                });
            });

            describe('if called with address for which no deal settlement challenge has ever been started', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(address).should.be.rejected;
                });
            });

            describe('if called with address whose deal settlement challenge was started on trade', () => {
                let trade;

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(trade.buyer._address).should.be.rejected;
                });
            });
        });

        describe('dealSettlementChallengePhase()', () => {
            describe('if no deal settlement challenge has been started for given wallet', () => {
                it('should return 0 and Closed', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengePhase(address);
                    result[0].eq(utils.bigNumberify(0)).should.be.true;
                    result[1].should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if deal settlement challenge has been started for given wallet', () => {
                let overrideOptions, trade;

                before(async () => {
                    overrideOptions = {gasLimit: 2e6};
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                describe('if deal settlement challenge is ongoing for given wallet', () => {
                    beforeEach(async () => {
                       await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions)
                    });

                    it('should return challenged deal nonce and Dispute', async () => {
                        const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengePhase(trade.buyer._address);
                        result[0].eq(trade.nonce).should.be.true;
                        result[1].should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });

                describe('if deal settlement challenge has completed for given wallet', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions)
                    });

                    it('should return challenged deal nonce and Closed', async () => {
                        const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengePhase(trade.buyer._address);
                        result[0].eq(trade.nonce).should.be.true;
                        result[1].should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });
            });
        });

        describe('dealSettlementChallengeStatus()', () => {
            describe('if no deal settlement challenge has been started for given wallet', () => {
                it('should return Unknown', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengeStatus(address, 0);
                    result.should.equal(mocks.challengeStatuses.indexOf('Unknown'));
                });
            });

            describe('if deal settlement challenge has been started for given wallet', () => {
                let overrideOptions, trade;

                before(async () => {
                    overrideOptions = {gasLimit: 2e6};
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions)
                });

                it('should return challenged deal challenge status', async () => {
                    const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengeStatus(trade.buyer._address, trade.nonce);
                    result.should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('challengeDealSettlementByOrder()', () => {
            let overrideOptions, order, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeDealSettlementByOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if not signed by party', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    order.seals.party.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    order.seals.exchange.signature = order.seals.party.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let trade;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);

                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, order._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order has been previously cancelled', async () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {_address: glob.user_e});
                    await ethersDealSettlementChallengeUserE.cancelOrders([order], overrideOptions)
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing deal settlement challenge from trade', () => {
                let trade;

                describe('if order currency is different than trade currencies', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            placement: {
                                currencies: {
                                    conjugate: '0x0000000000000000000000000000000000000003'
                                }
                            }
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner);
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                _address: order._address,
                                balances: {
                                    conjugate: {
                                        current: utils.bigNumberify(0)
                                    }
                                }
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });

                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    });

                    it('should record challenge disqualification and emit event', async () => {
                        await ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });

            describe('if there is ongoing deal settlement challenge from payment', () => {
                let payment;

                describe('if order currency is different than payment currency', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {_address: glob.user_a});
                        payment = await mocks.mockPayment(glob.owner, {
                            source: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, order._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {_address: glob.user_b});
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            source: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, order._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            _address: glob.user_f,
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            source: {
                                _address: order._address,
                                balances: {
                                    current: utils.bigNumberify(0)
                                }
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, order._address, overrideOptions);
                    });

                    it('should record challenge disqualification and emit event', async () => {
                        await ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersDealSettlementChallengeOwner.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3DealSettlementChallenge.configuration.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenge.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3DealSettlementChallenge.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
