const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const cryptography = require('omphalos-commons').util.cryptography;
const {address0} = require('../mocks');
const TransactionTracker = artifacts.require('TransactionTracker');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('TransactionTracker', function () {
        let provider;
        let web3TransactionTracker, ethersTransactionTracker;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3TransactionTracker = await TransactionTracker.new(glob.owner);
            ethersTransactionTracker = new Contract(web3TransactionTracker.address, TransactionTracker.abi, glob.signer_owner);

            await web3TransactionTracker.registerService(glob.owner);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3TransactionTracker.deployer.call()).should.equal(glob.owner);
                (await web3TransactionTracker.operator.call()).should.equal(glob.owner);
            });
        });

        describe('DEPOSIT_TRANSACTION_TYPE()', () => {
            it('should equal \'deposit\'', async () => {
                (await web3TransactionTracker.DEPOSIT_TRANSACTION_TYPE.call())
                    .should.equal('deposit');
            });
        });

        describe('WITHDRAWAL_TRANSACTION_TYPE()', () => {
            it('should equal \'withdrawal\'', async () => {
                (await web3TransactionTracker.WITHDRAWAL_TRANSACTION_TYPE.call())
                    .should.equal('withdrawal');
            });
        });

        describe('depositTransactionType()', () => {
            it('should equal the hash of \'deposit\'', async () => {
                (await web3TransactionTracker.depositTransactionType.call())
                    .should.equal(cryptography.hash('deposit'));
            });
        });

        describe('withdrawalTransactionType()', () => {
            it('should equal the hash of \'withdrawal\'', async () => {
                (await web3TransactionTracker.withdrawalTransactionType.call())
                    .should.equal(cryptography.hash('withdrawal'));
            });
        });

        describe('count()', () => {
            let type;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersTransactionTracker.count(glob.user_a, type))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getByIndex()', () => {
            let type;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();
            });

            it('should equal value initialized', async () => {
                web3TransactionTracker.getByIndex.call(glob.user_a, type, 0)
                    .should.be.rejected;
            });
        });

        describe('getByBlockNumber()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();

                blockNumber = await provider.getBlockNumber();
            });

            it('should equal value initialized', async () => {
                web3TransactionTracker.getByBlockNumber.call(glob.user_a, type, blockNumber)
                    .should.be.rejected;
            });
        });

        describe('countByCurrency()', () => {
            let type;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();
            });

            it('should equal value initialized', async () => {
                (await ethersTransactionTracker.countByCurrency(glob.user_a, type, address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getByCurrencyIndex()', () => {
            let type;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();
            });

            it('should equal value initialized', async () => {
                web3TransactionTracker.getByCurrencyIndex.call(glob.user_a, type, address0, 0, 0)
                    .should.be.rejected;
            });
        });

        describe('getByCurrencyBlockNumber()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();

                blockNumber = await provider.getBlockNumber();
            });

            it('should equal value initialized', async () => {
                web3TransactionTracker.getByCurrencyBlockNumber.call(
                    glob.user_a, type, address0, 0, blockNumber
                ).should.be.rejected;
            });
        });

        describe('add()', () => {
            let type, blockNumber;

            beforeEach(async () => {
                type = await web3TransactionTracker.depositTransactionType.call();

                blockNumber = await provider.getBlockNumber();
            });

            describe('if called by unregistered service', () => {
                it('should revert', async () => {
                    web3TransactionTracker.add(
                        glob.user_a, type, 10, address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                })
            });

            describe('if within operational constraints', () => {
                it('should successfully add transaction', async () => {
                    await web3TransactionTracker.add(
                        glob.user_a, type, 10, address0, 0
                    );

                    (await ethersTransactionTracker.count(glob.user_a, type))
                        ._bn.should.eq.BN(1);

                    const logEntryByIndex = await ethersTransactionTracker.getByIndex(
                        glob.user_a, type, 0
                    );
                    logEntryByIndex.amount._bn.should.eq.BN(10);
                    logEntryByIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);
                    logEntryByIndex.currencyCt.should.equal(address0);
                    logEntryByIndex.currencyId._bn.should.eq.BN(0);

                    const logEntryByBlockNumber = await ethersTransactionTracker.getByBlockNumber(
                        glob.user_a, type, blockNumber + 10
                    );
                    logEntryByBlockNumber.should.deep.equal(logEntryByIndex);

                    const logEntryByCurrencyIndex = await ethersTransactionTracker.getByCurrencyIndex(
                        glob.user_a, type, address0, 0, 0
                    );
                    logEntryByCurrencyIndex.amount._bn.should.eq.BN(10);
                    logEntryByCurrencyIndex.blockNumber._bn.should.eq.BN(blockNumber + 1);

                    const logEntryByCurrencyBlockNumber = await ethersTransactionTracker.getByCurrencyBlockNumber(
                        glob.user_a, type, address0, 0, blockNumber + 10
                    );
                    logEntryByCurrencyBlockNumber.should.deep.equal(logEntryByCurrencyIndex);
                });
            });
        });
    });
};
