const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const cryptography = require('omphalos-commons').util.cryptography;
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByDuplicateDealNonceOfTradeAndPayment', () => {
        let web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment, ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment = glob.web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment;
            ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment = glob.ethersIoFraudChallengeByDuplicateDealNonceOfTradeAndPayment;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.configuration();
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
                    configuration = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.validator();
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
                    validator = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.securityBond();
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
                    securityBond = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfTradeAndPayment.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByDuplicateDealNonceOfTradeAndPayment()', () => {
            let trade, payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
                await ethersConfiguration.setDuplicateDealNonceStake(mocks.address0, utils.bigNumberify(1000));
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                trade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(1),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                payment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(2),
                    sender: {
                        wallet: glob.user_c
                    },
                    recipient: {
                        wallet: glob.user_d
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.interface.events.ChallengeByDuplicateDealNonceOfTradeAndPaymentEvent.topics
                );
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.challengeByDuplicateDealNonceOfTradeAndPayment(
                        trade, payment, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.challengeByDuplicateDealNonceOfTradeAndPayment(
                        trade, payment, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(true);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.challengeByDuplicateDealNonceOfTradeAndPayment(
                        trade, payment, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if nonces are equal', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a
                        },
                        seller: {
                            wallet: glob.user_b
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {
                            wallet: glob.user_c
                        },
                        recipient: {
                            wallet: glob.user_d
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent trades and stage in security bond', async () => {
                    await ethersFraudChallengeByDuplicateDealNonceOfTradeAndPayment.challengeByDuplicateDealNonceOfTradeAndPayment(
                        trade, payment, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradesCount, fraudulentPaymentsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(1).should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.currency.should.equal(mocks.address0);
                    stage.amount.eq(utils.bigNumberify(1000)).should.be.true;
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

