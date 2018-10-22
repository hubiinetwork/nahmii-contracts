const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedClientFund = artifacts.require("MockedClientFund");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByTradeSucceedingPayment', () => {
        let web3FraudChallengeByTradeSucceedingPayment, ethersFraudChallengeByTradeSucceedingPayment;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3ClientFund, ethersClientFund;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByTradeSucceedingPayment = glob.web3FraudChallengeByTradeSucceedingPayment;
            ethersFraudChallengeByTradeSucceedingPayment = glob.ethersIoFraudChallengeByTradeSucceedingPayment;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByTradeSucceedingPayment.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTradeSucceedingPayment.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTradeSucceedingPayment.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByTradeSucceedingPayment.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByTradeSucceedingPayment.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByTradeSucceedingPayment.address, 'operational_mode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByTradeSucceedingPayment.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByTradeSucceedingPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('changeDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDeployerEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOperatorEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTradeSucceedingPayment.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3FraudChallengeByTradeSucceedingPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTradeSucceedingPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTradeSucceedingPayment.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3FraudChallengeByTradeSucceedingPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByTradeSucceedingPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTradeSucceedingPayment.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3FraudChallengeByTradeSucceedingPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByTradeSucceedingPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByTradeSucceedingPayment.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3FraudChallengeByTradeSucceedingPayment.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeByTradeSucceedingPayment.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);

                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                trade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTradeSucceedingPayment.interface.events.ChallengeByTradeSucceedingPaymentEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in payment', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, trade.buyer.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in trade', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in payment', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {
                            wallet: glob.user_a
                        },
                        recipient: {
                            wallet: glob.user_b
                        },
                        currency: {
                            ct: Wallet.createRandom().address
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in trade', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a
                        },
                        seller: {
                            wallet: glob.user_b
                        },
                        currencies: {
                            intended: {
                                ct: Wallet.createRandom().address
                            },
                            conjugate: {
                                ct: Wallet.createRandom().address
                            },
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not successive party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessivePaymentTradePartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentTradeBalances(false);
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentTradeTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });
        });
    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};

