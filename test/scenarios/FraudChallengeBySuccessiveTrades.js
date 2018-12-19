const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
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
    describe('FraudChallengeBySuccessiveTrades', () => {
        let web3FraudChallengeBySuccessiveTrades, ethersFraudChallengeBySuccessiveTrades;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeBySuccessiveTrades = glob.web3FraudChallengeBySuccessiveTrades;
            ethersFraudChallengeBySuccessiveTrades = glob.ethersIoFraudChallengeBySuccessiveTrades;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);

            await ethersFraudChallengeBySuccessiveTrades.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeBySuccessiveTrades.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeBySuccessiveTrades.setValidator(ethersValidator.address);
            await ethersFraudChallengeBySuccessiveTrades.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeBySuccessiveTrades.setWalletLocker(ethersWalletLocker.address, false);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeBySuccessiveTrades.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeBySuccessiveTrades.address, 'operational_mode', {gasLimit: 1e6}
            );

            await web3Configuration.setFraudStakeFraction(web3.eth.blockNumber + 1, 5e17);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeBySuccessiveTrades.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeBySuccessiveTrades.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeBySuccessiveTrades.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeBySuccessiveTrades.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeBySuccessiveTrades.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeBySuccessiveTrades.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeBySuccessiveTrades.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeBySuccessiveTrades.configuration();
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
                    configuration = await web3FraudChallengeBySuccessiveTrades.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeBySuccessiveTrades.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeBySuccessiveTrades.validator();
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
                    validator = await web3FraudChallengeBySuccessiveTrades.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeBySuccessiveTrades.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeBySuccessiveTrades.walletLocker();
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
                    walletLocker = await web3FraudChallengeBySuccessiveTrades.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.setWalletLocker(walletLocker, false);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.setWalletLocker(address, false);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeBySuccessiveTrades.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.setWalletLocker(address, false, {from: glob.user_a})
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
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                lastTrade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeBySuccessiveTrades.interface.events.ChallengeBySuccessiveTradesEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if last trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(true);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
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
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, lastTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
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
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in first trade', () => {
                beforeEach(async () => {
                    firstTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_b},
                        currencies: {
                            intended: {
                                ct: Wallet.createRandom().address
                            },
                            conjugate: {
                                ct: Wallet.createRandom().address
                            },
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, lastTrade.currencies.intended.ct,
                        lastTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in last trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_b},
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
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not successive trade party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessiveTradesPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive trades\' balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradesBalances(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradeHashesCount, lockedWalletsCount, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersWalletLocker.lockedWalletsCount(),
                        ethersWalletLocker.locks(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lock.lockedWallet.should.equal(utils.getAddress(firstTrade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive trades\' total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradesTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeBySuccessiveTrades.challenge(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended.ct,
                        firstTrade.currencies.intended.id, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradeHashesCount, lockedWalletsCount, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersWalletLocker.lockedWalletsCount(),
                        ethersWalletLocker.locks(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lock.lockedWallet.should.equal(utils.getAddress(firstTrade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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

