const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
const ERC721Token = artifacts.require('TestERC721');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const ClientFund = artifacts.require('ClientFund');
const BalanceTracker = artifacts.require('BalanceTracker');
const TransactionTracker = artifacts.require('TransactionTracker');
const MockedClientFundService = artifacts.require('MockedClientFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedTokenHolderRevenueFund = artifacts.require('MockedTokenHolderRevenueFund');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ClientFund', function () {
        let provider;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3ERC721, ethersERC721;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3TransactionTracker, ethersTransactionTracker;
        let web3MockedWalletLocker, ethersMockedWalletLocker;
        let web3ClientFund, ethersClientFund;
        let web3MockedClientFundAuthorizedService, ethersMockedClientFundAuthorizedService;
        let web3MockedClientFundUnauthorizedService, ethersMockedClientFundUnauthorizedService;
        let web3MockedBeneficiary, ethersMockedBeneficiary;
        let web3MockedTokenHolderRevenueFund, ethersMockedTokenHolderRevenueFund;
        let depositedBalanceType, settledBalanceType, stagedBalanceType;
        let depositTransactionType;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3MockedWalletLocker = await MockedWalletLocker.new();
            ethersMockedWalletLocker = new Contract(web3MockedWalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3MockedTokenHolderRevenueFund = await MockedTokenHolderRevenueFund.new();
            ethersMockedTokenHolderRevenueFund = new Contract(web3MockedTokenHolderRevenueFund.address, MockedTokenHolderRevenueFund.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            web3ERC721 = await ERC20Token.new();
            ethersERC721 = new Contract(web3ERC721.address, ERC721Token.abi, glob.signer_owner);

            await web3ERC721.mint(glob.user_a, 10);
            await web3ERC721.mint(glob.user_a, 20);
            await web3ERC721.mint(glob.user_a, 30);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});
            await web3TransferControllerManager.registerCurrency(web3ERC721.address, 'ERC721', {from: glob.owner});

            web3ClientFund = await ClientFund.new(glob.owner);
            ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, glob.signer_owner);
            web3BalanceTracker = await BalanceTracker.new(glob.owner);
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, BalanceTracker.abi, glob.signer_owner);
            web3TransactionTracker = await TransactionTracker.new(glob.owner);
            ethersTransactionTracker = new Contract(web3TransactionTracker.address, TransactionTracker.abi, glob.signer_owner);

            web3MockedClientFundAuthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundAuthorizedService = new Contract(web3MockedClientFundAuthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedClientFundUnauthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundUnauthorizedService = new Contract(web3MockedClientFundUnauthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            // Fully wire the mocked authorized service
            await web3ClientFund.registerService(web3MockedClientFundAuthorizedService.address);
            await web3ClientFund.authorizeInitialService(web3MockedClientFundAuthorizedService.address);
            await web3MockedClientFundAuthorizedService.setClientFund(web3ClientFund.address);

            // Partially wire the mocked unauthorized service
            await web3MockedClientFundUnauthorizedService.setClientFund(web3ClientFund.address);

            await web3ClientFund.setTransferControllerManager(web3TransferControllerManager.address);
            await web3ClientFund.setBalanceTracker(web3BalanceTracker.address);
            await web3ClientFund.freezeBalanceTracker();
            await web3ClientFund.setTransactionTracker(web3TransactionTracker.address);
            await web3ClientFund.freezeTransactionTracker();
            await web3ClientFund.setWalletLocker(web3MockedWalletLocker.address);
            await web3ClientFund.freezeWalletLocker();
            await web3ClientFund.setTokenHolderRevenueFund(web3MockedTokenHolderRevenueFund.address);
            await web3ClientFund.registerBeneficiary(web3MockedBeneficiary.address);

            await web3BalanceTracker.registerService(web3ClientFund.address);

            await web3TransactionTracker.registerService(web3ClientFund.address);

            depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
            settledBalanceType = await web3BalanceTracker.settledBalanceType();
            stagedBalanceType = await web3BalanceTracker.stagedBalanceType();

            depositTransactionType = await web3TransactionTracker.depositTransactionType();
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3ClientFund.deployer.call()).should.equal(glob.owner);
                (await web3ClientFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('tokenHolderRevenueFund()', () => {
            it('should equal value initialized', async () => {
                (await web3ClientFund.tokenHolderRevenueFund.call())
                    .should.equal(web3MockedTokenHolderRevenueFund.address);
            });
        });

        describe('setTokenHolderRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3ClientFund.setTokenHolderRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTokenHolderRevenueFundEvent');

                    (await ethersClientFund.tokenHolderRevenueFund())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3ClientFund.setTokenHolderRevenueFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                (await ethersClientFund.isSeizedWallet(glob.user_a)).should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersClientFund.seizedWalletsCount())
                    ._bn.should.eq.BN(0);
            })
        });

        describe('fallback function', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3ClientFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                        ._bn.should.eq.BN(1);

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('second reception', () => {
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

                    (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                        ._bn.should.eq.BN(2);

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveEthersTo()', () => {
            describe('to default balance', () => {
                describe('first reception', () => {
                    it('should add initial deposit and increment deposited balance', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            '',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                            ._bn.should.eq.BN(1);

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            '',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            '',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    });
                });
            });

            describe('to deposited balance', () => {
                describe('first reception', () => {
                    it('should add initial deposit and increment deposited balance', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'deposited',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                            ._bn.should.eq.BN(1);

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'deposited',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'deposited',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    });
                });
            });

            describe('to staged balance', () => {
                describe('first reception', () => {
                    it('should add initial stage and increment deposited balance', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'staged',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'staged',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );
                    });

                    it('should add on top of the first stage', async () => {
                        await web3ClientFund.receiveEthersTo(
                            glob.user_a,
                            'staged',
                            {
                                from: glob.user_a,
                                value: web3.toWei(1, 'ether'),
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    });
                });
            });
        });

        describe('receiveTokens()', () => {
            describe('if called with zero value', () => {
                it('should revert', async () => {
                    web3ClientFund.receiveTokens('', 0, Wallet.createRandom().address, 0, '', {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with zero currency contract address', () => {
                it('should revert', async () => {
                    web3ClientFund.receiveTokens('', 10, mocks.address0, 0, '', {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokens('', 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokens('', 10, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokens('', 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3ClientFund.address, 9999, {from: glob.user_a, gas: 1e6});
                    });

                    it('should revert', async () => {
                        web3ClientFund.receiveTokens('', 9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('to default balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokens(
                                '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokens(
                                '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokens(
                                '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });

                describe('to deposited balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokens(
                                'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokens(
                                'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokens(
                                'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });

                describe('to staged balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial stage and increment staged balance', async () => {
                            await web3ClientFund.receiveTokens(
                                'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokens(
                                'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );
                        });

                        it('should add on top of the first stage', async () => {
                            await web3ClientFund.receiveTokens(
                                'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });
            });

            describe('of ERC721 token', () => {
                describe.skip('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokens(
                            '', 10, web3ERC721.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('to default balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC721.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokens(
                                '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.true;
                            (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                                .should.be.false;
                            (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.false;
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC721.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ERC721.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokens(
                                '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokens(
                                '', 20, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.true;
                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 20, web3ERC721.address, 0))
                                .should.be.true;
                        });
                    });
                });
            });
        });

        describe('receiveTokensTo()', () => {
            describe('if called with zero amount', () => {
                it('should revert', async () => {
                    web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 0, web3ERC20.address, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with zero currency contract address', () => {
                it('should revert', async () => {
                    web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('of ERC20 token', () => {
                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
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
                        web3ClientFund.receiveTokensTo(
                            glob.user_a, '', 9999, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('to default balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });

                describe('to deposited balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'deposited', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });

                describe('to staged balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial stage and increment staged balance', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(10);

                            (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(0);
                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(10);
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC20.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, 'staged', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersERC20.balanceOf(ethersClientFund.address))
                                ._bn.should.eq.BN(20);

                            (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                                ._bn.should.eq.BN(20);
                        });
                    });
                });
            });

            describe('of ERC721 token', () => {
                describe.skip('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('to default balance', () => {
                    describe('first reception', () => {
                        beforeEach(async () => {
                            await web3ERC721.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add initial deposit and increment deposited balance', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(1);

                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.true;
                            (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                                .should.be.false;
                            (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.false;
                        });
                    });

                    describe('second reception', () => {
                        beforeEach(async () => {
                            await web3ERC721.approve(
                                web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ERC721.approve(
                                web3ClientFund.address, 20, {from: glob.user_a, gas: 1e6}
                            );
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );
                        });

                        it('should add on top of the first deposit', async () => {
                            await web3ClientFund.receiveTokensTo(
                                glob.user_a, '', 20, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                            );

                            (await ethersTransactionTracker.count(glob.user_a, depositTransactionType))
                                ._bn.should.eq.BN(2);

                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                                .should.be.true;
                            (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 20, web3ERC721.address, 0))
                                .should.be.true;
                        });
                    });
                });
            });
        });

        describe('updateSettledBalance()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.updateSettledBalance(
                        Wallet.createRandom().address, 1, Wallet.createRandom().address, 0, '', 0, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        mocks.address0, utils.parseEther('1'), mocks.address0, 0, '', 0, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('1'), mocks.address0, 0, '', 0, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('-1'), mocks.address0, 0, '', 0, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should successfully update settled balance of Ether', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, utils.parseEther('0.4'), mocks.address0, 0,
                        '', await provider.getBlockNumber(), {gasLimit: 1e6}
                    );

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('-0.6')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully update settled balance of ERC20 token', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 4, web3ERC20.address, 0, '', await provider.getBlockNumber(), {gasLimit: 1e6}
                    );

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(10);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(-6);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully update settled balance of ERC721 token', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 10, web3ERC721.address, 0, '', await provider.getBlockNumber(), {gasLimit: 1e6}
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                });
            });
        });

        describe('stage()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.stage(
                        Wallet.createRandom().address, 1, Wallet.createRandom().address, 0, ''
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.stage(
                        glob.user_a, utils.parseEther('1'), mocks.address0, 0, ''
                    ).should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, utils.parseEther('-1'), mocks.address0, 0, ''
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0,
                            '', await provider.getBlockNumber(), {gas: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, utils.parseEther('0.3'), mocks.address0, 0, '', {gasLimit: 1e6}
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(0.4, 'ether'), mocks.address0, 0,
                            '', await provider.getBlockNumber(), {gas: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, utils.parseEther('0.3'), mocks.address0, 0, '', {gasLimit: 1e6}
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 14, web3ERC20.address, 0,
                            '', await provider.getBlockNumber(), {gasLimit: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, 3, web3ERC20.address, 0, '', {gasLimit: 1e6}
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(3);
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 4, web3ERC20.address, 0,
                            '', await provider.getBlockNumber(), {gasLimit: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await ethersMockedClientFundAuthorizedService.stage(
                            glob.user_a, 3, web3ERC20.address, 0, '', {gasLimit: 1e6}
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(3);
                    });
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                beforeEach(async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 10, web3ERC721.address, 0,
                        '', await provider.getBlockNumber(), {gasLimit: 1e6}
                    );
                });

                it('should successfully stage by deducting from settled', async () => {
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, 10, web3ERC721.address, 0, '', {gasLimit: 1e6}
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.true;
                });
            });
        });

        describe('unstage()', () => {
            describe('called with negative amount', () => {
                it('should revert', async () => {
                    web3ClientFund.unstage(
                        web3.toWei(-0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.unstage(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    );

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.9')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, 3, web3ERC20.address, 0, '', {gasLimit: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.unstage(
                        2, web3ERC20.address, 0, '', {from: glob.user_a}
                    );

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(9);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(1);
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_a, 10, web3ERC721.address, 0, '', {gasLimit: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.unstage(
                        10, web3ERC721.address, 0, '', {from: glob.user_a}
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.true;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                });
            });
        });

        describe('stageToBeneficiary()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    web3ClientFund.stageToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, '', {
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    web3MockedClientFundUnauthorizedService.stageToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, '', {
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('of negative amount', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.stageToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, '', {
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('to unregistered beneficiary', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.stageToBeneficiary(
                        glob.user_a, Wallet.createRandom().address, web3.toWei(1, 'ether'), mocks.address0, 0, '', {
                            gas: 1e6
                        }
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0,
                            '', await provider.getBlockNumber(), {gas: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiary(
                            glob.user_a, web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.be.a('string').that.is.empty;
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await web3MockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, web3.toWei(0.4, 'ether'), mocks.address0, 0,
                            '', await provider.getBlockNumber(), {gas: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiary(
                            glob.user_a, web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {
                                gas: 1e6
                            }
                        );

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                            ._bn.should.eq.BN(0);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.be.a('string').that.is.empty;
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;
                    });
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                describe('of amount less than settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 14, web3ERC20.address, 0,
                            '', await provider.getBlockNumber(), {gasLimit: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from settled', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiary(
                            glob.user_a, web3MockedBeneficiary.address, 3, web3ERC20.address, 0, '', {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersERC20.allowance(web3ClientFund.address, web3MockedBeneficiary.address))
                            ._bn.should.eq.BN(3);

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.be.a('string').that.is.empty;
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.equal('ERC20');
                    });
                });

                describe('of amount greater than or equal to settled balance', () => {
                    beforeEach(async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                            glob.user_a, 4, web3ERC20.address, 0,
                            '', await provider.getBlockNumber(), {gasLimit: 1e6}
                        );
                    });

                    it('should successfully stage by deducting from deposited and rebalance settled to 0', async () => {
                        await web3MockedClientFundAuthorizedService.stageToBeneficiary(
                            glob.user_a, web3MockedBeneficiary.address, 3, web3ERC20.address, 0, '', {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        (await ethersERC20.allowance(web3ClientFund.address, web3MockedBeneficiary.address))
                            ._bn.should.eq.BN(3);

                        (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(1);
                        (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);
                        (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, web3ERC20.address, 0))
                            ._bn.should.eq.BN(0);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.be.a('string').that.is.empty;
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.equal('ERC20');
                    });
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                beforeEach(async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 10, web3ERC721.address, 0,
                        '', await provider.getBlockNumber(), {gasLimit: 1e6}
                    );
                });

                it('should successfully stage by deducting from settled', async () => {
                    await web3MockedClientFundAuthorizedService.stageToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, 10, web3ERC721.address, 0, '', {
                            from: glob.user_a,
                            gas: 1e6
                        }
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;

                });
            });
        });

        describe('transferToBeneficiary()', () => {
            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    web3MockedClientFundUnauthorizedService.transferToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(1, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of 0 or negative amount', () => {
                it('should revert', async () => {
                    web3MockedClientFundAuthorizedService.transferToBeneficiary(
                        glob.user_a, web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should successfully transfer', async () => {
                    await web3MockedClientFundAuthorizedService.transferToBeneficiary(
                        glob.user_b, web3MockedBeneficiary.address, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    );

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.be.a('string').that.is.empty;
                    benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                    benefit.currencyCt.should.equal(mocks.address0);
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully stage by deducting from settled', async () => {
                    await web3MockedClientFundAuthorizedService.transferToBeneficiary(
                        glob.user_b, web3MockedBeneficiary.address, 3, web3ERC20.address, 0, '', {gas: 1e6}
                    );

                    (await ethersERC20.allowance(web3ClientFund.address, web3MockedBeneficiary.address))
                        ._bn.should.eq.BN(3);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.be.a('string').that.is.empty;
                    benefit.amount._bn.should.eq.BN(3);
                    benefit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.equal('ERC20');
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3MockedBeneficiary._reset();

                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully stage by deducting from settled', async () => {
                    await web3MockedClientFundAuthorizedService.transferToBeneficiary(
                        glob.user_b, web3MockedBeneficiary.address, 10, web3ERC721.address, 0, '', {gas: 1e6}
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.true;

                });
            });
        });

        describe('seizeBalances()', () => {
            describe('if locked amount is zero', () => {
                beforeEach(async () => {
                    await web3MockedWalletLocker._setLockedAmount(0);
                });

                it('should revert', async () => {
                    web3ClientFund.seizeBalances(
                        glob.user_a, mocks.address0, 0, '', {from: glob.user_c, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('of ETH', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, web3.toWei(1.4, 'ether'), mocks.address0, 0,
                        '', await provider.getBlockNumber(), {gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    );
                    await web3MockedWalletLocker._setLockedAmount(web3.toWei(0.5, 'ether'));
                });

                it('should successfully seize balances', async () => {
                    const result = await web3ClientFund.seizeBalances(
                        glob.user_a, mocks.address0, 0, '', {from: glob.user_b, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SeizeBalancesEvent');

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.3')._bn);

                    (await ethersBalanceTracker.get(glob.user_b, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_b, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_b, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.5')._bn);
                });
            });

            describe('of ERC721', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.updateSettledBalance(
                        glob.user_a, 10, web3ERC721.address, 0,
                        '', await provider.getBlockNumber(), {gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, 10, web3ERC721.address, 0, '', {gas: 1e6}
                    );
                    await web3MockedWalletLocker._setLockedIdsCount(1);
                    await web3MockedWalletLocker._setLockedIdsByIndices([10]);
                });

                it('should successfully seize balances', async () => {
                    const result = await web3ClientFund.seizeBalances(
                        glob.user_a, web3ERC721.address, 0, '', {from: glob.user_b, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SeizeBalancesEvent');

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;

                    (await ethersBalanceTracker.hasId(glob.user_b, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_b, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_b, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.true;
                });
            });
        });

        describe('seizedWallets()', () => {
            describe('if called before seizure', () => {
                it('should revert', async () => {
                    ethersClientFund.seizedWallets(0).should.be.rejected;
                });
            });

            describe('if non-zero amount is locked', () => {
                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedWalletLocker._setLockedAmount(web3.toWei(0.3, 'ether'));
                    await web3ClientFund.seizeBalances(
                        glob.user_a, mocks.address0, 0, '', {from: glob.user_b, gas: 1e6}
                    )
                });

                it('should successfully return seized wallets', async () => {
                    (await ethersClientFund.seizedWallets(0))
                        .should.equal(utils.getAddress(glob.user_a));
                })
            });
        });

        describe('withdraw()', () => {
            beforeEach(async () => {
                await web3MockedWalletLocker._reset();
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    web3ClientFund.withdraw(
                        web3.toWei(-0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('sender\'s wallet is locked', () => {
                beforeEach(async () => {
                    await web3MockedWalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    web3ClientFund.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let balanceBefore;

                beforeEach(async () => {
                    await web3ClientFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedClientFundAuthorizedService.stage(
                        glob.user_a, web3.toWei(0.3, 'ether'), mocks.address0, 0, '', {gas: 1e6}
                    );

                    balanceBefore = await provider.getBalance(glob.user_a)._bn;
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    );

                    (await ethersBalanceTracker.get(glob.user_a, depositedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.7')._bn);
                    (await ethersBalanceTracker.get(glob.user_a, settledBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_a, stagedBalanceType, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.1')._bn);

                    (await provider.getBalance(glob.user_a))._bn.should.be.gt.BN(balanceBefore);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_b, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_b, 3, web3ERC20.address, 0, '', {gasLimit: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_b}
                    );

                    (await ethersBalanceTracker.get(glob.user_b, depositedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(7);
                    (await ethersBalanceTracker.get(glob.user_b, settledBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersBalanceTracker.get(glob.user_b, stagedBalanceType, web3ERC20.address, 0))
                        ._bn.should.eq.BN(1);

                    (await ethersERC20.balanceOf(glob.user_b))._bn.should.eq.BN(2);
                });
            });

            describe('of ERC721 token', () => {
                beforeEach(async () => {
                    await web3ERC721.approve(
                        web3ClientFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3ClientFund.receiveTokensTo(
                        glob.user_b, '', 10, web3ERC721.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedClientFundAuthorizedService.stage(
                        glob.user_b, 10, web3ERC721.address, 0, '', {gasLimit: 1e6}
                    );
                });

                it('should successfully unstage', async () => {
                    await web3ClientFund.withdraw(
                        10, web3ERC721.address, 0, '', {from: glob.user_b}
                    );

                    (await ethersBalanceTracker.hasId(glob.user_a, depositedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, settledBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                    (await ethersBalanceTracker.hasId(glob.user_a, stagedBalanceType, 10, web3ERC721.address, 0))
                        .should.be.false;
                });
            });
        });

        describe('claimRevenue', () => {
            let balanceType;

            beforeEach(async () => {
                balanceType = await web3BalanceTracker.DEPOSITED_BALANCE_TYPE();
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3ClientFund.claimRevenue(
                        glob.user_a, balanceType, mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3ClientFund.claimRevenue(
                        glob.user_a, balanceType, mocks.address0, 0, ''
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimRevenueEvent');

                    const claimTransfer = await ethersMockedTokenHolderRevenueFund._getClaimTransfer(0);
                    claimTransfer.beneficiary.should.equal(utils.getAddress(ethersClientFund.address));
                    claimTransfer.destWallet.should.equal(utils.getAddress(glob.user_a))
                    claimTransfer.balanceType.should.equal(balanceType);
                    claimTransfer.currencyCt.should.equal(mocks.address0);
                    claimTransfer.currencyId._bn.should.eq.BN(0);
                    claimTransfer.standard.should.be.a('string').that.is.empty;
                });
            });
        });
    });
};
