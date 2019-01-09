const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const cryptography = require('omphalos-commons').util.cryptography;
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTrades');
const SignerManager = artifacts.require('SignerManager');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByDuplicateDriipNonceOfTrades', () => {
        let web3FraudChallengeByDuplicateDriipNonceOfTrades, ethersFraudChallengeByDuplicateDriipNonceOfTrades;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByDuplicateDriipNonceOfTrades = await FraudChallengeByDuplicateDriipNonceOfTrades.new(glob.owner);
            ethersFraudChallengeByDuplicateDriipNonceOfTrades = new Contract(web3FraudChallengeByDuplicateDriipNonceOfTrades.address, FraudChallengeByDuplicateDriipNonceOfTrades.abi, glob.signer_owner);

            web3SignerManager = await SignerManager.new(glob.owner);

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByDuplicateDriipNonceOfTrades.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfTrades.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfTrades.setValidator(ethersValidator.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfTrades.setSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByDuplicateDriipNonceOfTrades.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByDuplicateDriipNonceOfTrades.address, 'operational_mode', {gasLimit: 1e6}
            );

            await ethersFraudChallenge.registerService(ethersFraudChallengeByDuplicateDriipNonceOfTrades.address);
            await ethersFraudChallenge.enableServiceAction(
                ethersFraudChallengeByDuplicateDriipNonceOfTrades.address, 'add_fraudulent_trade', {gasLimit: 1e6}
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
                (await web3FraudChallengeByDuplicateDriipNonceOfTrades.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByDuplicateDriipNonceOfTrades.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByDuplicateDriipNonceOfTrades.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByDuplicateDriipNonceOfTrades.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByDuplicateDriipNonceOfTrades.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByDuplicateDriipNonceOfTrades.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByDuplicateDriipNonceOfTrades.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByDuplicateDriipNonceOfTrades.configuration();
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
                    configuration = await web3FraudChallengeByDuplicateDriipNonceOfTrades.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByDuplicateDriipNonceOfTrades.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByDuplicateDriipNonceOfTrades.validator();
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
                    validator = await web3FraudChallengeByDuplicateDriipNonceOfTrades.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByDuplicateDriipNonceOfTrades.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByDuplicateDriipNonceOfTrades.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('setSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3FraudChallengeByDuplicateDriipNonceOfTrades.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfTrades.setSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfTrades.setSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByDuplicateDriipNonceOfTrades.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfTrades.setSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade1, trade2, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersSecurityBond._reset(overrideOptions);

                trade1 = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(1),
                    buyer: {
                        wallet: glob.user_a
                    },
                    seller: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                trade2 = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(2),
                    buyer: {
                        wallet: glob.user_c
                    },
                    seller: {
                        wallet: glob.user_d
                    },
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByDuplicateDriipNonceOfTrades.interface.events.ChallengeByDuplicateDriipNonceOfTradesEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
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
                    return ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if hashes are equal', () => {
                beforeEach(async () => {
                    trade1.seal.hash = cryptography.hash('some trade');
                    trade1.seal.signature = await mocks.createWeb3Signer(glob.owner)(trade1.seal.hash);
                    trade2.seal.hash = cryptography.hash('some trade');
                    trade2.seal.signature = await mocks.createWeb3Signer(glob.owner)(trade2.seal.hash);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
                        trade1, trade2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if nonces are equal', () => {
                beforeEach(async () => {
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
                        nonce: trade1.nonce,
                        buyer: {
                            wallet: glob.user_c
                        },
                        seller: {
                            wallet: glob.user_d
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent trades and reward in security bond', async () => {
                    await ethersFraudChallengeByDuplicateDriipNonceOfTrades.challenge(
                        trade1, trade2, overrideOptions
                    );
                    const [operationalModeExit, fraudulentTradeHashesCount, rewardsCount, reward, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersSecurityBond._rewardsCount(),
                        ethersSecurityBond.rewards(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(2).should.be.true;
                    rewardsCount.eq(1).should.be.true;
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.rewardFraction._bn.should.eq.BN(5e17.toString());
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

