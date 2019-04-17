const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
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
    describe('FraudChallengeByTrade', () => {
        let web3FraudChallengeByTrade, ethersFraudChallengeByTrade;
        let web3SignerManager;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3WalletLocker, ethersWalletLocker;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByTrade = await FraudChallengeByTrade.new(glob.owner);
            ethersFraudChallengeByTrade = new Contract(web3FraudChallengeByTrade.address, FraudChallengeByTrade.abi, glob.signer_owner);

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

            await ethersFraudChallengeByTrade.setFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTrade.setConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTrade.setValidator(ethersValidator.address);
            await ethersFraudChallengeByTrade.setSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByTrade.setWalletLocker(ethersWalletLocker.address);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await ethersConfiguration.registerService(ethersFraudChallengeByTrade.address);
            await ethersConfiguration.enableServiceAction(
                ethersFraudChallengeByTrade.address, 'operational_mode', {gasLimit: 1e6}
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
                (await web3FraudChallengeByTrade.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTrade.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3FraudChallengeByTrade.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTrade.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3FraudChallengeByTrade.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTrade.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByTrade.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.setFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTrade.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTrade.configuration();
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
                    configuration = await web3FraudChallengeByTrade.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3FraudChallengeByTrade.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTrade.validator();
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
                    validator = await web3FraudChallengeByTrade.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.setValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');
                    const validator = await web3FraudChallengeByTrade.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                const walletLocker = await ethersFraudChallengeByTrade.walletLocker();
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
                    walletLocker = await web3FraudChallengeByTrade.walletLocker.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.setWalletLocker(walletLocker);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.setWalletLocker(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');
                    const walletLocker = await web3FraudChallengeByTrade.walletLocker();
                    utils.getAddress(walletLocker).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 3e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersWalletLocker._reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTrade.interface.events.ChallengeByTradeEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                    trade = await mocks.mockTrade(glob.user_a, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade buyer fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeBuyerFeeOfFungible(false);
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentTradeHashesCount())._bn.should.eq.BN(1);

                    const intendedLock = await ethersWalletLocker.fungibleLocks(0);
                    intendedLock.lockedWallet.should.equal(trade.buyer.wallet);
                    intendedLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    intendedLock.amount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedLock.currencyCt.should.equal(trade.currencies.intended.ct);
                    intendedLock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedLock.visibleTimeout._bn.should.eq.BN(0);

                    const conjugateLock = await ethersWalletLocker.fungibleLocks(1);
                    conjugateLock.lockedWallet.should.equal(trade.buyer.wallet);
                    conjugateLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    conjugateLock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateLock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    conjugateLock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateLock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if trade seller fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSellerFeeOfFungible(false);
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentTradeHashesCount())._bn.should.eq.BN(1);

                    const intendedLock = await ethersWalletLocker.fungibleLocks(0);
                    intendedLock.lockedWallet.should.equal(trade.seller.wallet);
                    intendedLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    intendedLock.amount._bn.should.eq.BN(trade.seller.balances.intended.current._bn);
                    intendedLock.currencyCt.should.equal(trade.currencies.intended.ct);
                    intendedLock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedLock.visibleTimeout._bn.should.eq.BN(0);

                    const conjugateLock = await ethersWalletLocker.fungibleLocks(1);
                    conjugateLock.lockedWallet.should.equal(trade.seller.wallet);
                    conjugateLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    conjugateLock.amount._bn.should.eq.BN(trade.seller.balances.conjugate.current._bn);
                    conjugateLock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    conjugateLock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateLock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if trade buyer is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeBuyer(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentTradeHashesCount())._bn.should.eq.BN(1);

                    const intendedLock = await ethersWalletLocker.fungibleLocks(0);
                    intendedLock.lockedWallet.should.equal(trade.buyer.wallet);
                    intendedLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    intendedLock.amount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedLock.currencyCt.should.equal(trade.currencies.intended.ct);
                    intendedLock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedLock.visibleTimeout._bn.should.eq.BN(0);

                    const conjugateLock = await ethersWalletLocker.fungibleLocks(1);
                    conjugateLock.lockedWallet.should.equal(trade.buyer.wallet);
                    conjugateLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    conjugateLock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateLock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    conjugateLock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateLock.visibleTimeout._bn.should.eq.BN(0);

                    (await provider.getLogs(filter)).should.have.lengthOf(1);
                });
            });

            describe('if trade seller is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeller(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);

                    (await ethersConfiguration.isOperationalModeExit()).should.be.true;

                    (await ethersFraudChallenge.fraudulentTradeHashesCount())._bn.should.eq.BN(1);

                    const intendedLock = await ethersWalletLocker.fungibleLocks(0);
                    intendedLock.lockedWallet.should.equal(trade.seller.wallet);
                    intendedLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    intendedLock.amount._bn.should.eq.BN(trade.seller.balances.intended.current._bn);
                    intendedLock.currencyCt.should.equal(trade.currencies.intended.ct);
                    intendedLock.currencyId._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedLock.visibleTimeout._bn.should.eq.BN(0);

                    const conjugateLock = await ethersWalletLocker.fungibleLocks(1);
                    conjugateLock.lockedWallet.should.equal(trade.seller.wallet);
                    conjugateLock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    conjugateLock.amount._bn.should.eq.BN(trade.seller.balances.conjugate.current._bn);
                    conjugateLock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    conjugateLock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
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

