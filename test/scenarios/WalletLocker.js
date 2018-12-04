const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const {address0} = require('../mocks');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const WalletLocker = artifacts.require('WalletLocker');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('WalletLocker', function () {
        let provider;
        let web3Configuration, ethersConfiguration;
        let web3WalletLocker, ethersWalletLocker;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3WalletLocker = await WalletLocker.new(glob.owner);
            ethersWalletLocker = new Contract(web3WalletLocker.address, WalletLocker.abi, glob.signer_owner);

            await web3WalletLocker.setConfiguration(web3Configuration.address);

            await web3WalletLocker.registerService(glob.user_a, {from: glob.owner});
            await web3WalletLocker.authorizeInitialService(glob.user_a, {from: glob.owner});

            await web3Configuration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 3600);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3WalletLocker.deployer.call()).should.equal(glob.owner);
                (await web3WalletLocker.operator.call()).should.equal(glob.owner);
            });
        });

        describe('lockedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersWalletLocker.lockedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isLocked()', () => {
            it('should equal value initialized', async () => {
                (await web3WalletLocker.isLocked(glob.user_a))
                    .should.be.false;
            });
        });

        describe('isLockedBy()', () => {
            it('should equal value initialized', async () => {
                (await web3WalletLocker.isLockedBy(glob.user_a, glob.user_b))
                    .should.be.false;
            });
        });

        describe('lockByProxy()', () => {
            describe('if called with zero locked address', () => {
                it('should equal value initialized', async () => {
                    web3WalletLocker.lockByProxy(address0, glob.user_c, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called with equal locked and locker wallets', () => {
                it('should revert', async () => {
                    web3WalletLocker.lockByProxy(glob.user_b, glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully lock', async () => {
                    await web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_a});

                    (await ethersWalletLocker.lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await web3WalletLocker.isLocked(glob.user_b))
                        .should.be.true;
                    (await web3WalletLocker.isLockedBy(glob.user_b, glob.user_c))
                        .should.be.true;
                });
            });

            describe('if locked by other wallet', () => {
                beforeEach(async () => {
                    await web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_a});
                });

                it('should revert', async () => {
                    web3WalletLocker.lockByProxy(glob.user_b, glob.user_d, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('unlock()', () => {
            describe('if wallet is not locked', () => {
                it('should revert', async () => {
                    web3WalletLocker.unlock({from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if lock has not timed out', () => {
                beforeEach(async () => {
                    await web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_a});
                });

                it('should revert', async () => {
                    web3WalletLocker.unlock({from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if lock has timed out', () => {
                beforeEach(async () => {
                    await web3Configuration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 0);

                    await web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_a});
                });

                it('should revert', async () => {
                    await web3WalletLocker.unlock({from: glob.user_b});

                    (await ethersWalletLocker.lockedWalletsCount())
                        ._bn.should.eq.BN(0);
                    (await web3WalletLocker.isLocked(glob.user_b))
                        .should.be.false;
                    (await web3WalletLocker.isLockedBy(glob.user_b, glob.user_c))
                        .should.be.false;
                });
            });
        });

        describe('unlockByProxy()', () => {
            beforeEach(async () => {
                await web3WalletLocker.lockByProxy(glob.user_b, glob.user_c, {from: glob.user_a});
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3WalletLocker.unlockByProxy(glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully unlock', async () => {
                    await web3WalletLocker.unlockByProxy(glob.user_b, {from: glob.user_a});

                    (await ethersWalletLocker.lockedWalletsCount())
                        ._bn.should.eq.BN(0);
                    (await web3WalletLocker.isLocked(glob.user_b))
                        .should.be.false;
                    (await web3WalletLocker.isLockedBy(glob.user_b, glob.user_c))
                        .should.be.false;
                });
            });
        });
    });
};
