const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedClientFund = artifacts.require('MockedClientFund');

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
        let web3SecurityBond, ethersSecurityBond;
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
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByTradeSucceedingPayment.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setValidator(ethersValidator.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByTradeSucceedingPayment.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByTradeSucceedingPayment.address, 'operational_mode', {gasLimit: 1e6}
            );
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

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTradeSucceedingPayment.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('setFraudChallenge()', () => {
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
                    await web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTradeSucceedingPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTradeSucceedingPayment.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
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
                    await web3FraudChallengeByTradeSucceedingPayment.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByTradeSucceedingPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTradeSucceedingPayment.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
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
                    await web3FraudChallengeByTradeSucceedingPayment.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByTradeSucceedingPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByTradeSucceedingPayment.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('setClientFund()', () => {
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
                    await web3FraudChallengeByTradeSucceedingPayment.setClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClientFundEvent');
                    const clientFund = await web3FraudChallengeByTradeSucceedingPayment.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersSecurityBond._reset(overrideOptions);
                await ethersClientFund._reset(overrideOptions);

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

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradeHashesCount, lockedWalletsCount, lockedWallet, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.lockedWalletsCount(),
                        ethersClientFund.lockedWallets(utils.bigNumberify(0)),
                        ethersClientFund.locks(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentTradeTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradeHashesCount, lockedWalletsCount, lockedWallet, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.lockedWalletsCount(),
                        ethersClientFund.lockedWallets(utils.bigNumberify(0)),
                        ethersClientFund.locks(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.target.should.equal(utils.getAddress(glob.owner));
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

