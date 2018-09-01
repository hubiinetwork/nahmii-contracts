const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedCancelOrdersChallenge = artifacts.require("MockedCancelOrdersChallenge");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe.only('DriipSettlementChallenge', () => {
        let web3DriipSettlementChallenge, ethersDriipSettlementChallengeOwner;
        let web3DriipSettlementChallenger, ethersDriipSettlementChallenger;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let ethersDriipSettlementChallengeUserA, ethersDriipSettlementChallengeUserB;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3DriipSettlementChallenge = glob.web3DriipSettlementChallenge;
            ethersDriipSettlementChallengeOwner = glob.ethersIoDriipSettlementChallenge;
            web3DriipSettlementChallenger = glob.web3DriipSettlementChallenger;
            ethersDriipSettlementChallenger = glob.ethersIoDriipSettlementChallenger;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new(/*glob.owner*/);
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);

            ethersDriipSettlementChallengeUserA = ethersDriipSettlementChallengeOwner.connect(glob.signer_a);
            ethersDriipSettlementChallengeUserB = ethersDriipSettlementChallengeOwner.connect(glob.signer_b);

            await ethersConfiguration.setUnchallengeOrderCandidateByTradeStake(utils.bigNumberify(1000), mocks.address0, utils.bigNumberify(0));

            await ethersDriipSettlementChallengeOwner.changeConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeOwner.changeValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeOwner.changeDriipSettlementChallenger(ethersDriipSettlementChallenger.address);

            await ethersDriipSettlementChallenger.changeDriipSettlementChallenge(ethersDriipSettlementChallengeOwner.address);
            await ethersDriipSettlementChallenger.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementChallenger.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDriipSettlementChallenger.changeConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallenger.changeValidator(ethersValidator.address);
            await ethersDriipSettlementChallenger.changeSecurityBond(ethersSecurityBond.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setDriipSettlementChallengeTimeout(1e4);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3DriipSettlementChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersDriipSettlementChallengeOwner.configuration();
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
                    configuration = await web3DriipSettlementChallenge.configuration.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3DriipSettlementChallenge.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersDriipSettlementChallengeOwner.validator();
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
                    validator = await web3DriipSettlementChallenge.validator.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementChallenge.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3DriipSettlementChallenge.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallenger()', () => {
            it('should equal value initialized', async () => {
                const driipSettlementChallenger = await ethersDriipSettlementChallengeOwner.driipSettlementChallenger();
                driipSettlementChallenger.should.equal(utils.getAddress(ethersDriipSettlementChallenger.address));
            });
        });

        describe('changeDriipSettlementChallenger()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let driipSettlementChallenger;

                beforeEach(async () => {
                    driipSettlementChallenger = await web3DriipSettlementChallenge.driipSettlementChallenger.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementChallenge.changeDriipSettlementChallenger(driipSettlementChallenger);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.changeDriipSettlementChallenger(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDriipSettlementChallengerEvent');
                    const driipSettlementChallenger = await web3DriipSettlementChallenge.driipSettlementChallenger();
                    utils.getAddress(driipSettlementChallenger).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.changeDriipSettlementChallenger(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletChallengedTradesCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDriipSettlementChallengeOwner.walletChallengedTradesCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('walletChallengedPaymentsCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersDriipSettlementChallengeOwner.walletChallengedPaymentsCount(address);
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidateOrdersCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDriipSettlementChallengeOwner.challengeCandidateOrdersCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidateTradesCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDriipSettlementChallengeOwner.challengeCandidateTradesCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('challengeCandidatePaymentsCount()', () => {
            it('should return value initialized ', async () => {
                const count = await ethersDriipSettlementChallengeOwner.challengeCandidatePaymentsCount();
                count.toNumber().should.equal(0);
            });
        });

        describe('startChallengeFromTrade()', () => {
            let overrideOptions, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 4e6};
            });

            beforeEach(async () => {
                await ethersValidator.reset(overrideOptions);

                topic = ethersDriipSettlementChallengeOwner.interface.events['StartChallengeFromTradeEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if caller is buyer party with no ongoing driip settlement challenge', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                    const count = await ethersDriipSettlementChallengeOwner.walletChallengedTradesCount(trade.buyer.wallet);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if caller is seller party with no ongoing driip settlement challenge', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                    const count = await ethersDriipSettlementChallengeOwner.walletChallengedTradesCount(trade.buyer.wallet);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                    trade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if staging more of intended currency than allowed by balance', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current.mul(2),
                        trade.buyer.balances.conjugate.current, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if staging more of conjugate currency than allowed by balance', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current.mul(2), overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeUserA.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if called before an ongoing driip settlement challenge has expired', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    ).should.be.rejected;
                });
            });
        });

        describe('startChallengeFromPayment()', () => {
            let overrideOptions, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersValidator.reset(overrideOptions);

                topic = ethersDriipSettlementChallengeOwner.interface.events['StartChallengeFromPaymentEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if caller is sender party with no ongoing driip settlement challenge', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                    );
                    const count = await ethersDriipSettlementChallengeOwner.walletChallengedPaymentsCount(payment.sender.wallet);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if caller is recipient party with no ongoing driip settlement challenge', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should operate successfully', async () => {
                    await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.recipient.wallet, payment.recipient.balances.current, overrideOptions
                    );
                    const count = await ethersDriipSettlementChallengeOwner.walletChallengedPaymentsCount(payment.recipient.wallet);
                    count.toNumber().should.equal(1);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                    payment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if staging more than allowed by balance', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current.mul(2), overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if called by neither owner nor trade party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeUserA.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if called before an ongoing driip settlement challenge has expired', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                        payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                    ).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengePhase()', () => {
            describe('if no driip settlement challenge has been started for given wallet', () => {
                it('should return 0 and Closed', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await ethersDriipSettlementChallengeOwner.driipSettlementChallengePhase(address);
                    result[0].eq(utils.bigNumberify(0)).should.be.true;
                    result[1].should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if driip settlement challenge has been started for given wallet', () => {
                let overrideOptions, trade;

                before(async () => {
                    overrideOptions = {gasLimit: 2e6};
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                describe('if driip settlement challenge is ongoing for given wallet', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                            trade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should return challenged driip nonce and Dispute', async () => {
                        const result = await ethersDriipSettlementChallengeOwner.driipSettlementChallengePhase(trade.buyer.wallet);
                        result[0].eq(trade.nonce).should.be.true;
                        result[1].should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });

                describe('if driip settlement challenge has completed for given wallet', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setDriipSettlementChallengeTimeout(0);
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                            trade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should return challenged driip nonce and Closed', async () => {
                        const result = await ethersDriipSettlementChallengeOwner.driipSettlementChallengePhase(trade.buyer.wallet);
                        result[0].eq(trade.nonce).should.be.true;
                        result[1].should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });
            });
        });

        describe('driipSettlementChallengeResult()', () => {
            describe('if no driip settlement challenge has been started for given wallet', () => {
                it('should return (Unknown, address(0))', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await ethersDriipSettlementChallengeOwner.driipSettlementChallengeResult(address, 0);
                    result[0].should.equal(mocks.challengeStatuses.indexOf('Unknown'));
                    result[1].should.equal('0x0000000000000000000000000000000000000000');
                });
            });

            describe('if driip settlement challenge has been started for given wallet', () => {
                let overrideOptions, trade;

                before(async () => {
                    overrideOptions = {gasLimit: 2e6};
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                });

                it('should return challenged driip challenge result', async () => {
                    const result = await ethersDriipSettlementChallengeOwner.driipSettlementChallengeResult(trade.buyer.wallet, trade.nonce);
                    result[0].should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                    result[1].should.equal('0x0000000000000000000000000000000000000000');
                });
            });
        });

        describe('challengeByOrder()', () => {
            let overrideOptions, order, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersCancelOrdersChallenge.reset(overrideOptions);

                await ethersConfiguration.setDriipSettlementChallengeTimeout(2);

                topic = ethersDriipSettlementChallenger.interface.events['ChallengeByOrderEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineOrderSeals(false);
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentOrderExchangeHash(true);
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order has been previously cancelled', async () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);

                    await ethersCancelOrdersChallenge.cancelOrders([order], overrideOptions);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing driip settlement challenge', async () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge has expired', async () => {
                let trade;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    await ethersConfiguration.setDriipSettlementChallengeTimeout(0);
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing driip settlement challenge from trade', () => {
                let trade;

                describe('if order currency is different than trade currencies', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            placement: {
                                currencies: {
                                    conjugate: {
                                        ct: '0x0000000000000000000000000000000000000003',
                                        id: utils.bigNumberify(0)
                                    }
                                }
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: order.wallet},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                            trade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of driip balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: order.wallet},
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });

                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            trade, trade.buyer.wallet, 0,
                            0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of driip balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                wallet: order.wallet
                            },
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });

                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                            trade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip, update challenge with challenger and emit event', async () => {
                        await ethersDriipSettlementChallengeUserA.challengeByOrder(order, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidateOrdersCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(trade.buyer.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });

            describe('if there is ongoing driip settlement challenge from payment', () => {
                let payment;

                describe('if order currency is different than payment currency', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {wallet: glob.user_b});
                        payment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: order.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is within limits of driip balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {wallet: glob.user_c});
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: order.placement.currencies.conjugate,
                            sender: {wallet: order.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            payment, payment.sender.wallet, 0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions).should.be.rejected;
                    });
                });

                describe('if order amount is beyond limits of driip balance', () => {
                    beforeEach(async () => {
                        order = await mocks.mockOrder(glob.owner, {
                            wallet: glob.user_d,
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                        payment = await mocks.mockPayment(glob.owner, {
                            currency: order.placement.currencies.conjugate,
                            sender: {
                                wallet: order.wallet
                            },
                            blockNumber: utils.bigNumberify(blockNumber20)
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            payment, payment.sender.wallet, payment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip and emit event', async () => {
                        await ethersDriipSettlementChallengeUserB.challengeByOrder(order, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidateOrdersCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(payment.sender.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_b));
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
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                await ethersConfiguration.setDriipSettlementChallengeTimeout(2);

                topic = ethersDriipSettlementChallenger.interface.events['UnchallengeOrderCandidateByTradeEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                    order.seals.wallet.signature = order.seals.exchange.signature;
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
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
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
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
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
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
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet of order is not trade party', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
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
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentTradeHash(true);
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade\'s order\'s exchange hash is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentOrderExchangeHash(true);
                    order = await mocks.mockOrder(glob.owner);
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: order.wallet}
                    });
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge candidate is not order', () => {
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

                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                    await ethersDriipSettlementChallengeOwner.challengeByTrade(tradeCandidate, tradeCandidate.buyer.wallet, overrideOptions);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if challenge order is one of of orders filled in trade', () => {
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

                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        trade, trade.buyer.wallet, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, overrideOptions
                    );
                    await ethersDriipSettlementChallengeOwner.challengeByOrder(order, overrideOptions);
                });

                it('should requalify challenged driip, stage in SecurityBond and emit event', async () => {
                    await ethersDriipSettlementChallengeOwner.unchallengeOrderCandidateByTrade(order, unchallengeTradeCandidate, overrideOptions);
                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                    const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(trade.buyer.wallet);
                    driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Qualified'));
                    driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('None'));
                    driipSettlementChallenge.candidateIndex.eq(0).should.be.true;
                    driipSettlementChallenge.challenger.should.equal(mocks.address0);
                    const stage = await ethersSecurityBond.stages(0);
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.figure.currency.ct.should.equal(mocks.address0);
                    stage.figure.currency.id.eq(utils.bigNumberify(0)).should.be.true;
                    stage.figure.amount.eq(1000).should.be.true;
                });
            })
        });

        describe('challengeByTrade()', () => {
            let overrideOptions, candidateTrade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersCancelOrdersChallenge.reset(overrideOptions);

                await ethersConfiguration.setDriipSettlementChallengeTimeout(2);

                topic = ethersDriipSettlementChallenger.interface.events['ChallengeByTradeEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                    candidateTrade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not signed by exchange', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentTradeHash(true);
                    candidateTrade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade\'s order has been previously cancelled', () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                    await ethersCancelOrdersChallenge.cancelOrdersByHash([candidateTrade.buyer.order.hashes.exchange], overrideOptions);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing driip settlement challenge', async () => {
                beforeEach(async () => {
                    candidateTrade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner);
                    candidateTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: challengedTrade.buyer.wallet}
                    });
                    await ethersConfiguration.setDriipSettlementChallengeTimeout(0);
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                        challengedTrade.buyer.balances.conjugate.current, overrideOptions
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing driip settlement challenge from trade', () => {
                let challengedTrade;

                describe('if candidate trade\'s considered currency is different than challenged trade\'s currencies', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner);
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            currencies: {
                                conjugate: {
                                    ct: '0x0000000000000000000000000000000000000003',
                                    id: 0
                                }
                            },
                            buyer: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                            challengedTrade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s single transfer is within limit of challenged trade\'s balance', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner);
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, 0, 0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                            challengedTrade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip, update challenge with challenger and emit event', async () => {
                        await ethersDriipSettlementChallengeUserA.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidateTradesCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(candidateTrade.buyer.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Trade'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });

            describe('if there is ongoing driip settlement challenge from payment', () => {
                let challengedPayment;

                describe('if candidate trade\'s considered currency is different than challenged payment\'s currency', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: glob.user_b}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet,
                            challengedPayment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is within limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: {
                                ct: '0x0000000000000000000000000000000000000002'
                            },
                            sender: {wallet: glob.user_c}
                        });
                        candidateTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet, 0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if candidate trade\'s considered single transfer is beyond limit of challenged payment\'s balance', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            currency: {
                                ct: '0x0000000000000000000000000000000000000002'
                            },
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet,
                            challengedPayment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip, update challenge with challenger and emit event', async () => {
                        await ethersDriipSettlementChallengeUserA.challengeByTrade(candidateTrade, candidateTrade.buyer.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidateTradesCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(candidateTrade.buyer.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Trade'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
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
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);

                await ethersConfiguration.setDriipSettlementChallengeTimeout(2);

                topic = ethersDriipSettlementChallenger.interface.events['ChallengeByPaymentEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                    candidatePayment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not signed by exchange', () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is recipient in candidate payment', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.recipient.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentPaymentExchangeHash(true);
                    candidatePayment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is no ongoing driip settlement challenge', async () => {
                beforeEach(async () => {
                    candidatePayment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge has expired', async () => {
                let challengedTrade;

                beforeEach(async () => {
                    challengedTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a}
                    });
                    candidatePayment = await mocks.mockPayment(glob.owner, {
                        sender: {wallet: challengedTrade.buyer.wallet}
                    });
                    await ethersConfiguration.setDriipSettlementChallengeTimeout(0);
                    await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                        challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                        challengedTrade.buyer.balances.conjugate.current, overrideOptions
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if there is ongoing driip settlement challenge from trade', () => {
                let challengedTrade;

                describe('if candidate payment\'s currency is different than challenged trade\'s currencies', () => {
                    beforeEach(async () => {
                        challengedTrade = await mocks.mockTrade(glob.owner, {
                            buyer: {wallet: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: {
                                ct: '0x0000000000000000000000000000000000000003',
                                id: 0
                            },
                            sender: {wallet: challengedTrade.buyer.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                            challengedTrade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, 0, 0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromTrade(
                            challengedTrade, challengedTrade.buyer.wallet, challengedTrade.buyer.balances.intended.current,
                            challengedTrade.buyer.balances.conjugate.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip, update challenge with challenger and emit event', async () => {
                        await ethersDriipSettlementChallengeUserA.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidatePaymentsCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(candidatePayment.sender.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Payment'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });

            describe('if there is ongoing driip settlement challenge from payment', () => {
                let challengedPayment;

                describe('if candidate payment\'s currency is different than challenged payment\'s currencies', () => {
                    beforeEach(async () => {
                        challengedPayment = await mocks.mockPayment(glob.owner, {
                            sender: {wallet: glob.user_b}
                        });
                        candidatePayment = await mocks.mockPayment(glob.owner, {
                            currency: {
                                ct: '0x0000000000000000000000000000000000000002',
                                id: 0
                            },
                            sender: {wallet: challengedPayment.sender.wallet}
                        });
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet,
                            challengedPayment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet, 0, overrideOptions
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementChallengeOwner.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlementChallengeOwner.startChallengeFromPayment(
                            challengedPayment, challengedPayment.sender.wallet,
                            challengedPayment.sender.balances.current, overrideOptions
                        );
                    });

                    it('should disqualify challenged driip, update challenge with challenger and emit event', async () => {
                        await ethersDriipSettlementChallengeUserA.challengeByPayment(candidatePayment, candidatePayment.sender.wallet, overrideOptions);
                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                        const candidatesCount = await ethersDriipSettlementChallengeOwner.challengeCandidatePaymentsCount();
                        const driipSettlementChallenge = await ethersDriipSettlementChallengeOwner.walletChallengeMap(candidatePayment.sender.wallet);
                        driipSettlementChallenge.status.should.equal(mocks.challengeStatuses.indexOf('Disqualified'));
                        driipSettlementChallenge.candidateType.should.equal(mocks.challengeCandidateTypes.indexOf('Payment'));
                        driipSettlementChallenge.candidateIndex.eq(candidatesCount.sub(1)).should.be.true;
                        driipSettlementChallenge.challenger.should.equal(utils.getAddress(glob.user_a));
                    });
                });
            });
        });
    });
};
