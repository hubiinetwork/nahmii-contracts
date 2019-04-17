const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const {util: {cryptography}} = require('omphalos-commons');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const SignerManager = artifacts.require('SignerManager');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByTradeOrderResiduals', () => {
        let web3FraudChallengeByTradeOrderResiduals, ethersFraudChallengeByTradeOrderResiduals;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByTradeOrderResiduals = await FraudChallengeByTradeOrderResiduals.new(glob.owner);
            ethersFraudChallengeByTradeOrderResiduals = new Contract(web3FraudChallengeByTradeOrderResiduals.address, FraudChallengeByTradeOrderResiduals.abi, glob.signer_owner);

            web3SignerManager = await SignerManager.new(glob.owner);

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);

            await ethersFraudChallengeByTradeOrderResiduals.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTradeOrderResiduals.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTradeOrderResiduals.setValidator(ethersValidator.address);
            await ethersFraudChallengeByTradeOrderResiduals.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByTradeOrderResiduals.setWalletLocker(ethersWalletLocker.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByTradeOrderResiduals.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByTradeOrderResiduals.address, 'operational_mode', {gasLimit: 1e6});

            await web3Configuration.setFraudStakeFraction(web3.eth.blockNumber + 1, 5e17);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByTradeOrderResiduals.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByTradeOrderResiduals.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByTradeOrderResiduals.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByTradeOrderResiduals.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTradeOrderResiduals.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('setFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3FraudChallengeByTradeOrderResiduals.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTradeOrderResiduals.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTradeOrderResiduals.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3FraudChallengeByTradeOrderResiduals.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByTradeOrderResiduals.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTradeOrderResiduals.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3FraudChallengeByTradeOrderResiduals.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByTradeOrderResiduals.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeByTradeOrderResiduals.walletLocker();
                walletLocker.should.equal(utils.getAddress(ethersWalletLocker.address));
            });
        });

        describe('setWalletLocker()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                let walletLocker;

                beforeEach(async () => {
                    walletLocker = await web3FraudChallengeByTradeOrderResiduals.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeOrderResiduals.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeOrderResiduals.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeByTradeOrderResiduals.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeOrderResiduals.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let firstTrade, lastTrade, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersSecurityBond._reset(overrideOptions);
                await ethersWalletLocker._reset(overrideOptions);

                firstTrade = await mocks.mockTrade(glob.owner, {
                    buyer: {
                        wallet: glob.user_a,
                        order: {
                            hashes: {
                                wallet: cryptography.hash('some buy order wallet hash')
                            }
                        }
                    },
                    seller: {
                        wallet: glob.user_b,
                        order: {
                            hashes: {
                                wallet: cryptography.hash('some sell order wallet hash')
                            }
                        }
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                lastTrade = await mocks.mockTrade(glob.owner, {
                    buyer: {
                        wallet: glob.user_a,
                        order: {
                            hashes: {
                                wallet: cryptography.hash('some buy order wallet hash')
                            }
                        }
                    },
                    seller: {
                        wallet: glob.user_b,
                        order: {
                            hashes: {
                                wallet: cryptography.hash('some sell order wallet hash')
                            }
                        }
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTradeOrderResiduals.interface.events.ChallengeByTradeOrderResidualsEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if last trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(true);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in first trade', () => {
                beforeEach(async () => {
                    firstTrade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, lastTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in last trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is buyer in the one trade and seller in the other', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_c},
                        seller: {wallet: glob.user_a},
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is buyer and buyer order hashes differ', () => {
                beforeEach(async () => {

                    firstTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a
                        },
                        seller: {
                            wallet: glob.user_b,
                            order: {
                                hashes: {
                                    wallet: cryptography.hash('some sell order wallet hash')
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a
                        },
                        seller: {
                            wallet: glob.user_b,
                            order: {
                                hashes: {
                                    wallet: cryptography.hash('some sell order wallet hash')
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is seller and seller order hashes differ', () => {
                beforeEach(async () => {
                    firstTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a,
                            order: {
                                hashes: {
                                    wallet: cryptography.hash('some buy order wallet hash')
                                }
                            }
                        },
                        seller: {
                            wallet: glob.user_b
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: glob.user_a,
                            order: {
                                hashes: {
                                    wallet: cryptography.hash('some buy order wallet hash')
                                }
                            }
                        },
                        seller: {
                            wallet: glob.user_b
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.seller.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not successive trade party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessiveTradesPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not genuine trade order residuals', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradeOrderResiduals(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTradeOrderResiduals.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, overrideOptions
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.isFraudulentTradeHash(lastTrade.seal.hash)).should.be.true;

                    const intendedLock = await ethersWalletLocker.fungibleLocks(0);
                    intendedLock.lockedWallet.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    intendedLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    intendedLock.amount._bn.should.eq.BN(lastTrade.buyer.balances.intended.current._bn);
                    intendedLock.currencyCt.should.equal(lastTrade.currencies.intended.ct);
                    intendedLock.currencyId._bn.should.eq.BN(lastTrade.currencies.intended.id._bn);
                    intendedLock.visibleTimeout._bn.should.eq.BN(0);

                    const conjugateLock = await ethersWalletLocker.fungibleLocks(1);
                    conjugateLock.lockedWallet.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    conjugateLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    conjugateLock.amount._bn.should.eq.BN(lastTrade.buyer.balances.conjugate.current._bn);
                    conjugateLock.currencyCt.should.equal(lastTrade.currencies.conjugate.ct);
                    conjugateLock.currencyId._bn.should.eq.BN(lastTrade.currencies.conjugate.id._bn);
                    conjugateLock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
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

