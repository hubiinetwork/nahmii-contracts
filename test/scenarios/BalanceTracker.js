const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const cryptography = require('omphalos-commons').util.cryptography;
const {address0} = require('../mocks');
const BalanceTracker = artifacts.require('BalanceTracker');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('BalanceTracker', function () {
        let provider;
        let web3BalanceTracker, ethersBalanceTracker;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3BalanceTracker = await BalanceTracker.new(glob.owner);
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, BalanceTracker.abi, glob.signer_owner);

            await web3BalanceTracker.registerService(glob.owner);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3BalanceTracker.deployer.call()).should.equal(glob.owner);
                (await web3BalanceTracker.operator.call()).should.equal(glob.owner);
            });
        });

        describe('DEPOSITED_BALANCE_TYPE()', () => {
            it('should equal \'deposited\'', async () => {
                (await web3BalanceTracker.DEPOSITED_BALANCE_TYPE.call())
                    .should.equal('deposited');
            });
        });

        describe('SETTLED_BALANCE_TYPE()', () => {
            it('should equal \'settled\'', async () => {
                (await web3BalanceTracker.SETTLED_BALANCE_TYPE.call())
                    .should.equal('settled');
            });
        });

        describe('STAGED_BALANCE_TYPE()', () => {
            it('should equal \'staged\'', async () => {
                (await web3BalanceTracker.STAGED_BALANCE_TYPE.call())
                    .should.equal('staged');
            });
        });

        describe('depositedBalanceType()', () => {
            it('should equal the hash of \'deposited\'', async () => {
                (await web3BalanceTracker.depositedBalanceType.call())
                    .should.equal(cryptography.hash('deposited'));
            });
        });

        describe('settledBalanceType()', () => {
            it('should equal the hash of \'settled\'', async () => {
                (await web3BalanceTracker.settledBalanceType.call())
                    .should.equal(cryptography.hash('settled'));
            });
        });

        describe('stagedBalanceType()', () => {
            it('should equal the hash of \'staged\'', async () => {
                (await web3BalanceTracker.stagedBalanceType.call())
                    .should.equal(cryptography.hash('staged'));
            });
        });

        describe('balanceTypesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.balanceTypesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('balanceTypeMap()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await web3BalanceTracker.balanceTypeMap.call(type))
                    .should.be.false;
            });
        });

        describe('hasCurrency()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal false', async () => {
                (await web3BalanceTracker.hasCurrency.call(glob.user_a, type, address0, 0))
                    .should.be.false;
            });
        });

        describe('logSize()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.logSize(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('logByIndex()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const logRecord = await ethersBalanceTracker.logByIndex(glob.user_a, type, address0, 0, 0);

                logRecord.amount._bn.should.eq.BN(0);
                logRecord.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('logByBlockNumber()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();

                blockNumber = await provider.getBlockNumber();
            });

            it('should revert', async () => {
                const logRecord = await ethersBalanceTracker.logByBlockNumber(glob.user_a, type, address0, 0, blockNumber);

                logRecord.amount._bn.should.eq.BN(0);
                logRecord.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('lastLog()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const logRecord = await ethersBalanceTracker.lastLog(glob.user_a, type, address0, 0);

                logRecord.amount._bn.should.eq.BN(0);
                logRecord.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('get()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal initial value', async () => {
                (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('set()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully set balance', async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(10);
                    (await web3BalanceTracker.balanceTypeMap.call(type))
                        .should.be.true;
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.logSize(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(1);

                    const logByIndex = await ethersBalanceTracker.logByIndex(
                        glob.user_a, type, address0, 0, 0
                    );
                    logByIndex.amount._bn.should.eq.BN(10);
                    logByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const logByBlockNumber = await ethersBalanceTracker.logByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    logByBlockNumber.should.deep.equal(logByIndex);
                });
            });
        });

        describe('reset()', () => {
            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.reset(glob.user_a, address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let type, blockNumber;

                beforeEach(async () => {
                    type = await web3BalanceTracker.depositedBalanceType.call();

                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully reset balance', async () => {
                    await web3BalanceTracker.reset(glob.user_a, address0, 0);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(0);
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.logSize(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(2);

                    const logByIndex = await ethersBalanceTracker.logByIndex(
                        glob.user_a, type, address0, 0, 1
                    );
                    logByIndex.amount._bn.should.eq.BN(0);
                    logByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const logByBlockNumber = await ethersBalanceTracker.logByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    logByBlockNumber.should.deep.equal(logByIndex);
                });
            });
        });

        describe('add()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.add(glob.user_a, type, 10, address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully add balance', async () => {
                    await web3BalanceTracker.add(glob.user_a, type, 10, address0, 0);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(20);
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.logSize(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(2);

                    const logByIndex = await ethersBalanceTracker.logByIndex(
                        glob.user_a, type, address0, 0, 1
                    );
                    logByIndex.amount._bn.should.eq.BN(20);
                    logByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const logByBlockNumber = await ethersBalanceTracker.logByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    logByBlockNumber.should.deep.equal(logByIndex);
                });
            });
        });

        describe('sub()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.sub(glob.user_a, type, 10, address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully subtract balance', async () => {
                    await web3BalanceTracker.sub(glob.user_a, type, 20, address0, 0);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(-10);
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.logSize(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(2);

                    const logByIndex = await ethersBalanceTracker.logByIndex(
                        glob.user_a, type, address0, 0, 1
                    );
                    logByIndex.amount._bn.should.eq.BN(-10);
                    logByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const logByBlockNumber = await ethersBalanceTracker.logByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    logByBlockNumber.should.deep.equal(logByIndex);
                });
            });
        });

        describe('transfer()', () => {
            let fromType, toType;

            beforeEach(async () => {
                fromType = await web3BalanceTracker.depositedBalanceType.call();
                toType = await web3BalanceTracker.settledBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.transfer(glob.user_a, fromType, toType, 10, address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, fromType, 10, address0, 0);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully transfer balance between types', async () => {
                    await web3BalanceTracker.transfer(glob.user_a, fromType, toType, 4, address0, 0);

                    (await ethersBalanceTracker.get(glob.user_a, fromType, address0, 0))
                        ._bn.should.eq.BN(6);
                    (await ethersBalanceTracker.get(glob.user_a, toType, address0, 0))
                        ._bn.should.eq.BN(4);
                    (await web3BalanceTracker.balanceTypeMap.call(fromType))
                        .should.be.true;
                    (await web3BalanceTracker.balanceTypeMap.call(toType))
                        .should.be.true;
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, fromType, address0, 0))
                        .should.be.true;
                    (await web3BalanceTracker.hasCurrency.call(glob.user_a, toType, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.logSize(glob.user_a, fromType, address0, 0))
                        ._bn.should.eq.BN(2);
                    (await ethersBalanceTracker.logSize(glob.user_a, toType, address0, 0))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('sum()', () => {
            let type1, type2;

            beforeEach(async () => {
                type1 = await web3BalanceTracker.depositedBalanceType.call();
                type2 = await web3BalanceTracker.settledBalanceType.call();

                await web3BalanceTracker.set(glob.user_a, type1, 10, address0, 0);
                await web3BalanceTracker.set(glob.user_a, type2, 20, address0, 0);
            });

            it('should successfully sum balances', async () => {
                (await ethersBalanceTracker.sum(glob.user_a, address0, 0))
                    ._bn.should.eq.BN(30);
            });
        });
    });
};
