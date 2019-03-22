const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
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
    describe('FraudChallengeByTradeSucceedingPayment', () => {
        let web3FraudChallengeByTradeSucceedingPayment, ethersFraudChallengeByTradeSucceedingPayment;
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
            web3FraudChallengeByTradeSucceedingPayment = await FraudChallengeByTradeSucceedingPayment.new(glob.owner);
            ethersFraudChallengeByTradeSucceedingPayment = new Contract(web3FraudChallengeByTradeSucceedingPayment.address, FraudChallengeByTradeSucceedingPayment.abi, glob.signer_owner);

            await ethersFraudChallengeByTradeSucceedingPayment.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setValidator(ethersValidator.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setWalletLocker(ethersWalletLocker.address);
            await ethersFraudChallengeByTradeSucceedingPayment.setBalanceTracker(ethersBalanceTracker.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByTradeSucceedingPayment.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByTradeSucceedingPayment.address, 'operational_mode', {gasLimit: 1e6}
            );
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByTradeSucceedingPayment.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByTradeSucceedingPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByTradeSucceedingPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTradeSucceedingPayment.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByTradeSucceedingPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTradeSucceedingPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTradeSucceedingPayment.configuration();
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
                    configuration = await web3FraudChallengeByTradeSucceedingPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByTradeSucceedingPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTradeSucceedingPayment.validator();
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
                    validator = await web3FraudChallengeByTradeSucceedingPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByTradeSucceedingPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeByTradeSucceedingPayment.walletLocker();
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
                    walletLocker = await web3FraudChallengeByTradeSucceedingPayment.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTradeSucceedingPayment.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTradeSucceedingPayment.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeByTradeSucceedingPayment.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTradeSucceedingPayment.setWalletLocker(address, {from: glob.user_a})
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

                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.user_a},
                    recipient: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 10)
                });
                trade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify((await provider.getBlockNumber()) + 20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTradeSucceedingPayment.interface.events.ChallengeByTradeSucceedingPaymentEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in payment', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, trade.buyer.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not party in trade', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeParty(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in payment', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentCurrency(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, trade.currencies.intended.ct,
                        trade.currencies.intended.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in trade', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeCurrency(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not successive party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessivePaymentTradePartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentTradeBalances(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;
                    
                    (await ethersFraudChallenge.isFraudulentTradeHash(trade.seal.hash)).should.be.true;

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.intended.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive total fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessivePaymentTradeTotalFees(false);
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTradeSucceedingPayment.challenge(
                        payment, trade, payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 2e6}
                    );

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.isFraudulentTradeHash(trade.seal.hash)).should.be.true;

                    const reward = await ethersSecurityBond.fractionalRewards(0);
                    reward.wallet.should.equal(utils.getAddress(glob.owner));
                    reward.fraction._bn.should.eq.BN(5e17.toString());

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.intended.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
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

