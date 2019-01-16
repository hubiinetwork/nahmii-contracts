const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const {util: {cryptography}} = require('omphalos-commons');
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

        describe('trackedBalanceTypesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.trackedBalanceTypesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('trackedBalanceTypeMap()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                    .should.be.false;
            });
        });

        describe('trackedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.trackedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('trackedWalletsByIndices()', () => {
            it('should revert', async () => {
                ethersBalanceTracker.trackedWalletsByIndices(0, 0)
                    .should.be.rejected;
            });
        });

        describe('hasInUseCurrency()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal false', async () => {
                (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                    .should.be.false;
            });
        });

        describe('hasEverUsedCurrency()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal false', async () => {
                (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                    .should.be.false;
            });
        });

        describe('fungibleRecordsCount()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.fungibleRecordsCount(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('fungibleRecordByIndex()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.fungibleRecordByIndex(glob.user_a, type, address0, 0, 0);

                record.amount._bn.should.eq.BN(0);
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('fungibleRecordByBlockNumber()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();

                blockNumber = await provider.getBlockNumber();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.fungibleRecordByBlockNumber(glob.user_a, type, address0, 0, blockNumber);

                record.amount._bn.should.eq.BN(0);
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('lastFungibleRecord()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.lastFungibleRecord(glob.user_a, type, address0, 0);

                record.amount._bn.should.eq.BN(0);
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('nonFungibleRecordsCount()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('nonFungibleRecordByIndex()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.nonFungibleRecordByIndex(glob.user_a, type, address0, 0, 0);

                record.ids.should.be.an('array').that.is.empty;
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('nonFungibleRecordByBlockNumber()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();

                blockNumber = await provider.getBlockNumber();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(glob.user_a, type, address0, 0, blockNumber);

                record.ids.should.be.an('array').that.is.empty;
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('lastNonFungibleRecord()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should revert', async () => {
                const record = await ethersBalanceTracker.lastNonFungibleRecord(glob.user_a, type, address0, 0);

                record.ids.should.be.an('array').that.is.empty;
                record.blockNumber._bn.should.eq.BN(0);
            });
        });

        describe('idsCount()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('hasId()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                    .should.be.false;
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

        describe('getByIndices()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal initial value', async () => {
                (await ethersBalanceTracker.getByIndices(
                        glob.user_a, type, address0, 0, 0, 1)
                ).should.be.an('array').that.is.empty;
            });
        });

        describe('getAll()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            it('should equal initial value', async () => {
                (await ethersBalanceTracker.getByIndices(
                        glob.user_a, type, address0, 0, 0, 1)
                ).should.be.an('array').that.is.empty;
            });
        });

        describe('set()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, true, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called to set fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully set balance', async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, true);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(10);
                    (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                        .should.be.true;
                    (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.fungibleRecordsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(1);
                    (await ethersBalanceTracker.trackedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await web3BalanceTracker.trackedWalletsByIndices.call(0, 0))
                        .should.be.an('array').that.deep.includes(glob.user_a);

                    const recordByIndex = await ethersBalanceTracker.fungibleRecordByIndex(
                        glob.user_a, type, address0, 0, 0
                    );
                    recordByIndex.amount._bn.should.eq.BN(10);
                    recordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const recordByBlockNumber = await ethersBalanceTracker.fungibleRecordByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    recordByBlockNumber.should.deep.equal(recordByIndex);
                });
            });

            describe('if called to set non-fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully set balance', async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, false);

                    (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                        .should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                    (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                        .should.be.true;
                    (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(1);
                    (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(1);
                    (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                        .should.be.true;

                    const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                        glob.user_a, type, address0, 0, 0
                    );
                    recordByIndex.ids.should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                    recordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    recordByBlockNumber.should.deep.equal(recordByIndex);
                });
            });
        });

        describe('setIds()', () => {
            let type;

            beforeEach(async () => {
                type = await web3BalanceTracker.depositedBalanceType.call();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3BalanceTracker.setIds(glob.user_a, type, [10, 20, 30], address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully set balance', async () => {
                    await web3BalanceTracker.setIds(glob.user_a, type, [10, 20, 30], address0, 0);

                    (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                        .should.be.an('array').that.deep.includes.members(
                        [utils.bigNumberify(10), utils.bigNumberify(20), utils.bigNumberify(30)]
                    );
                    (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                        .should.be.true;
                    (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(1);
                    (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(3);
                    (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.hasId(glob.user_a, type, 20, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.hasId(glob.user_a, type, 30, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.trackedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await web3BalanceTracker.trackedWalletsByIndices(0, 0))
                        .should.be.an('array').that.includes(glob.user_a);

                    const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                        glob.user_a, type, address0, 0, 0
                    );
                    recordByIndex.ids.should.be.an('array').that.deep.includes.members(
                        [utils.bigNumberify(10), utils.bigNumberify(20), utils.bigNumberify(30)]
                    );
                    recordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    recordByBlockNumber.should.deep.equal(recordByIndex);
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
                    web3BalanceTracker.add(glob.user_a, type, 10, address0, 0, true, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called to add to fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, true);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully add balance', async () => {
                    await web3BalanceTracker.add(glob.user_a, type, 10, address0, 0, true);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(20);
                    (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.fungibleRecordsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(2);

                    const fungibleRecordByIndex = await ethersBalanceTracker.fungibleRecordByIndex(
                        glob.user_a, type, address0, 0, 1
                    );
                    fungibleRecordByIndex.amount._bn.should.eq.BN(20);
                    fungibleRecordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const fungibleRecordByBlockNumber = await ethersBalanceTracker.fungibleRecordByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    fungibleRecordByBlockNumber.should.deep.equal(fungibleRecordByIndex);
                });
            });

            describe('if called to add to non-fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, false);

                    blockNumber = await provider.getBlockNumber();
                });

                describe('if called to add new ID', () => {
                    it('should successfully add balance', async () => {
                        await web3BalanceTracker.add(glob.user_a, type, 20, address0, 0, false);

                        (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                            .should.be.an('array').that.deep.includes.members(
                            [utils.bigNumberify(10), utils.bigNumberify(20)]
                        );
                        (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                            .should.be.true;
                        (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                            .should.be.true;
                        (await ethersBalanceTracker.hasId(glob.user_a, type, 20, address0, 0))
                            .should.be.true;

                        const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                            glob.user_a, type, address0, 0, 1
                        );
                        recordByIndex.ids.should.be.an('array').that.deep.includes.members(
                            [utils.bigNumberify(10), utils.bigNumberify(20)]
                        );
                        recordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                        const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                            glob.user_a, type, address0, 0, blockNumber + 10
                        );
                        recordByBlockNumber.should.deep.equal(recordByIndex);
                    });
                });

                describe('if called to add ID existent in wallet\'s balance', () => {
                    it('should not change balance state', async () => {
                        await web3BalanceTracker.add(glob.user_a, type, 10, address0, 0, false);

                        (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                            .should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                        (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                            .should.be.true;
                        (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                            .should.be.true;

                        const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                            glob.user_a, type, address0, 0, 0
                        );
                        recordByIndex.ids.should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                        recordByIndex.blockNumber._bn.should.eq.BN(blockNumber);

                        const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                            glob.user_a, type, address0, 0, blockNumber + 10
                        );
                        recordByBlockNumber.should.deep.equal(recordByIndex);
                    });
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

            describe('if called to subtract from fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, true);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully subtract balance', async () => {
                    await web3BalanceTracker.sub(glob.user_a, type, 20, address0, 0, true);

                    (await ethersBalanceTracker.get(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(-10);
                    (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.fungibleRecordsCount(glob.user_a, type, address0, 0))
                        ._bn.should.eq.BN(2);

                    const fungibleRecordByIndex = await ethersBalanceTracker.fungibleRecordByIndex(
                        glob.user_a, type, address0, 0, 1
                    );
                    fungibleRecordByIndex.amount._bn.should.eq.BN(-10);
                    fungibleRecordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const fungibleRecordByBlockNumber = await ethersBalanceTracker.fungibleRecordByBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    fungibleRecordByBlockNumber.should.deep.equal(fungibleRecordByIndex);
                });
            });

            describe('if called to subtract from non-fungible balance', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3BalanceTracker.set(glob.user_a, type, 10, address0, 0, false);

                    blockNumber = await provider.getBlockNumber();
                });

                describe('if called to subtract ID existent in wallet\'s balance', () => {
                    it('should successfully subtract balance', async () => {
                        await web3BalanceTracker.sub(glob.user_a, type, 10, address0, 0, false);

                        (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                            .should.be.an('array').that.is.empty;
                        (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                            .should.be.true;
                        (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.false;
                        (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                            .should.be.false;

                        const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                            glob.user_a, type, address0, 0, 1
                        );
                        recordByIndex.ids.should.be.an('array').that.is.empty;
                        recordByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                        const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                            glob.user_a, type, address0, 0, blockNumber + 10
                        );
                        recordByBlockNumber.should.deep.equal(recordByIndex);
                    });
                });

                describe('if called to subtract ID not existent in wallet\'s balance', () => {
                    it('should not change balance state', async () => {
                        await web3BalanceTracker.sub(glob.user_a, type, 20, address0, 0, false);

                        (await ethersBalanceTracker.getAll(glob.user_a, type, address0, 0))
                            .should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                        (await web3BalanceTracker.trackedBalanceTypeMap.call(type))
                            .should.be.true;
                        (await web3BalanceTracker.hasInUseCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await web3BalanceTracker.hasEverUsedCurrency.call(glob.user_a, type, address0, 0))
                            .should.be.true;
                        (await ethersBalanceTracker.nonFungibleRecordsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.idsCount(glob.user_a, type, address0, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.hasId(glob.user_a, type, 10, address0, 0))
                            .should.be.true;

                        const recordByIndex = await ethersBalanceTracker.nonFungibleRecordByIndex(
                            glob.user_a, type, address0, 0, 0
                        );
                        recordByIndex.ids.should.be.an('array').that.deep.includes(utils.bigNumberify(10));
                        recordByIndex.blockNumber._bn.should.eq.BN(blockNumber);

                        const recordByBlockNumber = await ethersBalanceTracker.nonFungibleRecordByBlockNumber(
                            glob.user_a, type, address0, 0, blockNumber + 10
                        );
                        recordByBlockNumber.should.deep.equal(recordByIndex);
                    });
                });
            });
        });
    });
};
