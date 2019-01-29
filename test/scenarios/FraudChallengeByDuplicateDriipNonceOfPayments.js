const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const {util: {cryptography}} = require('omphalos-commons');
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require('FraudChallengeByDuplicateDriipNonceOfPayments');
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
    describe('FraudChallengeByDuplicateDriipNonceOfPayments', () => {
        let web3FraudChallengeByDuplicateDriipNonceOfPayments, ethersFraudChallengeByDuplicateDriipNonceOfPayments;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByDuplicateDriipNonceOfPayments = await FraudChallengeByDuplicateDriipNonceOfPayments.new(glob.owner);
            ethersFraudChallengeByDuplicateDriipNonceOfPayments = new Contract(web3FraudChallengeByDuplicateDriipNonceOfPayments.address, FraudChallengeByDuplicateDriipNonceOfPayments.abi, glob.signer_owner);

            web3SignerManager = await SignerManager.new(glob.owner);

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByDuplicateDriipNonceOfPayments.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfPayments.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfPayments.setValidator(ethersValidator.address);
            await ethersFraudChallengeByDuplicateDriipNonceOfPayments.setSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByDuplicateDriipNonceOfPayments.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByDuplicateDriipNonceOfPayments.address, 'operational_mode', {gasLimit: 1e6}
            );

            await ethersFraudChallenge.registerService(ethersFraudChallengeByDuplicateDriipNonceOfPayments.address);
            await ethersFraudChallenge.enableServiceAction(
                ethersFraudChallengeByDuplicateDriipNonceOfPayments.address, 'add_fraudulent_payment', {gasLimit: 1e6}
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
                (await web3FraudChallengeByDuplicateDriipNonceOfPayments.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByDuplicateDriipNonceOfPayments.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByDuplicateDriipNonceOfPayments.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByDuplicateDriipNonceOfPayments.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByDuplicateDriipNonceOfPayments.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByDuplicateDriipNonceOfPayments.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByDuplicateDriipNonceOfPayments.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByDuplicateDriipNonceOfPayments.configuration();
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
                    configuration = await web3FraudChallengeByDuplicateDriipNonceOfPayments.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByDuplicateDriipNonceOfPayments.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByDuplicateDriipNonceOfPayments.validator();
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
                    validator = await web3FraudChallengeByDuplicateDriipNonceOfPayments.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByDuplicateDriipNonceOfPayments.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByDuplicateDriipNonceOfPayments.securityBond();
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
                    securityBond = await web3FraudChallengeByDuplicateDriipNonceOfPayments.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDriipNonceOfPayments.setSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDriipNonceOfPayments.setSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByDuplicateDriipNonceOfPayments.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDriipNonceOfPayments.setSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let payment1, payment2, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersSecurityBond._reset(overrideOptions);

                payment1 = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(1),
                    sender: {
                        wallet: glob.user_a
                    },
                    recipient: {
                        wallet: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                payment2 = await mocks.mockPayment(glob.owner, {
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
                    ...ethersFraudChallengeByDuplicateDriipNonceOfPayments.interface.events.ChallengeByDuplicateDriipNonceOfPaymentsEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if last payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(true);
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet hashes are equal', () => {
                beforeEach(async () => {
                    payment1.seals.wallet.hash = cryptography.hash('some payment');
                    payment1.seals.wallet.signature = await mocks.createWeb3Signer(payment1.sender.wallet)(payment1.seals.wallet.hash);
                    payment1.seals.operator.hash = mocks.hashPaymentAsOperator(payment1);
                    payment1.seals.operator.signature = await mocks.createWeb3Signer(glob.owner)(payment1.seals.operator.hash);
                    payment2.seals.wallet.hash = cryptography.hash('some payment');
                    payment2.seals.wallet.signature = await mocks.createWeb3Signer(payment2.sender.wallet)(payment2.seals.wallet.hash);
                    payment2.seals.operator.hash = mocks.hashPaymentAsOperator(payment2);
                    payment2.seals.operator.signature = await mocks.createWeb3Signer(glob.owner)(payment2.seals.operator.hash);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if payments are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if nonces are equal', () => {
                beforeEach(async () => {
                    payment1 = await mocks.mockPayment(glob.owner, {
                        sender: {
                            wallet: glob.user_a
                        },
                        recipient: {
                            wallet: glob.user_b
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                    payment2 = await mocks.mockPayment(glob.owner, {
                        nonce: payment1.nonce,
                        sender: {
                            wallet: glob.user_c
                        },
                        recipient: {
                            wallet: glob.user_d
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent payments and reward in security bond', async () => {
                    await ethersFraudChallengeByDuplicateDriipNonceOfPayments.challenge(
                        payment1, payment2, overrideOptions
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(2);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

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

