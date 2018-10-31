const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('StandardTokenEx');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const ClientFund = artifacts.require('ClientFund');
const MockedClientFundService = artifacts.require('MockedClientFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ClientFund', function () {
        let web3TransferControllerManager;
        let web3ERC20;
        let web3ClientFund, ethersClientFund;
        let web3MockedClientFundAuthorizedService, ethersMockedClientFundAuthorizedService;
        let web3MockedClientFundUnauthorizedService, ethersMockedClientFundUnauthorizedService;
        let web3MockedBeneficiary, ethersBeneficiary;

        before(async () => {
            web3TransferControllerManager = await TransferControllerManager.deployed();
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            await web3ERC20.testMint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3ClientFund = await ClientFund.new(glob.owner);
            ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, glob.signer_owner);

            await web3ClientFund.changeTransferControllerManager(web3TransferControllerManager.address)

            web3MockedClientFundAuthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundAuthorizedService = new Contract(web3MockedClientFundAuthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedClientFundUnauthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundUnauthorizedService = new Contract(web3MockedClientFundUnauthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            // Fully wire the mocked authorized service
            await web3ClientFund.registerService(web3MockedClientFundAuthorizedService.address);
            await web3ClientFund.authorizeRegisteredService(web3MockedClientFundAuthorizedService.address, {from: glob.user_a});
            await web3MockedClientFundAuthorizedService.changeClientFund(web3ClientFund.address);

            // Partially wire the mocked unauthorized service
            await web3MockedClientFundUnauthorizedService.changeClientFund(web3ClientFund.address);

            await web3ClientFund.registerBeneficiary(web3MockedBeneficiary.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3ClientFund.deployer.call()).should.equal(glob.owner);
                (await web3ClientFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                (await ethersClientFund.depositsCount(Wallet.createRandom().address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('depositsOfCurrencyCount()', () => {
            it('should return initial value', async () => {
                (await ethersClientFund.depositsOfCurrencyCount(Wallet.createRandom().address, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('withdrawalsCount()', () => {
            it('should return initial value', async () => {
                (await ethersClientFund.withdrawalsCount(Wallet.createRandom().address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('withdrawalsOfCurrencyCount()', () => {
            it('should return initial value', async () => {
                (await ethersClientFund.withdrawalsOfCurrencyCount(Wallet.createRandom().address, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('activeBalanceLogEntriesCount()', () => {
            it('should return initial value', async () => {
                (await ethersClientFund.activeBalanceLogEntriesCount(Wallet.createRandom().address, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('depositedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.depositedBalance(mocks.address0, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.depositedBalance(Wallet.createRandom().address, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.depositedBalance(Wallet.createRandom().address, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('settledBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.settledBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.settledBalance(Wallet.createRandom().address, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.settledBalance(Wallet.createRandom().address, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('stagedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.stagedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.stagedBalance(Wallet.createRandom().address, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.stagedBalance(Wallet.createRandom().address, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('activeBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.activeBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.activeBalance(Wallet.createRandom().address, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.activeBalance(Wallet.createRandom().address, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('fallback function', () => {
            describe('first deposit', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3ClientFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersClientFund.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('second deposit', () => {
                beforeEach(async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3ClientFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });
                });

                it('should add on top of the first deposit', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3ClientFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersClientFund.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(2);

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('depositEthersTo()', () => {
            describe('first deposit', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a,
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersClientFund.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('second deposit', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a,
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );
                });

                it('should add on top of the first deposit', async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersClientFund.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(2);

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('depositTokens()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(10, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3ClientFund.address, 9999, {from: glob.user_a, gas: 1e6});
                    });

                    it('should revert', async () => {
                        web3ClientFund.depositTokens(9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('first deposit', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        await web3ClientFund.depositTokens(
                            10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        (await ethersClientFund.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(1);

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('second deposit', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3ClientFund.depositTokens(
                            10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3ClientFund.depositTokens(
                            10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        (await ethersClientFund.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(2);

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });

                });
            });
        });

        describe('depositTokensTo()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 10, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3ClientFund.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('first deposit', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        await web3ClientFund.depositTokensTo(
                            glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(1);

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('second deposit', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3ClientFund.depositTokensTo(
                            glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3ClientFund.depositTokensTo(
                            glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(2);

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('before first deposit', () => {
                it('should revert', async () => {
                    ethersClientFund.deposit(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersClientFund.deposit(glob.user_a, 0);

                    deposit.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersClientFund.deposit(glob.user_a, 0);

                    deposit.amount._bn.should.eq.BN(10);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });
        });

        describe('depositOfCurrency()', () => {
            describe('before first deposit', () => {
                it('should revert', async () => {
                    ethersClientFund.depositOfCurrency(glob.user_a, mocks.address0, 0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersClientFund.depositOfCurrency(glob.user_a, mocks.address0, 0, 0);

                    deposit.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    deposit.blockNumber.should.exist;
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersClientFund.depositOfCurrency(glob.user_a, web3ERC20.address, 0, 0);

                    deposit.amount._bn.should.eq.BN(10);
                    deposit.blockNumber.should.exist;
                });
            });
        });

        describe('updateSettledBalance()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.updateSettledBalance(
                        Wallet.createRandom().address, 1, Wallet.createRandom().address, 0
                    ).should.be.rejected;
                });
            });

            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        mocks.address0, utils.parseEther('1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('-1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should successfully update settled balance of Ether', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('0.4'), mocks.address0, 0
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('-0.6')._bn);
                    (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully update settled balance of ERC20 token', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 4, web3ERC20.address, 0
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(-6);
                    (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('stage()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.stage(
                        Wallet.createRandom().address, 1, Wallet.createRandom().address, 0
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.stage(
                        glob.user_a, utils.parseEther('1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, utils.parseEther('-1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, utils.parseEther('0.3'), mocks.address0, 0, {gasLimit: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(0.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, utils.parseEther('0.3'), mocks.address0, 0, {gasLimit: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 14, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, 3, web3ERC20.address, 0, {gasLimit: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(3);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 4, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, 3, web3ERC20.address, 0, {gasLimit: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(3);
                    });
                });
            });
        });

        describe('unstage()', () => {
            describe('called by owner', () => {
                it('should revert', async () => {
                    web3ClientFund.unstage(web3.toWei(1), mocks.address0, 0, {from: glob.owner})
                        .should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gas: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.unstage(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, {from: glob.user_a}
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.9')._bn);
                    (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gasLimit: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.unstage(
                        2, web3ERC20.address, 0, {from: glob.user_a}
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(9);
                    (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('stageToBeneficiary()', () => {
            describe('of negative amount', () => {
                it('should revert', async () => {
                    web3ClientFund.stageToBeneficiary(
                        web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, {
                            from: glob.user_a,
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('to unregistered beneficiary', () => {
                it('should revert', async () => {
                    web3ClientFund.stageToBeneficiary(
                        Wallet.createRandom().address, web3.toWei(1, 'ether'), mocks.address0, 0, {
                            from: glob.user_a,
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(0.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 14, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, 3, web3ERC20.address, 0, {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 4, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, 3, web3ERC20.address, 0, {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('stageToBeneficiaryUntargeted()', () => {
            describe('with zero source wallet', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                        mocks.address0, web3MockedBeneficiary.address, web3.toWei(1, 'ether'), mocks.address0, 0, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('with zero target wallet', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                        glob.user_a, mocks.address0, web3.toWei(1, 'ether'), mocks.address0, 0, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    web3MockedClientFundUnauthorizedService.stageToBeneficiaryUntargeted(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(1, 'ether'), mocks.address0, 0, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of 0 or negative amount', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                            glob.user_a, web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gas: 1e6}
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(0.4, 'ether'), mocks.address0, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                            glob.user_a, web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 14, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                            glob.user_a, web3MockedBeneficiary.address, 3, web3ERC20.address, 0, {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 4, web3ERC20.address, 0
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiaryUntargeted(
                            glob.user_a, web3MockedBeneficiary.address, 3, web3ERC20.address, 0, {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('seizeAllBalances()', () => {
            describe('with zero source wallet', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.seizeAllBalances(
                        mocks.address0, glob.user_b, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('with zero target wallet', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.seizeAllBalances(
                        glob.user_a, mocks.address0, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    web3MockedClientFundUnauthorizedService.seizeAllBalances(
                        glob.user_a, glob.user_b, {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gasLimit: 1e6}
                    );
                });

                it('should successfully seize all balances', async () => {
                    await web3MockedClientFundAuthorizedService.seizeAllBalances(
                        glob.user_a, glob.user_b, {gas: 1e6}
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);

                    (await ethersClientFund.depositedBalance(glob.user_b, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.settledBalance(glob.user_b, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_b, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1.4')._bn);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 14, web3ERC20.address, 0
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gas: 1e6}
                    );
                });

                it('should successfully seize all balances', async () => {
                    await web3MockedClientFundAuthorizedService.seizeAllBalances(
                        glob.user_a, glob.user_b, {gas: 1e6}
                    );

                    (await ethersClientFund.depositedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.settledBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);

                    (await ethersClientFund.depositedBalance(glob.user_b, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.settledBalance(glob.user_b, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersClientFund.stagedBalance(glob.user_b, web3ERC20.address, 0))
                        ._bn.should.eq.BN(14);
                });
            });
        });

        describe('withdraw()', () => {
            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gasLimit: 1e6}
                    );
                });

                describe('of amount less than or equal to staged balance', () => {
                    it('should successfully withdraw', async () => {
                        await web3ClientFund.withdraw(web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a});

                        (await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                    });
                });

                describe('of amount greater than staged balance', () => {
                    it('should successfully withdraw', async () => {
                        await web3ClientFund.withdraw(web3.toWei(0.5, 'ether'), mocks.address0, 0, '', {from: glob.user_a});

                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gas: 1e6}
                    );
                });

                describe('of amount less than or equal to staged balance', () => {
                    it('should successfully withdraw', async () => {
                        await web3ClientFund.withdraw(
                            2, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                    });
                });

                describe('of amount greater than staged balance', () => {
                    it('should successfully withdraw', async () => {
                        await web3ClientFund.withdraw(
                            5, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersClientFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('withdrawal()', () => {
            describe('before first withdrawal', () => {
                it('should revert', async () => {
                    ethersClientFund.withdrawal(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gasLimit: 1e6}
                    );
                    await web3ClientFund.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersClientFund.withdrawal(glob.user_a, 0);

                    withdrawal.amount._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                    withdrawal.blockNumber.should.exist;
                    withdrawal.currencyCt.should.equal(mocks.address0);
                    withdrawal.currencyId._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gas: 1e6}
                    );
                    await web3ClientFund.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersClientFund.withdrawal(glob.user_a, 0);

                    withdrawal.amount._bn.should.eq.BN(2);
                    withdrawal.blockNumber.should.exist;
                    withdrawal.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    withdrawal.currencyId._bn.should.eq.BN(0);
                });
            });
        });

        describe('withdrawalOfCurrency()', () => {
            describe('before first deposit', () => {
                it('should revert', async () => {
                    ethersClientFund.withdrawalOfCurrency(glob.user_a, mocks.address0, 0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gasLimit: 1e6}
                    );
                    await web3ClientFund.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersClientFund.withdrawalOfCurrency(glob.user_a, mocks.address0, 0, 0);

                    withdrawal.amount._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                    withdrawal.blockNumber.should.exist;
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gas: 1e6}
                    );
                    await web3ClientFund.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersClientFund.withdrawalOfCurrency(glob.user_a, web3ERC20.address, 0, 0);

                    withdrawal.amount._bn.should.eq.BN(2);
                    withdrawal.blockNumber.should.exist;
                });
            });
        });

        describe('activeBalanceLogEntry()', () => {
            describe('before first deposit', () => {
                it('should revert', async () => {
                    ethersClientFund.activeBalanceLogEntry(glob.user_a, mocks.address0, 0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.depositEthersTo(
                        glob.user_a, {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, {gasLimit: 1e6}
                    );
                });

                it('should successfully return log entry', async () => {
                    let activeBalanceLogEntry = await ethersClientFund.activeBalanceLogEntry(glob.user_a, mocks.address0, 0, 0);

                    activeBalanceLogEntry.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    activeBalanceLogEntry.blockNumber.should.exist;

                    activeBalanceLogEntry = await ethersClientFund.activeBalanceLogEntry(glob.user_a, mocks.address0, 0, 1);

                    activeBalanceLogEntry.amount._bn.should.eq.BN(utils.parseEther('0.7')._bn);
                    activeBalanceLogEntry.blockNumber.should.exist;
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.depositTokensTo(
                        glob.user_a, 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, {gas: 1e6}
                    );
                });

                it('should successfully return log entry', async () => {
                    let activeBalanceLogEntry = await ethersClientFund.activeBalanceLogEntry(glob.user_a, web3ERC20.address, 0, 0);

                    activeBalanceLogEntry.amount._bn.should.eq.BN(10);
                    activeBalanceLogEntry.blockNumber.should.exist;

                    activeBalanceLogEntry = await ethersClientFund.activeBalanceLogEntry(glob.user_a, web3ERC20.address, 0, 1);

                    activeBalanceLogEntry.amount._bn.should.eq.BN(7);
                    activeBalanceLogEntry.blockNumber.should.exist;
                });
            });
        });
    });
};
