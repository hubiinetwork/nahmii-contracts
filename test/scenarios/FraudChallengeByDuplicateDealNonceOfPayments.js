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
    describe('FraudChallengeByDuplicateDealNonceOfPayments', () => {
        let web3FraudChallengeByDuplicateDealNonceOfPayments, ethersFraudChallengeByDuplicateDealNonceOfPayments;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByDuplicateDealNonceOfPayments = glob.web3FraudChallengeByDuplicateDealNonceOfPayments;
            ethersFraudChallengeByDuplicateDealNonceOfPayments = glob.ethersIoFraudChallengeByDuplicateDealNonceOfPayments;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByDuplicateDealNonceOfPayments.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByDuplicateDealNonceOfPayments.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByDuplicateDealNonceOfPayments.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByDuplicateDealNonceOfPayments.changeSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByDuplicateDealNonceOfPayments.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByDuplicateDealNonceOfPayments.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByDuplicateDealNonceOfPayments.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfPayments.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfPayments.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByDuplicateDealNonceOfPayments.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfPayments.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByDuplicateDealNonceOfPayments.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByDuplicateDealNonceOfPayments.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfPayments.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfPayments.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByDuplicateDealNonceOfPayments.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfPayments.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByDuplicateDealNonceOfPayments.configuration();
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
                    configuration = await web3FraudChallengeByDuplicateDealNonceOfPayments.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfPayments.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfPayments.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByDuplicateDealNonceOfPayments.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfPayments.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByDuplicateDealNonceOfPayments.validator();
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
                    validator = await web3FraudChallengeByDuplicateDealNonceOfPayments.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfPayments.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfPayments.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByDuplicateDealNonceOfPayments.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfPayments.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByDuplicateDealNonceOfPayments.securityBond();
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
                    securityBond = await web3FraudChallengeByDuplicateDealNonceOfPayments.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByDuplicateDealNonceOfPayments.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByDuplicateDealNonceOfPayments.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByDuplicateDealNonceOfPayments.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByDuplicateDealNonceOfPayments.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByDuplicateDealNonceOfPayments()', () => {
            let payment1, payment2, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
                await ethersConfiguration.setDuplicateDealNonceStake(mocks.address0, utils.bigNumberify(1000));
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

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
                    ...ethersFraudChallengeByDuplicateDealNonceOfPayments.interface.events.ChallengeByDuplicateDealNonceOfPaymentsEvent.topics
                );
            });

            describe('if payments are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfPayments.challengeByDuplicateDealNonceOfPayments(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfPayments.challengeByDuplicateDealNonceOfPayments(
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
                    return ethersFraudChallengeByDuplicateDealNonceOfPayments.challengeByDuplicateDealNonceOfPayments(
                        payment1, payment2, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet hashes are equal', () => {
                beforeEach(async () => {
                    payment1.seals.wallet.hash = cryptography.hash('some payment');
                    payment1.seals.wallet.signature = await mocks.createWeb3Signer(payment1.sender.wallet)(payment1.seals.wallet.hash);
                    payment1.seals.exchange.hash = mocks.hashPaymentAsExchange(payment1);
                    payment1.seals.exchange.signature = await mocks.createWeb3Signer(glob.owner)(payment1.seals.exchange.hash);
                    payment2.seals.wallet.hash = cryptography.hash('some payment');
                    payment2.seals.wallet.signature = await mocks.createWeb3Signer(payment2.sender.wallet)(payment2.seals.wallet.hash);
                    payment2.seals.exchange.hash = mocks.hashPaymentAsExchange(payment2);
                    payment2.seals.exchange.signature = await mocks.createWeb3Signer(glob.owner)(payment2.seals.exchange.hash);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByDuplicateDealNonceOfPayments.challengeByDuplicateDealNonceOfPayments(
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
                        sender: {
                            wallet: glob.user_c
                        },
                        recipient: {
                            wallet: glob.user_d
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should set operational mode exit, store fraudulent payments and stage in security bond', async () => {
                    await ethersFraudChallengeByDuplicateDealNonceOfPayments.challengeByDuplicateDealNonceOfPayments(
                        payment1, payment2, overrideOptions
                    );
                    const [operationalModeExit, fraudulentPaymentsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(2).should.be.true;
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

