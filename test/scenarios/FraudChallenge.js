const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const mocks = require('../mocks');
const MockedClientFund = artifacts.require("MockedClientFund");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = (glob) => {
    describe('FraudChallenge', () => {
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Hasher, ethersHasher;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallenge = glob.web3FraudChallenge;
            ethersFraudChallenge = glob.ethersIoFraudChallenge;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            web3Hasher = glob.web3Hasher;
            ethersHasher = glob.ethersIoHasher;
            web3Validator = glob.web3Validator;
            ethersValidator = glob.ethersIoValidator;

            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new ethers.Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new ethers.Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersValidator.changeConfiguration(ethersConfiguration.address);
            await ethersValidator.changeHasher(ethersHasher.address);

            await ethersFraudChallenge.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallenge.changeClientFund(ethersClientFund.address);
            await ethersFraudChallenge.changeSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallenge.changeHasher(ethersHasher.address);
            await ethersFraudChallenge.changeValidator(ethersValidator.address);

            await ethersConfiguration.registerService(ethersFraudChallenge.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('fraudulentTrade()', () => {
            it('should equal value initialized', async () => {
                const fraudulentTrade = await ethersFraudChallenge.fraudulentTrade();
                fraudulentTrade[0].toNumber().should.equal(0); // Nonce
            });
        });

        describe('fraudulentPayment()', () => {
            it('should equal value initialized', async () => {
                const fraudulentPayment = await ethersFraudChallenge.fraudulentPayment();
                fraudulentPayment[0].toNumber().should.equal(0); // Nonce
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallenge.configuration();
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
                    configuration = await web3FraudChallenge.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallenge.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallenge.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallenge.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3FraudChallenge.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallenge.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallenge.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallenge.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallenge.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        // TODO Enable when deployment out-of-gas is solved
        describe.skip('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallenge.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        // TODO Enable when deployment out-of-gas is solved
        describe.skip('changeSecurityBond()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3FraudChallenge.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallenge.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallenge.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallenge.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallenge.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('hasher()', () => {
            it('should equal value initialized', async () => {
                const hasher = await ethersFraudChallenge.hasher();
                hasher.should.equal(utils.getAddress(ethersHasher.address));
            });
        });

        describe('changeHasher()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let hasher;

                beforeEach(async () => {
                    hasher = await web3FraudChallenge.hasher.call();
                });

                afterEach(async () => {
                    await web3FraudChallenge.changeHasher(hasher);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallenge.changeHasher(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeHasherEvent');
                    const hasher = await web3FraudChallenge.hasher();
                    utils.getAddress(hasher).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallenge.changeHasher(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallenge.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3FraudChallenge.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallenge.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallenge.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallenge.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallenge.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersFraudChallenge.isSeizedWallet(address);
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallenge.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallenge.seizedWallets(0).should.be.rejected;
            })
        });

        describe('isDoubleSpenderWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersFraudChallenge.isDoubleSpenderWallet(address);
                result.should.be.false;
            });
        });

        describe('doubleSpenderWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallenge.doubleSpenderWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('doubleSpenderWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallenge.doubleSpenderWallets(0).should.be.rejected;
            })
        });

        describe('challengeByTrade()', () => {
            let trade, overrideOptions, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
                await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
                await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
                await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
                await ethersConfiguration.setFalseWalletSignatureStake(mocks.address0, utils.parseUnits('100', 18));

                topic = ethersFraudChallenge.interface.events.ChallengeByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if trade is genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if (exchange) hash differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    trade.seal.hash = utils.id('some non-existent hash');
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed (by exchange)', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    const sign = mocks.createWeb3Signer(glob.user_a);
                    trade.seal.signature = await sign(trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if buyer address equals seller address', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_a},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer address equals owner address', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.owner},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            balances: {
                                intended: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s current conjugate balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s amount is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    current: utils.parseUnits('4000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s amount is smaller than its previous residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('5000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s previous residual is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('300', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is greater than the nominal maker fee', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('1.0', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is smaller than the minimum maker fee', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('0.001', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller address equals owner address', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            address: glob.owner
                        }
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            balances: {
                                intended: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s current conjugate balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s amount is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    current: utils.parseUnits('6000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s amount is smaller than its previous residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('7000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s previous residual is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('500', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is greater than the nominal taker fee', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.0002', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is smaller than the minimum taker fee', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.000002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment, overrideOptions, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
                await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
                await ethersConfiguration.setFalseWalletSignatureStake(mocks.address0, utils.parseUnits('100', 18));

                topic = ethersFraudChallenge.interface.events.ChallengeByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if payment it genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet hash differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.wallet.hash = utils.id('some non-existent hash');
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if exchange hash differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.exchange.hash = utils.id('some non-existent hash');
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.exchange.signature = payment.seals.wallet.signature;
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by wallet', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    const signAsWallet = mocks.createWeb3Signer(glob.user_a);
                    payment.seals.wallet.signature = await signAsWallet(payment.seals.wallet.hash);
                    payment.seals.exchange.hash = mocks.hashPaymentAsExchange(payment);
                    const signAsExchange = mocks.createWeb3Signer(glob.owner);
                    payment.seals.exchange.signature = await signAsExchange(payment.seals.exchange.hash);
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if sender address equals recipient address', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {wallet: glob.user_a},
                        recipient: {wallet: glob.user_a},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if sender\'s current balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {
                            balances: {
                                current: utils.bigNumberify(0)
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is greater than the nominal payment fee', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('2.0', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('0.2', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100)),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is smaller than the minimum payment fee', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('0.002', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if recipient\'s current balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        recipient: {
                            balances: {
                                current: utils.bigNumberify(0)
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSender.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeBySuccessiveTrades()', () => {
            let overrideOptions, firstTrade, lastTrade, currency, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeBySuccessiveTradesEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19549.1', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19549.1', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in last trade is not equal to current balance in first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19549.1', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('1000', 18) // <---- modified ----
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade party\'s net fee in last trade is not incremented by single fee in last trade relative to net fee in first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19549.1', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.4', 18), // <---- modified ----
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeBySuccessivePayments()', () => {
            let overrideOptions, firstPayment, lastPayment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                firstPayment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    sender: {
                        wallet: glob.user_a
                    },
                    recipient: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                lastPayment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(20),
                    amount: utils.parseUnits('50', 18),
                    sender: {
                        wallet: glob.user_b,
                        nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                        balances: {
                            current: utils.parseUnits('19649.9', 18),
                            previous: utils.parseUnits('19700', 18)
                        },
                        netFee: utils.parseUnits('0.1', 18)
                    },
                    recipient: {
                        wallet: glob.user_a,
                        nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                        balances: {
                            current: utils.parseUnits('9449.8', 18),
                            previous: utils.parseUnits('9399.8', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    singleFee: utils.parseUnits('0.1', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeBySuccessivePaymentsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payments are genuine', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('9399.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in last payment is not incremented by 1 relative to first payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('9399.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in last payment is not equal to current balance in first payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('1000', 18) // <---- modified ----
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(lastPayment.recipient.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(lastPayment.recipient.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment party\'s net fee in last payment is not incremented by single fee in last payment relative to net fee in first payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('9399.8', 18)
                            },
                            netFee: utils.parseUnits('0.4', 18) // <---- modified ----
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(lastPayment.recipient.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(lastPayment.recipient.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByPaymentSucceedingTrade()', () => {
            let overrideOptions, currency, trade, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                trade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeByPaymentSucceedingTradeEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trade and payment are genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in payment is not incremented by 1 relative to trade', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in payment is not equal to current balance in trade', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('1000', 18) // <---- modified ----
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, payment.recipient.wallet, currency, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment party\'s net fee in payment is not incremented by single fee in payment relative to net fee in trade', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            wallet: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            wallet: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.4', 18) // <---- modified ----
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, payment.recipient.wallet, currency, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPayment(),
                        ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByTradeSucceedingPayment()', () => {
            let overrideOptions, currency, payment, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                payment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    sender: {
                        wallet: glob.user_a
                    },
                    recipient: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeByTradeSucceedingPaymentEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payment and trade are genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in trade is not incremented by 1 relative to payment', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in trade is not equal to current balance in payment', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('1000', 18) // <---- modified ----
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.2', 18),
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, trade.seller.wallet, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade party\'s net fee in trade is not incremented by single fee in trade relative to net fee in payment', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.4', 18), // <---- modified ----
                                conjugate: utils.parseUnits('0.00005', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('50', 18),
                                net: utils.parseUnits('-50', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.05', 18),
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, trade.seller.wallet, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByTradeOrderResiduals()', () => {
            let overrideOptions, firstTrade, lastTrade, currency, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeByTradeOrderResidualsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is buyer in the one trade and seller in the other trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: firstTrade.seller.wallet, // <---- modified ----
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: firstTrade.buyer.wallet, // <---- modified ----
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous residuals in last trade is not equal to current residuals in first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('100', 18) // <---- modified ----
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, lastTrade.buyer.wallet, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isSeizedWallet(lastTrade.buyer.wallet),
                        ethersClientFund.seizures(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    seizure.source.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByDoubleSpentOrders()', () => {
            let overrideOptions, firstTrade, lastTrade, currency, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudChallenge.interface.events.ChallengeByDoubleSpentOrdersEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions).should.be.rejected;
                });
            });

            describe('if first trade\'s buy order equals last trade\'s buy order', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    exchange: firstTrade.buyer.order.hashes.exchange // <---- modified ----
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isDoubleSpenderWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    doubleSpenderWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if first trade\'s sell order equals last trade\'s sell order', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            wallet: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            wallet: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    exchange: firstTrade.seller.order.hashes.exchange // <---- modified ----
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTrade(),
                        ethersFraudChallenge.isDoubleSpenderWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    doubleSpenderWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};
