const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedClientFund = artifacts.require('MockedClientFund');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByPayment', () => {
        let web3FraudChallengeByPayment, ethersFraudChallengeByPayment;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByPayment = glob.web3FraudChallengeByPayment;
            ethersFraudChallengeByPayment = glob.ethersIoFraudChallengeByPayment;

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

            await ethersFraudChallengeByPayment.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPayment.setValidator(ethersValidator.address);
            await ethersFraudChallengeByPayment.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByPayment.setClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByPayment.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByPayment.address, 'operational_mode', {gasLimit: 1e6}
            );
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByPayment.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPayment.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPayment.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByPayment.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByPayment.configuration();
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
                    configuration = await web3FraudChallengeByPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByPayment.validator();
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
                    validator = await web3FraudChallengeByPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByPayment.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('setSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3FraudChallengeByPayment.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByPayment.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByPayment.clientFund();
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
                    clientFund = await web3FraudChallengeByPayment.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClientFundEvent');
                    const clientFund = await web3FraudChallengeByPayment.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersClientFund._reset(overrideOptions);
                await ethersSecurityBond._reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByPayment.interface.events.ChallengeByPaymentEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not sealed by operator', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentOperatorSeal(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not properly hashed by wallet', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentWalletHash(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment wallet signature is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineWalletSignature(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward in security bond', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentHashesCount, rewardsCount, reward, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentHashesCount(),
                        ethersSecurityBond._rewardsCount(),
                        ethersSecurityBond.rewards(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentHashesCount.eq(1).should.be.true;
                    rewardsCount.eq(1).should.be.true;
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.rewardFraction._bn.should.eq.BN(5e17.toString());
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentFee(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentHashesCount, lockedWalletsCount, lockedWallet, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentHashesCount(),
                        ethersClientFund.lockedWalletsCount(),
                        ethersClientFund.lockedWallets(0),
                        ethersClientFund.locks(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lockedWallet.should.equal(payment.sender.wallet);
                    lock.source.should.equal(payment.sender.wallet);
                    lock.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment sender is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSender(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentHashesCount, lockedWalletsCount, lockedWallet, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentHashesCount(),
                        ethersClientFund.lockedWalletsCount(),
                        ethersClientFund.lockedWallets(0),
                        ethersClientFund.locks(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lockedWallet.should.equal(payment.sender.wallet);
                    lock.source.should.equal(payment.sender.wallet);
                    lock.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment recipient is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentRecipient(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentHashesCount, lockedWalletsCount, lockedWallet, lock, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentHashesCount(),
                        ethersClientFund.lockedWalletsCount(),
                        ethersClientFund.lockedWallets(0),
                        ethersClientFund.locks(0),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentHashesCount.eq(1).should.be.true;
                    lockedWalletsCount.eq(1).should.be.true;
                    lockedWallet.should.equal(payment.recipient.wallet);
                    lock.source.should.equal(payment.recipient.wallet);
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

