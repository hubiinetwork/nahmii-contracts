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
    describe('FraudChallengeByPaymentSucceedingTrade', () => {
        let web3FraudChallengeByPaymentSucceedingTrade, ethersFraudChallengeByPaymentSucceedingTrade;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3ClientFund, ethersClientFund;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByPaymentSucceedingTrade = glob.web3FraudChallengeByPaymentSucceedingTrade;
            ethersFraudChallengeByPaymentSucceedingTrade = glob.ethersIoFraudChallengeByPaymentSucceedingTrade;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByPaymentSucceedingTrade.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByPaymentSucceedingTrade.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByPaymentSucceedingTrade.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByPaymentSucceedingTrade.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByPaymentSucceedingTrade.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByPaymentSucceedingTrade.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3FraudChallengeByPaymentSucceedingTrade.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByPaymentSucceedingTrade.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByPaymentSucceedingTrade.configuration();
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
                    configuration = await web3FraudChallengeByPaymentSucceedingTrade.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByPaymentSucceedingTrade.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByPaymentSucceedingTrade.validator();
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
                    validator = await web3FraudChallengeByPaymentSucceedingTrade.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByPaymentSucceedingTrade.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByPaymentSucceedingTrade.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3FraudChallengeByPaymentSucceedingTrade.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeByPaymentSucceedingTrade.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);

                trade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByPaymentSucceedingTrade.interface.events.ChallengeByPaymentSucceedingTradeEvent.topics
                );
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in trade', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, payment.sender.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in payment', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in trade', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_b},
                        currencies: {
                            intended: Wallet.createRandom().address,
                            conjugate: Wallet.createRandom().address,
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, payment.currency, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in payment', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {wallet: glob.user_a},
                        recipient: {wallet: glob.user_b},
                        currency: Wallet.createRandom().address,
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not successive party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessiveTradePaymentPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradePaymentBalances(false);
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    );
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive net fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradePaymentNetFees(false);
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended, overrideOptions
                    );
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
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

