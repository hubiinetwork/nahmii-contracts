const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const mocks = require('../mocks');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = (glob) => {
    describe('DealSettlementChallenge', () => {
        let web3DealSettlementChallenge, ethersDealSettlementChallengeOwner;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallengeOwner;
        let provider;
        let ethersDealSettlementChallengeUserA, ethersDealSettlementChallengeUserB;
        let ethersCancelOrdersChallengeUserA, ethersCancelOrdersChallengeUserE;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            web3DealSettlementChallenge = glob.web3DealSettlementChallenge;
            ethersDealSettlementChallengeOwner = glob.ethersIoDealSettlementChallenge;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            web3SecurityBond = glob.web3SecurityBond;
            ethersSecurityBond = glob.ethersIoSecurityBond;
            web3CancelOrdersChallenge = glob.web3CancelOrdersChallenge;
            ethersCancelOrdersChallengeOwner = glob.ethersIoCancelOrdersChallenge;

            ethersDealSettlementChallengeUserA = ethersDealSettlementChallengeOwner.connect(glob.signer_a);
            ethersDealSettlementChallengeUserB = ethersDealSettlementChallengeOwner.connect(glob.signer_b);
            ethersCancelOrdersChallengeUserA = ethersCancelOrdersChallengeOwner.connect(glob.signer_a);
            ethersCancelOrdersChallengeUserE = ethersCancelOrdersChallengeOwner.connect(glob.signer_e);

            provider = glob.signer_owner.provider;

            await ethersDealSettlementChallengeOwner.changeConfiguration(ethersConfiguration.address);
            await ethersDealSettlementChallengeOwner.changeSecurityBond(ethersSecurityBond.address);
            await ethersDealSettlementChallengeOwner.changeCancelOrdersChallenge(ethersCancelOrdersChallengeOwner.address);
            await ethersCancelOrdersChallengeOwner.changeConfiguration(ethersConfiguration.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setDealSettlementChallengeTimeout(1e4);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3DealSettlementChallenge.owner.call();
                owner.should.equal(glob.owner);
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

            before(() => {
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

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersDealSettlementChallengeOwner.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('changeSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3DealSettlementChallenge.securityBond.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenge.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenge.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3DealSettlementChallenge.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenge.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                const cancelOrdersChallenge = await ethersDealSettlementChallengeOwner.cancelOrdersChallenge();
                cancelOrdersChallenge.should.equal(utils.getAddress(ethersCancelOrdersChallengeOwner.address));
            });
        });

        describe('changeCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let cancelOrdersChallenge;

                beforeEach(async () => {
                    cancelOrdersChallenge = await web3DealSettlementChallenge.cancelOrdersChallenge.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenge.changeCancelOrdersChallenge(cancelOrdersChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenge.changeCancelOrdersChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');
                    const cancelOrdersChallenge = await web3DealSettlementChallenge.cancelOrdersChallenge();
                    utils.getAddress(cancelOrdersChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenge.changeCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletChallengedTradesCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDealSettlementChallengeOwner.walletChallengedTradesCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('walletChallengedPaymentsCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDealSettlementChallengeOwner.walletChallengedPaymentsCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidateOrdersCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.challengeCandidateOrdersCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidateTradesCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.challengeCandidateTradesCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidatePaymentsCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.challengeCandidatePaymentsCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('startChallengeFromTrade()', () => {
            let overrideOptions, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                topic = ethersDealSettlementChallengeOwner.interface.events.StartChallengeFromTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.walletChallengedTradesCount(trade.buyer.wallet);
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
                    ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('startChallengeFromPayment()', () => {
            let overrideOptions, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                topic = ethersDealSettlementChallengeOwner.interface.events.StartChallengeFromPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if there is no ongoing deal settlement challenge and caller is owner or payment party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.walletChallengedPaymentsCount(payment.sender.wallet);
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
                    ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not signed by wallet', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    const sign = mocks.createWeb3Signer(glob.user_b);
                    payment.seals.wallet.signature = await sign(payment.seals.wallet.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
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

                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                });

                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(trade.buyer.wallet);
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

                    await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(payment.sender.wallet).should.be.rejected;
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

                    await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                });

                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(payment.sender.wallet);
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

                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(trade.buyer.wallet).should.be.rejected;
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
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions)
                    });

                    it('should return challenged deal nonce and Dispute', async () => {
                        const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengePhase(trade.buyer.wallet);
                        result[0].eq(trade.nonce).should.be.true;
                        result[1].should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });

                describe('if deal settlement challenge has completed for given wallet', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions)
                    });

                    it('should return challenged deal nonce and Closed', async () => {
                        const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengePhase(trade.buyer.wallet);
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
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions)
                });

                it('should return challenged deal challenge status', async () => {
                    const result = await ethersDealSettlementChallengeOwner.dealSettlementChallengeStatus(trade.buyer.wallet, trade.nonce);
                    result.should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('challengeByOrder()', () => {
            let overrideOptions, order, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeByOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order is not signed by wallet', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    order.seals.wallet.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    order.seals.exchange.signature = order.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let trade;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, order.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
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
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: order.wallet},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: order.wallet},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    describe('if order has not been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    wallet: order.wallet,
                                    balances: {
                                        conjugate: {
                                            current: utils.bigNumberify(0)
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });

                            await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                        });

                        it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                            await ethersDealSettlementChallengeUserA.challengeByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(trade.buyer.wallet);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                        });
                    });

                    describe('if order has been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                wallet: glob.user_a,
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    wallet: order.wallet,
                                    balances: {
                                        conjugate: {
                                            current: utils.bigNumberify(0)
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });

                            await ethersCancelOrdersChallengeUserA.cancelOrders([order], overrideOptions);
                            await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                        });

                        it('should disqualify challenged deal, update challenge without challenger and emit event', async () => {
                            await ethersDealSettlementChallengeUserB.challengeByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(trade.buyer.wallet);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal('0x0000000000000000000000000000000000000000');
                        });
                    });
                });
            });

            describe('if there is ongoing deal settlement challenge from payment', () => {
                let payment;

                describe('if order currency is different than payment currency', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {wallet: glob.user_b});
                        payment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: order.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {wallet: glob.user_c});
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {wallet: order.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    describe('if order has not been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                wallet: glob.user_d,
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });
                            payment = await mocks.mockPayment(glob.owner, {
                                currency: '0x0000000000000000000000000000000000000002',
                                sender: {
                                    wallet: order.wallet,
                                    balances: {
                                        current: utils.bigNumberify(0)
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                        });

                        it('should disqualify challenged deal and emit event', async () => {
                            await ethersDealSettlementChallengeUserB.challengeByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(payment.sender.wallet);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_b));
                        });
                    });

                    describe('if order has been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                wallet: glob.user_e,
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });
                            payment = await mocks.mockPayment(glob.owner, {
                                currency: '0x0000000000000000000000000000000000000002',
                                sender: {
                                    wallet: order.wallet,
                                    balances: {
                                        current: utils.bigNumberify(0)
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            await ethersCancelOrdersChallengeUserE.cancelOrders([order], overrideOptions);
                            await ethersDealSettlementChallengeOwner.startChallengeFromPayment(payment, payment.sender.wallet, overrideOptions);
                        });

                        it('should disqualify challenged deal and emit event', async () => {
                            await ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(payment.sender.wallet);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal('0x0000000000000000000000000000000000000000');
                        });
                    });
                });
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let overrideOptions, topic, filter, order, trade;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.UnchallengeOrderCandidateByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order is not signed by wallet', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                    order.seals.wallet.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                    order.seals.exchange.signature = order.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                    trade.seal.signature = order.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet of order is not trade party', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not one of orders filled in trade', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge candidate is not order', () => {
                let tradeCandidate;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: order.wallet,
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        }
                    });

                    tradeCandidate = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });

                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                    await ethersDealSettlementChallengeOwner.challengeByTrade(tradeCandidate, tradeCandidate.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            })

            describe('if order is one of of orders filled in trade', () => {
                let unchallengeTradeCandidate;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                    trade = await mocks.mockTrade(glob.owner, { // Challenged trade
                        buyer: {
                            wallet: order.wallet,
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    unchallengeTradeCandidate = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: order.wallet,
                            order: {
                                hashes: {
                                    exchange: order.seals.exchange.hash
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber30)
                    });

                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(trade, trade.buyer.wallet, overrideOptions);
                    await ethersDealSettlementChallengeOwner.challengeByOrder(order, overrideOptions);
                });

                it('should requalify challenged deal and emit event', async () => {
                    await ethersDealSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, unchallengeTradeCandidate, overrideOptions);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                    const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(trade.buyer.wallet);
                    dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                    dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('None'));
                    dealSettlementChallenge.candidateIndex.eq(0).should.be.true;
                    dealSettlementChallenge.challenger.should.equal('0x0000000000000000000000000000000000000000');
                });
            })
        });

        describe('challengeByTrade()', () => {
            let overrideOptions, candidateTrade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner);
                    candidateTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: challengedTrade.buyer.wallet}
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing deal settlement challenge from trade', () => {
                let challengedTrade;

                describe('if candidate trade\'s considered currency is different than challenged trade\'s currencies', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner);
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            currencies: {
                                conjugate: '0x0000000000000000000000000000000000000003'
                            },
                            buyer: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s single transfer is within limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner);
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s single transfer is beyond limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                balances: {
                                    conjugate: {
                                        current: utils.bigNumberify(0)
                                    }
                                }
                            }
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateTradesCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(candidateTrade.buyer.wallet);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Trade'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });

            describe('if there is ongoing deal settlement challenge from payment', () => {
                let challengedPayment;

                describe('if candidate trade\'s considered currency is different than challenged payment\'s currency', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: glob.user_b}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is within limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {wallet: glob.user_c}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is beyond limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {
                                wallet: glob.user_d,
                                balances: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidateTradesCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(candidateTrade.buyer.wallet);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Trade'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });
        });

        describe('challengeByPayment()', () => {
            let overrideOptions, candidatePayment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if payment is not signed by exchange', () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is recipient in candidate payment', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.recipient.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a}
                    });
                    candidatePayment = await mocks.mockPayment(glob.owner, {
                        sender: {wallet: challengedTrade.buyer.wallet}
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing deal settlement challenge from trade', () => {
                let challengedTrade;

                describe('if candidate payment\'s currency is different than challenged trade\'s currencies', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000003',
                            sender: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is within limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: glob.user_c}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is beyond limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                wallet: glob.user_d,
                                balances: {
                                    intended: {
                                        current: utils.bigNumberify(0)
                                    }
                                }
                            }
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromTrade(challengedTrade, challengedTrade.buyer.wallet, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidatePaymentsCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(candidatePayment.sender.wallet);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Payment'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });

            describe('if there is ongoing deal settlement challenge from payment', () => {
                let challengedPayment;

                describe('if candidate payment\'s currency is different than challenged payment\'s currencies', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is within limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: glob.user_c}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is beyond limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {
                                wallet: glob.user_d,
                                balances: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDealSettlementChallengeOwner.startChallengeFromPayment(challengedPayment, challengedPayment.sender.wallet, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.challengeCandidatePaymentsCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletChallengeInfoMap(candidatePayment.sender.wallet);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.challengeCandidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Payment'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });
        });
    });
};
