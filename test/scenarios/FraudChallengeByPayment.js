const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByPayment', () => {
        let web3FraudChallengeByPayment, ethersFraudChallengeByPayment;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3WalletLocker, ethersWalletLocker;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByPayment = await FraudChallengeByPayment.new(glob.owner);
            ethersFraudChallengeByPayment = new Contract(web3FraudChallengeByPayment.address, FraudChallengeByPayment.abi, glob.signer_owner);

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

            await ethersFraudChallengeByPayment.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPayment.setValidator(ethersValidator.address);
            await ethersFraudChallengeByPayment.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByPayment.setWalletLocker(ethersWalletLocker.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByPayment.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByPayment.address, 'operational_mode', {gasLimit: 1e6}
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

            describe('if called by deployer', () => {
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

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
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

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
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

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
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

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeByPayment.walletLocker();
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
                    walletLocker = await web3FraudChallengeByPayment.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeByPayment.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
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
                await ethersWalletLocker._reset(overrideOptions);
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

            describe('if payment is genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment sender wallet signature is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineWalletSignature(false);

                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward in security bond', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    (await ethersWalletLocker._fungibleLocksCount())._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if payment fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentFeeOfFungible(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(payment.sender.wallet);
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if payment sender is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSender(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(payment.sender.wallet);
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if payment recipient is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentRecipient(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(payment.recipient.wallet);
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.recipient.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

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

