const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, utils} = require('ethers');
const mocks = require('../mocks');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('CancelOrdersChallenge', () => {
        let web3CancelOrdersChallenge, ethersCancelOrdersChallengeOwner;
        let web3Configuration, ethersConfiguration;
        let provider;
        let ethersCancelOrdersChallengeUserA, ethersCancelOrdersChallengeUserB,
            ethersCancelOrdersChallengeUserC, ethersCancelOrdersChallengeUserD;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            web3CancelOrdersChallenge = glob.web3CancelOrdersChallenge;
            ethersCancelOrdersChallengeOwner = glob.ethersIoCancelOrdersChallenge;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;

            ethersCancelOrdersChallengeUserA = ethersCancelOrdersChallengeOwner.connect(glob.signer_a);
            ethersCancelOrdersChallengeUserB = ethersCancelOrdersChallengeOwner.connect(glob.signer_b);
            ethersCancelOrdersChallengeUserC = ethersCancelOrdersChallengeOwner.connect(glob.signer_c);
            ethersCancelOrdersChallengeUserD = ethersCancelOrdersChallengeOwner.connect(glob.signer_d);

            provider = glob.signer_owner.provider;
            await ethersCancelOrdersChallengeOwner.changeConfiguration(ethersConfiguration.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3CancelOrdersChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersCancelOrdersChallengeOwner.configuration();
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
                    configuration = await web3CancelOrdersChallenge.configuration.call();
                });

                afterEach(async () => {
                    await web3CancelOrdersChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3CancelOrdersChallenge.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3CancelOrdersChallenge.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3CancelOrdersChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersCancelOrdersChallengeOwner.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3CancelOrdersChallenge.validator.call();
                });

                afterEach(async () => {
                    await web3CancelOrdersChallenge.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3CancelOrdersChallenge.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3CancelOrdersChallenge.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3CancelOrdersChallenge.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getCancelledOrdersCount()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersCancelOrdersChallengeOwner.getCancelledOrdersCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('getCancelledOrders()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const orders = await ethersCancelOrdersChallengeOwner.getCancelledOrders(address, 0);
                orders.should.be.an('array').that.has.lengthOf(10);
                orders[0][0].toNumber().should.equal(0);
            });
        });

        describe('isOrderCancelled()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const orderCancelled = await ethersCancelOrdersChallengeOwner.isOrderCancelled(address, address);
                orderCancelled.should.be.false;
            });
        });

        describe('cancelOrders()', () => {
            let overrideOptions, order1, order2, topic, filter;

            before(() => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                order1 = await mocks.mockOrder(glob.owner, {
                    wallet: glob.user_a,
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                order2 = await mocks.mockOrder(glob.owner, {
                    nonce: utils.bigNumberify(2),
                    wallet: glob.user_a,
                    residuals: {
                        current: utils.parseUnits('600', 18),
                        previous: utils.parseUnits('700', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                topic = ethersCancelOrdersChallengeOwner.interface.events.CancelOrdersEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if orders are genuine', () => {
                it('should successfully cancel order', async () => {
                    await ethersCancelOrdersChallengeUserA.cancelOrders([order1, order2], overrideOptions);
                    const count = await ethersCancelOrdersChallengeOwner.getCancelledOrdersCount(glob.user_a);
                    count.toNumber().should.equal(2);
                    const orders = await ethersCancelOrdersChallengeOwner.getCancelledOrders(glob.user_a, 0);
                    orders[0][0].toNumber().should.equal(order1.nonce.toNumber());
                    orders[1][0].toNumber().should.equal(order2.nonce.toNumber());
                });
            });

            describe('if wallet differs from msg.sender', () => {
                beforeEach(async () => {
                    order1 = await mocks.mockOrder(glob.owner, {wallet: glob.user_c});
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by wallet', () => {
                beforeEach(() => {
                    order1.seals.wallet.hash = order1.seals.exchange.hash;
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(() => {
                    order1.seals.exchange.hash = order1.seals.wallet.hash;
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallengeUserA.cancelOrders([order1, order2], overrideOptions).should.be.rejected;
                });
            });
        });

        describe('challengeCancelledOrder()', () => {
            let overrideOptions, order, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                topic = ethersCancelOrdersChallengeOwner.interface.events.ChallengeCancelledOrderEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if order cancelled', () => {
                describe('if cancel order challenge timeout has not expired', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            wallet: glob.user_b,
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });

                        await ethersCancelOrdersChallengeUserB.cancelOrders([order], overrideOptions);

                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                wallet: order.wallet,
                                order: {
                                    hashes: {
                                        wallet: order.seals.wallet.hash,
                                        exchange: order.seals.exchange.hash
                                    }
                                }
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                    });

                    it('should successfully accept the challenge candidate trade', async () => {
                        await ethersCancelOrdersChallengeOwner.challengeCancelledOrder(trade, order.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if cancel order challenge timeout has expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);

                        order = await mocks.mockOrder(glob.owner, {
                            wallet: glob.user_c
                        });

                        await ethersCancelOrdersChallengeUserC.cancelOrders([order], overrideOptions);

                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                wallet: order.wallet,
                                order: {
                                    hashes: {
                                        wallet: order.seals.wallet.hash,
                                        exchange: order.seals.exchange.hash
                                    }
                                }
                            }
                        });
                    });

                    it('should revert', async () => {
                        ethersCancelOrdersChallengeOwner.challengeCancelledOrder(trade, order.wallet, overrideOptions).should.be.rejected;
                    });
                });
            });

            describe('if order has not been cancelled', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallengeOwner.challengeCancelledOrder(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallengeOwner.challengeCancelledOrder(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            })
        });

        describe('challengePhase()', () => {
            describe('if no order has been cancelled for wallet', () => {
                it('should return value corresponding to Closed', async () => {
                    const address = Wallet.createRandom().address;
                    const phase = await ethersCancelOrdersChallengeOwner.challengePhase(address);
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
                        wallet: glob.user_d
                    });
                });

                describe('if cancelled order challenge timeout has expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(0);
                        await ethersCancelOrdersChallengeUserD.cancelOrders([order], overrideOptions);
                    });

                    it('should return value corresponding to Closed', async () => {
                        const phase = await ethersCancelOrdersChallengeOwner.challengePhase(order.wallet);
                        phase.should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });

                describe('if cancelled order challenge timeout has not expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
                        await ethersCancelOrdersChallengeUserD.cancelOrders([order], overrideOptions);
                    });

                    it('should return value corresponding to Dispute', async () => {
                        const phase = await ethersCancelOrdersChallengeOwner.challengePhase(order.wallet);
                        phase.should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });
            });
        });
    });
};
