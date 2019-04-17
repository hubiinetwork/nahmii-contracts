const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const SignerManager = artifacts.require('SignerManager');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeBySuccessivePayments', () => {
        let web3FraudChallengeBySuccessivePayments, ethersFraudChallengeBySuccessivePayments;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;

        before(async () => {
            provider = glob.signer_owner.provider;

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
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await web3Configuration.setFraudStakeFraction(web3.eth.blockNumber + 1, 5e17);
        });

        beforeEach(async () => {
            web3FraudChallengeBySuccessivePayments = await FraudChallengeBySuccessivePayments.new(glob.owner);
            ethersFraudChallengeBySuccessivePayments = new Contract(web3FraudChallengeBySuccessivePayments.address, FraudChallengeBySuccessivePayments.abi, glob.signer_owner);

            await ethersFraudChallengeBySuccessivePayments.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeBySuccessivePayments.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeBySuccessivePayments.setValidator(ethersValidator.address);
            await ethersFraudChallengeBySuccessivePayments.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeBySuccessivePayments.setWalletLocker(ethersWalletLocker.address);
            await ethersFraudChallengeBySuccessivePayments.setBalanceTracker(ethersBalanceTracker.address);

            await ethersConfiguration.registerService(ethersFraudChallengeBySuccessivePayments.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeBySuccessivePayments.address, 'operational_mode', {gasLimit: 1e6}
            );
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeBySuccessivePayments.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeBySuccessivePayments.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeBySuccessivePayments.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeBySuccessivePayments.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeBySuccessivePayments.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeBySuccessivePayments.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeBySuccessivePayments.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeBySuccessivePayments.configuration();
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
                    configuration = await web3FraudChallengeBySuccessivePayments.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeBySuccessivePayments.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeBySuccessivePayments.validator();
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
                    validator = await web3FraudChallengeBySuccessivePayments.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeBySuccessivePayments.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeBySuccessivePayments.walletLocker();
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
                    walletLocker = await web3FraudChallengeBySuccessivePayments.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessivePayments.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessivePayments.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeBySuccessivePayments.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessivePayments.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let firstPayment, lastPayment, filter;

            beforeEach(async () => {
                await ethersConfiguration._reset({gasLimit: 2e6});
                await ethersFraudChallenge._reset({gasLimit: 2e6});
                await ethersValidator._reset({gasLimit: 2e6});
                await ethersSecurityBond._reset({gasLimit: 2e6});
                await ethersWalletLocker._reset({gasLimit: 2e6});
                await ethersBalanceTracker._reset({gasLimit: 2e6});

                firstPayment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 10)
                });
                lastPayment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeBySuccessivePayments.interface.events.ChallengeBySuccessivePaymentsEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if first payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if last payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(true);
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not successive payment party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessivePaymentsPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in first payment', () => {
                beforeEach(async () => {
                    firstPayment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, lastPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in last payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if payment currencies differ', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentCurrency(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if payments are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive payments\' balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentsBalances(false);
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(firstPayment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(lastPayment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(lastPayment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(lastPayment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter))
                        .should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive payments\' total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentsTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeBySuccessivePayments.challenge(
                        firstPayment, lastPayment, firstPayment.sender.wallet, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(firstPayment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(lastPayment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(lastPayment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(lastPayment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter))
                        .should.have.lengthOf(1);
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

