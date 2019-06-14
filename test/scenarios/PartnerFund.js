const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const {address0} = require('../mocks');
const {util: {cryptography}} = require('omphalos-commons');
const ERC20Token = artifacts.require('TestERC20');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const PartnerFund = artifacts.require('PartnerFund');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('PartnerFund', function () {
        let provider;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3PartnerFund, ethersPartnerFund;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3TransferControllerManager = await TransferControllerManager.deployed();
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3PartnerFund = await PartnerFund.new(glob.owner);
            ethersPartnerFund = new Contract(web3PartnerFund.address, PartnerFund.abi, glob.signer_owner);

            await web3PartnerFund.setTransferControllerManager(web3TransferControllerManager.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3PartnerFund.deployer.call()).should.equal(glob.owner);
                (await web3PartnerFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('hashName()', () => {
            it('should successfully hash name as upper case', async () => {
                (await web3PartnerFund.hashName.call('Some Name'))
                    .should.equal(cryptography.hash('SOME NAME'));
            });
        });

        describe('depositByIndices()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositByIndices.call(1, 0).should.be.rejected;
            });
        });

        describe('depositByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositByName.call('some name', 0).should.be.rejected;
            });
        });

        describe('depositByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositByNameHash.call(cryptography.hash('some name'), 0)
                    .should.be.rejected;
            });
        });

        describe('depositByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositByWallet.call(glob.user_a, 0).should.be.rejected;
            });
        });

        describe('depositsCountByIndex()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositsCountByIndex.call(1).should.be.rejected;
            });
        });

        describe('depositsCountByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositsCountByName.call('some name').should.be.rejected;
            });
        });

        describe('depositsCountByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositsCountByNameHash.call(cryptography.hash('some name'))
                    .should.be.rejected;
            });
        });

        describe('depositsCountByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.depositsCountByWallet.call(glob.user_a)
                    .should.be.rejected;
            });
        });

        describe('activeBalanceByIndex()', () => {
            it('should revert', async () => {
                web3PartnerFund.activeBalanceByIndex.call(1, address0, 0)
                    .should.be.rejected;
            });
        });

        describe('activeBalanceByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.activeBalanceByName.call('some name', address0, 0)
                    .should.be.rejected;
            });
        });

        describe('activeBalanceByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.activeBalanceByNameHash.call(
                    cryptography.hash('some name'), address0, 0
                ).should.be.rejected;
            });
        });

        describe('activeBalanceByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.activeBalanceByWallet.call(glob.user_a, address0, 0)
                    .should.be.rejected;
            });
        });

        describe('stagedBalanceByIndex()', () => {
            it('should revert', async () => {
                web3PartnerFund.stagedBalanceByIndex.call(1, address0, 0)
                    .should.be.rejected;
            });
        });

        describe('stagedBalanceByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.stagedBalanceByName.call('some name', address0, 0)
                    .should.be.rejected;
            });
        });

        describe('stagedBalanceByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.stagedBalanceByNameHash.call(
                    cryptography.hash('some name'), address0, 0
                ).should.be.rejected;
            });
        });

        describe('stagedBalanceByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.stagedBalanceByWallet.call(glob.user_a, address0, 0)
                    .should.be.rejected;
            });
        });

        describe('partnersCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersPartnerFund.partnersCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('indexByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.indexByName.call('some name')
                    .should.be.rejected;
            });
        });

        describe('indexByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.indexByNameHash.call(cryptography.hash('some name'))
                    .should.be.rejected;
            });
        });

        describe('indexByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.indexByWallet.call(glob.user_a)
                    .should.be.rejected;
            });
        });

        describe('isRegisteredByName()', () => {
            it('should revert', async () => {
                (await web3PartnerFund.isRegisteredByName.call('some name'))
                    .should.be.false;
            });
        });

        describe('isRegisteredByNameHash()', () => {
            it('should revert', async () => {
                (await web3PartnerFund.isRegisteredByNameHash.call(cryptography.hash('some name')))
                    .should.be.false;
            });
        });

        describe('isRegisteredByWallet()', () => {
            it('should revert', async () => {
                (await web3PartnerFund.isRegisteredByWallet.call(glob.user_a))
                    .should.be.false;
            });
        });

        describe('feeByIndex()', () => {
            describe('if called index is too low', () => {
                it('should revert', async () => {
                    web3PartnerFund.feeByIndex(0).should.be.rejected;
                });
            });

            describe('if called index is too high', () => {
                it('should revert', async () => {
                    web3PartnerFund.feeByIndex(1).should.be.rejected;
                });
            });
        });

        describe('feeByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.feeByName('some name').should.be.rejected;
            });
        });

        describe('feeByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.feeByNameHash(cryptography.hash('some name'))
                    .should.be.rejected;
            });
        });

        describe('feeByWallet()', () => {
            it('should revert', async () => {
                web3PartnerFund.feeByNameHash(glob.user_a)
                    .should.be.rejected;
            });
        });

        describe('walletByIndex()', () => {
            describe('if called index is too low', () => {
                it('should revert', async () => {
                    web3PartnerFund.walletByIndex(0).should.be.rejected;
                });
            });

            describe('if called index is too high', () => {
                it('should revert', async () => {
                    web3PartnerFund.walletByIndex(1).should.be.rejected;
                });
            });
        });

        describe('walletByName()', () => {
            it('should revert', async () => {
                web3PartnerFund.walletByName('some name').should.be.rejected;
            });
        });

        describe('walletByNameHash()', () => {
            it('should revert', async () => {
                web3PartnerFund.walletByNameHash(cryptography.hash('some name'))
                    .should.be.rejected;
            });
        });

        describe('registerByName()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with empty partner name', () => {
                it('should revert', async () => {
                    web3PartnerFund.registerByName(
                        '', 1e15, glob.user_a, false, true
                    ).should.be.rejected;
                });
            });

            describe('if called without possibility to update', () => {
                it('should revert', async () => {
                    web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, false
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                it('register successfully', async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );

                    (await ethersPartnerFund.partnersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.isRegisteredByName('some partner'))
                        .should.be.true;
                    (await ethersPartnerFund.isRegisteredByNameHash(nameHash))
                        .should.be.true;
                    (await ethersPartnerFund.isRegisteredByWallet(glob.user_a))
                        .should.be.true;
                    (await ethersPartnerFund.feeByIndex(1))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByName('some partner'))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByNameHash(nameHash))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByWallet(glob.user_a))
                        ._bn.should.eq.BN(1e15);
                    (await web3PartnerFund.walletByIndex.call(1))
                        .should.equal(glob.user_a);
                    (await web3PartnerFund.walletByName.call('some partner'))
                        .should.equal(glob.user_a);
                    (await web3PartnerFund.walletByNameHash.call(nameHash))
                        .should.equal(glob.user_a);
                });
            });

            describe('if called partner is previously registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    ).should.be.rejected
                });
            });
        });

        describe('registerByNameHash()', () => {
            let nameHash;

            before(() => {
                nameHash = cryptography.hash('SOME PARTNER');
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called without possibility to update', () => {
                it('should revert', async () => {
                    web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, false
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('register successfully', async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    );

                    (await ethersPartnerFund.partnersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.indexByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.isRegisteredByName('some partner'))
                        .should.be.true;
                    (await ethersPartnerFund.isRegisteredByNameHash(nameHash))
                        .should.be.true;
                    (await ethersPartnerFund.isRegisteredByWallet(glob.user_a))
                        .should.be.true;
                    (await ethersPartnerFund.feeByIndex(1))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByName('some partner'))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByNameHash(nameHash))
                        ._bn.should.eq.BN(1e15);
                    (await ethersPartnerFund.feeByWallet(glob.user_a))
                        ._bn.should.eq.BN(1e15);
                    (await web3PartnerFund.walletByIndex.call(1))
                        .should.equal(glob.user_a);
                    (await web3PartnerFund.walletByName.call('some partner'))
                        .should.equal(glob.user_a);
                    (await web3PartnerFund.walletByNameHash.call(nameHash))
                        .should.equal(glob.user_a);
                });
            });

            describe('if called partner is previously registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    ).should.be.rejected
                });
            });
        });

        describe('setFeeByIndex()', () => {
            describe('if called index is too low', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByIndex(0, 2e15).should.be.rejected;
                });
            });

            describe('if called index is too high', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByIndex(2, 2e15).should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByIndex(1, 2e15).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByIndex(1, 2e15, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByIndex(1, 2e15, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByIndex(1, 2e15);

                    (await ethersPartnerFund.feeByIndex(1))
                        ._bn.should.eq.BN(2e15);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByIndex(1, 2e15, {from: glob.user_a});

                    (await ethersPartnerFund.feeByIndex(1))
                        ._bn.should.eq.BN(2e15);
                });
            });
        });

        describe('setFeeByName()', () => {
            describe('if called name is not registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByName('some unregistered partner', 2e15).should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByName('some partner', 2e15).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByName('some partner', 2e15, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByName('some partner', 2e15, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByName('some partner', 2e15);

                    (await ethersPartnerFund.feeByName('some partner'))
                        ._bn.should.eq.BN(2e15);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByName('some partner', 2e15, {from: glob.user_a});

                    (await ethersPartnerFund.feeByName('some partner'))
                        ._bn.should.eq.BN(2e15);
                });
            });
        });

        describe('setFeeByNameHash()', () => {
            let nameHash;

            before(() => {
                nameHash = cryptography.hash('SOME PARTNER');
            });

            describe('if called name is not registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByNameHash(
                        cryptography.hash('some unregistered partner'), 2e15
                    ).should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByNameHash(nameHash, 2e15).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByNameHash(nameHash, 2e15, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByNameHash(nameHash, 2e15, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByNameHash(nameHash, 2e15);

                    (await ethersPartnerFund.feeByNameHash(nameHash))
                        ._bn.should.eq.BN(2e15);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByNameHash(nameHash, 2e15, {from: glob.user_a});

                    (await ethersPartnerFund.feeByNameHash(nameHash))
                        ._bn.should.eq.BN(2e15);
                });
            });
        });

        describe('setFeeByWallet()', () => {
            let nameHash;

            before(() => {
                nameHash = cryptography.hash('SOME PARTNER');
            });

            describe('if called wallet is not registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByWallet(glob.user_b, 2e15).should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByWallet(glob.user_a, 2e15).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByWallet(glob.user_a, 2e15, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setFeeByWallet(glob.user_a, 2e15, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByWallet(glob.user_a, 2e15);

                    (await ethersPartnerFund.feeByWallet(glob.user_a))
                        ._bn.should.eq.BN(2e15);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setFeeByWallet(glob.user_a, 2e15, {from: glob.user_a});

                    (await ethersPartnerFund.feeByWallet(glob.user_a))
                        ._bn.should.eq.BN(2e15);
                });
            });
        });

        describe('setWalletByIndex()', () => {
            describe('if called index is too low', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(0, glob.user_b).should.be.rejected;
                });
            });

            describe('if called index is too high', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(2, glob.user_b).should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(1, glob.user_b).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(1, glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(1, glob.user_b, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by partner, operator can not update and wallet is zero-address', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByIndex(1, address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByIndex(1, glob.user_b);

                    (await web3PartnerFund.walletByIndex(1))
                        .should.equal(glob.user_b);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByIndex(1, glob.user_b, {from: glob.user_a});

                    (await web3PartnerFund.walletByIndex(1))
                        .should.equal(glob.user_b);
                });
            });
        });

        describe('setWalletByName()', () => {
            describe('if called name is not registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByName('some unregistered partner', glob.user_b)
                        .should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByName('some partner', glob.user_b)
                        .should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByName('some partner', glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByName('some partner', glob.user_b, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by partner, operator can not update and wallet is zero-address', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByName('some partner', address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByName('some partner', glob.user_b);

                    (await web3PartnerFund.walletByName('some partner'))
                        .should.equal(glob.user_b);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByName('some partner', glob.user_b, {from: glob.user_a});

                    (await web3PartnerFund.walletByName('some partner'))
                        .should.equal(glob.user_b);
                });
            });
        });

        describe('setWalletByNameHash()', () => {
            let nameHash;

            before(() => {
                nameHash = cryptography.hash('SOME PARTNER');
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByNameHash(nameHash, glob.user_b).should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByNameHash(nameHash, glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByNameHash(nameHash, glob.user_b, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by partner, operator can not update and wallet is zero-address', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByNameHash(nameHash, address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByNameHash(nameHash, glob.user_b);

                    (await web3PartnerFund.walletByNameHash(nameHash))
                        .should.equal(glob.user_b);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByNameHash(
                        nameHash, 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByNameHash(nameHash, glob.user_b, {from: glob.user_a});

                    (await web3PartnerFund.walletByNameHash(nameHash))
                        .should.equal(glob.user_b);
                });
            });
        });

        describe('setWalletByWallet()', () => {
            describe('if called old wallet is not registered', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByWallet(glob.user_b, glob.user_b)
                        .should.be.rejected;
                });
            });

            describe('if called by operator and operator can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByWallet(glob.user_a, glob.user_b)
                        .should.be.rejected;
                });
            });

            describe('if called by non-operator non-partner wallet', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByWallet(glob.user_a, glob.user_b, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called by partner and partner can not update', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, false, true
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByWallet(glob.user_a, glob.user_b, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by partner, operator can not update and wallet is zero-address', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, false
                    );
                });

                it('should revert', async () => {
                    web3PartnerFund.setWalletByWallet(glob.user_a, address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by operator within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByWallet(glob.user_a, glob.user_b);

                    (await web3PartnerFund.walletByName('some partner'))
                        .should.equal(glob.user_b);
                });
            });

            describe('if called by partner within operational constraints', () => {
                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should successfully set fee', async () => {
                    await web3PartnerFund.setWalletByWallet(glob.user_a, glob.user_b, {from: glob.user_a});

                    (await web3PartnerFund.walletByName('some partner'))
                        .should.equal(glob.user_b);
                });
            });
        });

        describe('fallback function', () => {
            describe('if called with no partner registered', () => {
                it('should revert', async () => {
                    web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3PartnerFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    }).should.be.rejected;
                });
            });

            describe('if called with partner registered', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should increment active balance of partner sending funds', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3PartnerFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersPartnerFund.depositsCountByIndex(1))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.activeBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.stagedBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('receiveEthersTo()', () => {
            describe('if called with no partner registered', () => {
                it('should revert', async () => {
                    web3PartnerFund.receiveEthersTo(
                        '0x0000000000000000000000000000000000000001',
                        '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('if called with partner registered', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should increment active balance of partner sending funds', async () => {
                    await web3PartnerFund.receiveEthersTo(
                        '0x0000000000000000000000000000000000000001',
                        '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersPartnerFund.depositsCountByIndex(1))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.activeBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersPartnerFund.stagedBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('receiveTokens()', () => {
            beforeEach(async () => {
                await web3ERC20.approve(
                    web3PartnerFund.address, 10, {from: glob.user_a, gas: 1e6}
                );
            });

            describe('if called with no partner registered', () => {
                it('should revert', async () => {
                    web3PartnerFund.receiveTokens(
                        '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with partner registered', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should increment active balance of partner sending funds', async () => {
                    await web3PartnerFund.receiveTokens(
                        '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                    );

                    (await ethersPartnerFund.depositsCountByIndex(1))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.activeBalanceByIndex(1, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByName('some partner', web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByNameHash(nameHash, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.stagedBalanceByIndex(1, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByName('some partner', web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);

                    (await ethersERC20.balanceOf(ethersPartnerFund.address))._bn.should.eq.BN(10);
                });
            });
        });

        describe('receiveTokensTo()', () => {
            beforeEach(async () => {
                await web3ERC20.approve(
                    web3PartnerFund.address, 10, {from: glob.user_a, gas: 1e6}
                );
            });

            describe('if called with no partner registered', () => {
                it('should revert', async () => {
                    web3PartnerFund.receiveTokensTo(
                        '0x0000000000000000000000000000000000000001', '', 10, web3ERC20.address, 0,
                        '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with partner registered', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                beforeEach(async () => {
                    await web3PartnerFund.registerByName(
                        'some partner', 1e15, glob.user_a, true, true
                    );
                });

                it('should increment active balance of partner sending funds', async () => {
                    await web3PartnerFund.receiveTokensTo(
                        '0x0000000000000000000000000000000000000001', '', 10, web3ERC20.address, 0,
                        '', {from: glob.user_a}
                    );

                    (await ethersPartnerFund.depositsCountByIndex(1))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByName('some partner'))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByNameHash(nameHash))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.depositsCountByWallet(glob.user_a))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerFund.activeBalanceByIndex(1, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByName('some partner', web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByNameHash(nameHash, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersPartnerFund.stagedBalanceByIndex(1, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByName('some partner', web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);

                    (await ethersERC20.balanceOf(ethersPartnerFund.address))._bn.should.eq.BN(10);
                });
            });
        });

        describe('stage()', () => {
            beforeEach(async () => {
                await web3PartnerFund.registerByName(
                    'some partner', 1e15, glob.user_a, true, true
                );

                await web3PartnerFund.receiveEthersTo(
                    '0x0000000000000000000000000000000000000001',
                    '',
                    {
                        from: glob.user_a,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    }
                );
            });

            describe('if called by non-registered wallet', () => {
                it('should revert', async () => {
                    web3PartnerFund.stage(web3.toWei(1, 'ether'), address0, 0, {from: glob.user_b})
                        .should.be.rejected;
                });
            });

            describe('if called with negative amount', () => {
                it('should revert', async () => {
                    web3PartnerFund.stage(web3.toWei(-1, 'ether'), address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let nameHash;

                before(() => {
                    nameHash = cryptography.hash('SOME PARTNER');
                });

                it('should successfully stage', async () => {
                    await web3PartnerFund.stage(web3.toWei(0.6, 'ether'), address0, 0, {from: glob.user_a});

                    (await ethersPartnerFund.activeBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                    (await ethersPartnerFund.activeBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                    (await ethersPartnerFund.activeBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                    (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                    (await ethersPartnerFund.stagedBalanceByIndex(1, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                    (await ethersPartnerFund.stagedBalanceByName('some partner', address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                    (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                    (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                });
            });
        });

        describe('withdraw()', () => {
            beforeEach(async () => {
                await web3PartnerFund.registerByName(
                    'some partner', 1e15, glob.user_a, true, true
                );
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3PartnerFund.receiveEthersTo(
                        '0x0000000000000000000000000000000000000001',
                        '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    await web3PartnerFund.stage(
                        web3.toWei(0.6, 'ether'), address0, 0, {from: glob.user_a}
                    );
                });

                describe('if called by non-registered wallet', () => {
                    it('should revert', async () => {
                        web3PartnerFund.withdraw(web3.toWei(0.4, 'ether'), address0, 0, '', {from: glob.user_b})
                            .should.be.rejected;
                    });
                });

                describe('if called with negative amount', () => {
                    it('should revert', async () => {
                        web3PartnerFund.withdraw(web3.toWei(-0.4, 'ether'), address0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    let nameHash, balanceBefore;

                    before(async () => {
                        nameHash = cryptography.hash('SOME PARTNER');

                        balanceBefore = await provider.getBalance(glob.user_a)._bn;
                    });

                    it('should successfully withdraw', async () => {
                        await web3PartnerFund.withdraw(web3.toWei(0.4, 'ether'), address0, 0, '', {from: glob.user_a});

                        (await ethersPartnerFund.activeBalanceByIndex(1, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                        (await ethersPartnerFund.activeBalanceByName('some partner', address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                        (await ethersPartnerFund.activeBalanceByNameHash(nameHash, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                        (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.4')._bn);
                        (await ethersPartnerFund.stagedBalanceByIndex(1, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                        (await ethersPartnerFund.stagedBalanceByName('some partner', address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                        (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                        (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);

                        (await provider.getBalance(glob.user_a))._bn.should.be.gt.BN(balanceBefore);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3PartnerFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );

                    await web3PartnerFund.receiveTokensTo(
                        '0x0000000000000000000000000000000000000001', '', 10, web3ERC20.address, 0,
                        '', {from: glob.user_a}
                    );

                    await web3PartnerFund.stage(6, web3ERC20.address, 0, {from: glob.user_a});
                });

                describe('if called by non-registered wallet', () => {
                    it('should revert', async () => {
                        web3PartnerFund.withdraw(4, web3ERC20.address, 0, '', {from: glob.user_b})
                            .should.be.rejected;
                    });
                });

                describe('if called with negative amount', () => {
                    it('should revert', async () => {
                        web3PartnerFund.withdraw(-4, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    let nameHash, balanceBefore;

                    before(async () => {
                        nameHash = cryptography.hash('SOME PARTNER');

                        balanceBefore = await ethersERC20.balanceOf(glob.user_a);
                    });

                    it('should successfully withdraw', async () => {
                        await web3PartnerFund.withdraw(4, web3ERC20.address, 0, '', {from: glob.user_a});

                        (await ethersPartnerFund.activeBalanceByIndex(1, web3ERC20.address, 0))
                            ._bn.should.eq.BN(4);
                        (await ethersPartnerFund.activeBalanceByName('some partner', web3ERC20.address, 0))
                            ._bn.should.eq.BN(4);
                        (await ethersPartnerFund.activeBalanceByNameHash(nameHash, web3ERC20.address, 0))
                            ._bn.should.eq.BN(4);
                        (await ethersPartnerFund.activeBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(4);
                        (await ethersPartnerFund.stagedBalanceByIndex(1, web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersPartnerFund.stagedBalanceByName('some partner', web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersPartnerFund.stagedBalanceByNameHash(nameHash, web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersPartnerFund.stagedBalanceByWallet(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);

                        (await ethersERC20.balanceOf(glob.user_a))._bn.should.eq.BN(balanceBefore.add(4)._bn);
                    });
                });
            });
        });
    });
};
