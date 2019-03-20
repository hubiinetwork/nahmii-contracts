const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const SignerManager = artifacts.require('SignerManager');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByPaymentSucceedingTrade', () => {
        let web3FraudChallengeByPaymentSucceedingTrade, ethersFraudChallengeByPaymentSucceedingTrade;
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
            web3FraudChallengeByPaymentSucceedingTrade = await FraudChallengeByPaymentSucceedingTrade.new(glob.owner);
            ethersFraudChallengeByPaymentSucceedingTrade = new Contract(web3FraudChallengeByPaymentSucceedingTrade.address, FraudChallengeByPaymentSucceedingTrade.abi, glob.signer_owner);

            await ethersFraudChallengeByPaymentSucceedingTrade.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.setValidator(ethersValidator.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.setWalletLocker(ethersWalletLocker.address);
            await ethersFraudChallengeByPaymentSucceedingTrade.setBalanceTracker(ethersBalanceTracker.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByPaymentSucceedingTrade.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByPaymentSucceedingTrade.address, 'operational_mode', {gasLimit: 1e6}
            );
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByPaymentSucceedingTrade.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByPaymentSucceedingTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByPaymentSucceedingTrade.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByPaymentSucceedingTrade.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByPaymentSucceedingTrade.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByPaymentSucceedingTrade.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByPaymentSucceedingTrade.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByPaymentSucceedingTrade.configuration();
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
                    configuration = await web3FraudChallengeByPaymentSucceedingTrade.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByPaymentSucceedingTrade.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByPaymentSucceedingTrade.validator();
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
                    validator = await web3FraudChallengeByPaymentSucceedingTrade.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByPaymentSucceedingTrade.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeByPaymentSucceedingTrade.walletLocker();
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
                    walletLocker = await web3FraudChallengeByPaymentSucceedingTrade.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPaymentSucceedingTrade.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPaymentSucceedingTrade.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeByPaymentSucceedingTrade.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPaymentSucceedingTrade.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, payment, filter;

            beforeEach(async () => {
                await ethersConfiguration._reset({gasLimit: 2e6});
                await ethersFraudChallenge._reset({gasLimit: 2e6});
                await ethersValidator._reset({gasLimit: 2e6});
                await ethersSecurityBond._reset({gasLimit: 2e6});
                await ethersWalletLocker._reset({gasLimit: 2e6});
                await ethersBalanceTracker._reset({gasLimit: 2e6});

                trade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 10)
                });
                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByPaymentSucceedingTrade.interface.events.ChallengeByPaymentSucceedingTradeEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in trade', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeParty(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, payment.sender.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in payment', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in trade', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeCurrency(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, payment.currency.ct,
                        payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in payment', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentCurrency(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not successive party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessiveTradePaymentPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradePaymentBalances(false);
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradePaymentTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent payment and reward', async () => {
                    await ethersFraudChallengeByPaymentSucceedingTrade.challenge(
                        trade, payment, trade.buyer.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentPaymentHashesCount())._bn.should.eq.BN(1);

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
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

