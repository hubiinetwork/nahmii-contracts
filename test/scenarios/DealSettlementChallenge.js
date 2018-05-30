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

        describe('candidateOrdersCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.candidateOrdersCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('candidateTradesCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.candidateTradesCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('candidatePaymentsCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDealSettlementChallengeOwner.candidatePaymentsCount();
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
                    trade = await mocks.mockTrade(glob.owner);
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
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                    const count = await ethersDealSettlementChallengeOwner.dealSettlementChallengeFromPaymentCount(payment.sender._address);
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
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not signed by wallet', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    const sign = mocks.createWeb3Signer(glob.user_b);
                    payment.seals.wallet.signature = await sign(payment.seals.wallet.hash);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeUserA.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if called before an ongoing deal settlement challenge has expired', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions).should.be.rejected;
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

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.getChallengedDealAsTrade(payment.sender._address).should.be.rejected;
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

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                });

                it('should operate successfully', async () => {
                    const result = await ethersDealSettlementChallengeOwner.getChallengedDealAsPayment(payment.sender._address);
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
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeDealSettlementByOrderEvent.topics[0];
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
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    order.seals.exchange.signature = order.seals.wallet.signature;
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
                    order = await mocks.mockOrder(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, order._address, overrideOptions);
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
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: order._address},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: order._address},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
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
                                    _address: order._address,
                                    balances: {
                                        conjugate: {
                                            current: utils.bigNumberify(0)
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });

                            await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                        });

                        it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                            await ethersDealSettlementChallengeUserA.challengeDealSettlementByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.candidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(trade.buyer._address);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                        });
                    });

                    describe('if order has been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                _address: glob.user_a,
                                blockNumber: utils.bigNumberify(blockNumber20)
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
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });

                            await ethersCancelOrdersChallengeUserA.cancelOrders([order], overrideOptions);
                            await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                        });

                        it('should disqualify challenged deal, update challenge without challenger and emit event', async () => {
                            await ethersDealSettlementChallengeUserB.challengeDealSettlementByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.candidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(trade.buyer._address);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Order'));
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
                        order = await mocks.mockOrder(glob.owner, {_address: glob.user_b});
                        payment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of deal balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {_address: glob.user_c});
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {_address: order._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of deal balance', () => {
                    describe('if order has not been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                _address: glob.user_d,
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });
                            payment = await mocks.mockPayment(glob.owner, {
                                currency: '0x0000000000000000000000000000000000000002',
                                sender: {
                                    _address: order._address,
                                    balances: {
                                        current: utils.bigNumberify(0)
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                        });

                        it('should disqualify challenged deal and emit event', async () => {
                            await ethersDealSettlementChallengeUserB.challengeDealSettlementByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.candidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(payment.sender._address);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_b));
                        });
                    });

                    describe('if order has been previously cancelled', async () => {
                        beforeEach(async () => {
                            order = await mocks.mockOrder(glob.owner, {
                                _address: glob.user_e,
                                blockNumber: utils.bigNumberify(blockNumber10)
                            });
                            payment = await mocks.mockPayment(glob.owner, {
                                currency: '0x0000000000000000000000000000000000000002',
                                sender: {
                                    _address: order._address,
                                    balances: {
                                        current: utils.bigNumberify(0)
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumber20)
                            });
                            await ethersCancelOrdersChallengeUserE.cancelOrders([order], overrideOptions);
                            await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(payment, payment.sender._address, overrideOptions);
                        });

                        it('should disqualify challenged deal and emit event', async () => {
                            await ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions);
                            const logs = await provider.getLogs(filter);
                            logs[logs.length - 1].topics[0].should.equal(topic);
                            const candidatesCount = await ethersDealSettlementChallengeOwner.candidateOrdersCount();
                            const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(payment.sender._address);
                            dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                            dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Order'));
                            dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                            dealSettlementChallenge.challenger.should.equal('0x0000000000000000000000000000000000000000');
                        });
                    });
                });
            });
        });

        describe('unchallengeDealSettlementOrderByTrade()', () => {
            let overrideOptions, topic, filter, order, trade;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.UnchallengeDealSettlementOrderByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order is not signed by wallet', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });
                    order.seals.wallet.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });
                    order.seals.exchange.signature = order.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });
                    trade.seal.signature = order.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet of order is not trade party', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not one of orders filled in trade', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge candidate is not order', () => {
                let tradeCandidate;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            _address: order._address,
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        }
                    });

                    tradeCandidate = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: order._address}
                    });

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    await ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(tradeCandidate, tradeCandidate.buyer._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, trade, overrideOptions).should.be.rejected;
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
                            _address: order._address,
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
                            _address: order._address,
                            order: {
                                hashes: {
                                    exchange: order.seals.exchange.hash
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber30)
                    });

                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(trade, trade.buyer._address, overrideOptions);
                    await ethersDealSettlementChallengeOwner.challengeDealSettlementByOrder(order, overrideOptions);
                });

                it('should requalify challenged deal and emit event', async () => {
                    await ethersDealSettlementChallengeOwner.unchallengeDealSettlementOrderByTrade(order, unchallengeTradeCandidate, overrideOptions);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                    const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(trade.buyer._address);
                    dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                    dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    dealSettlementChallenge.candidateIndex.eq(0).should.be.true;
                    dealSettlementChallenge.challenger.should.equal('0x0000000000000000000000000000000000000000');
                });
            })
        });

        describe('challengeDealSettlementByTrade()', () => {
            let overrideOptions, candidateTrade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeDealSettlementByTradeEvent.topics[0];
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
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner);
                    candidateTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: challengedTrade.buyer._address}
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
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
                            buyer: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s single transfer is within limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner);
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
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
                            buyer: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.candidateTradesCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(candidateTrade.buyer._address);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Trade'));
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
                            sender: {_address: glob.user_b}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is within limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {_address: glob.user_c}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is beyond limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {
                                _address: glob.user_d,
                                balances: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeDealSettlementByTrade(candidateTrade, candidateTrade.buyer._address, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.candidateTradesCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(candidateTrade.buyer._address);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Trade'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });
        });

        describe('challengeDealSettlementByPayment()', () => {
            let overrideOptions, candidatePayment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setDealSettlementChallengeTimeout(2);

                topic = ethersDealSettlementChallengeOwner.interface.events.ChallengeDealSettlementByPaymentEvent.topics[0];
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
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is recipient in candidate payment', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.recipient._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing deal settlement challenge', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if deal settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: glob.user_a}
                    });
                    candidatePayment = await mocks.mockPayment(glob.owner, {
                        sender: {_address: challengedTrade.buyer._address}
                    });
                    await ethersConfiguration.setDealSettlementChallengeTimeout(0);
                    await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing deal settlement challenge from trade', () => {
                let challengedTrade;

                describe('if candidate payment\'s currency is different than challenged trade\'s currencies', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000003',
                            sender: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is within limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {_address: glob.user_c}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is beyond limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                _address: glob.user_d,
                                balances: {
                                    intended: {
                                        current: utils.bigNumberify(0)
                                    }
                                }
                            }
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: challengedTrade.buyer._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromTrade(challengedTrade, challengedTrade.buyer._address, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.candidatePaymentsCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(candidatePayment.sender._address);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Payment'));
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
                            sender: {_address: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: '0x0000000000000000000000000000000000000002',
                            sender: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is within limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: glob.user_c}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDealSettlementChallengeOwner.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate payment\'s single transfer is beyond limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {
                                _address: glob.user_d,
                                balances: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            sender: {_address: challengedPayment.sender._address}
                        });
                        await ethersDealSettlementChallengeOwner.startDealSettlementChallengeFromPayment(challengedPayment, challengedPayment.sender._address, overrideOptions);
                    });

                    it('should disqualify challenged deal, update challenge with challenger and emit event', async () => {
                        await ethersDealSettlementChallengeUserA.challengeDealSettlementByPayment(candidatePayment, candidatePayment.sender._address, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDealSettlementChallengeOwner.candidatePaymentsCount();
                        const dealSettlementChallenge = await ethersDealSettlementChallengeOwner.walletDealSettlementChallengeInfoMap(candidatePayment.sender._address);
                        dealSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        dealSettlementChallenge.candidateType.should.equal(mocks.candidateTypes.indexOf('Payment'));
                        dealSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        dealSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });
        });
    });
};
