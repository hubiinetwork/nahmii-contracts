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
    describe('FraudChallengeByDoubleSpentOrders', () => {
        let web3FraudChallengeByDoubleSpentOrders, ethersFraudChallengeByDoubleSpentOrders;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByDoubleSpentOrders = glob.web3FraudChallengeByDoubleSpentOrders;
            ethersFraudChallengeByDoubleSpentOrders = glob.ethersIoFraudChallengeByDoubleSpentOrders;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByDoubleSpentOrders.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByDoubleSpentOrders.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByDoubleSpentOrders.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByDoubleSpentOrders.changeSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByDoubleSpentOrders.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByDoubleSpentOrders.address, 'operational_mode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByDoubleSpentOrders.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByDoubleSpentOrders.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDoubleSpentOrders.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDoubleSpentOrders.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByDoubleSpentOrders.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDoubleSpentOrders.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByDoubleSpentOrders.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByDoubleSpentOrders.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDoubleSpentOrders.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDoubleSpentOrders.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByDoubleSpentOrders.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDoubleSpentOrders.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByDoubleSpentOrders.configuration();
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
                    configuration = await web3FraudChallengeByDoubleSpentOrders.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDoubleSpentOrders.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDoubleSpentOrders.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByDoubleSpentOrders.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDoubleSpentOrders.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByDoubleSpentOrders.validator();
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
                    validator = await web3FraudChallengeByDoubleSpentOrders.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDoubleSpentOrders.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDoubleSpentOrders.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByDoubleSpentOrders.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDoubleSpentOrders.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade1, trade2, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
                await ethersConfiguration.setDoubleSpentOrderStake(utils.bigNumberify(1000), mocks.address0, utils.bigNumberify(0));
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                trade1 = await mocks.mockTrade(glob.owner, {
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                trade2 = await mocks.mockTrade(glob.owner, {
                    buyer: {
                        wallet: glob.user_c
                    },
                    seller: {
                        wallet: glob.user_d
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByDoubleSpentOrders.interface.events.ChallengeByDoubleSpentOrdersEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if last trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(true);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if double spent buy order', () => {
                beforeEach(async () => {
                    trade1 = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a,
                            order: {
                                hashes: {
                                    exchange: cryptography.hash('some buy order exchange hash')
                                }
                            }
                        },
                        seller: {
                            wallet: glob.user_b
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    trade2 = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_c,
                            order: {
                                hashes: {
                                    exchange: cryptography.hash('some buy order exchange hash')
                                }
                            }
                        },
                        seller: {
                            wallet: glob.user_d
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent trades and stage in security bond', async () => {
                    await ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradesCount, doubleSpenderWalletsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.doubleSpenderWalletsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(2).should.be.true;
                    doubleSpenderWalletsCount.eq(2).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.figure.currency.ct.should.equal(mocks.address0);
                    stage.figure.currency.id.should.deep.equal(utils.bigNumberify(0));
                    stage.figure.amount.eq(utils.bigNumberify(1000)).should.be.true;
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if double spent sell order', () => {
                beforeEach(async () => {
                    trade1 = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a
                        },
                        seller: {
                            wallet: glob.user_b,
                            order: {
                                hashes: {
                                    exchange: cryptography.hash('some sell order exchange hash')
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    trade2 = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_c
                        },
                        seller: {
                            wallet: glob.user_d,
                            order: {
                                hashes: {
                                    exchange: cryptography.hash('some sell order exchange hash')
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent trades and stage in security bond', async () => {
                    await ethersFraudChallengeByDoubleSpentOrders.challenge(
                        trade1, trade2, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradesCount, doubleSpenderWalletsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.doubleSpenderWalletsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(2).should.be.true;
                    doubleSpenderWalletsCount.eq(2).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.figure.currency.ct.should.equal(mocks.address0);
                    stage.figure.currency.id.should.deep.equal(utils.bigNumberify(0));
                    stage.figure.amount.eq(utils.bigNumberify(1000)).should.be.true;
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

