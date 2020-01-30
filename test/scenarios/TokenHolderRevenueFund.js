const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const MockedTokenHolderRevenueFundService = artifacts.require('MockedTokenHolderRevenueFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedRevenueTokenManager = artifacts.require('MockedRevenueTokenManager');
const MockedBalanceAucCalculator = artifacts.require('MockedBalanceAucCalculator');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('TokenHolderRevenueFund', function () {
        let provider;
        let web3ERC20TransferController;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3TokenHolderRevenueFund, ethersTokenHolderRevenueFund;
        let web3MockedTokenHolderRevenueFundService, ethersMockedTokenHolderRevenueFundService;
        let web3MockedBeneficiary, ethersMockedBeneficiary;
        let web3MockedRevenueTokenManager, ethersMockedRevenueTokenManager;
        let web3MockedBalanceBlocksCalculator, ethersMockedBalanceBlocksCalculator;
        let web3MockedReleasedAmountBlocksCalculator, ethersMockedReleasedAmountBlocksCalculator;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3ERC20TransferController = await ERC20TransferController.new();

            web3TransferControllerManager = await TransferControllerManager.new(glob.owner);
            await web3TransferControllerManager.registerTransferController('ERC20', web3ERC20TransferController.address);

            web3MockedTokenHolderRevenueFundService = await MockedTokenHolderRevenueFundService.new();
            ethersMockedTokenHolderRevenueFundService = new Contract(web3MockedTokenHolderRevenueFundService.address, MockedTokenHolderRevenueFundService.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3MockedRevenueTokenManager = await MockedRevenueTokenManager.new();
            ethersMockedRevenueTokenManager = new Contract(web3MockedRevenueTokenManager.address, MockedRevenueTokenManager.abi, glob.signer_owner);
            web3MockedBalanceBlocksCalculator = await MockedBalanceAucCalculator.new();
            ethersMockedBalanceBlocksCalculator = new Contract(web3MockedBalanceBlocksCalculator.address, MockedBalanceAucCalculator.abi, glob.signer_owner);
            web3MockedReleasedAmountBlocksCalculator = await MockedBalanceAucCalculator.new();
            ethersMockedReleasedAmountBlocksCalculator = new Contract(web3MockedReleasedAmountBlocksCalculator.address, MockedBalanceAucCalculator.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);
            web3TokenHolderRevenueFund = await TokenHolderRevenueFund.new(glob.owner);
            ethersTokenHolderRevenueFund = new Contract(web3TokenHolderRevenueFund.address, TokenHolderRevenueFund.abi, glob.signer_owner);

            await web3TokenHolderRevenueFund.setTransferControllerManager(web3TransferControllerManager.address);
            await web3TokenHolderRevenueFund.setRevenueTokenManager(web3MockedRevenueTokenManager.address);
            await web3TokenHolderRevenueFund.setBalanceBlocksCalculator(web3MockedBalanceBlocksCalculator.address);
            await web3TokenHolderRevenueFund.setReleasedAmountBlocksCalculator(web3MockedReleasedAmountBlocksCalculator.address);
            await web3TokenHolderRevenueFund.registerService(web3MockedTokenHolderRevenueFundService.address);
            await web3TokenHolderRevenueFund.enableServiceAction(web3MockedTokenHolderRevenueFundService.address,
                await web3TokenHolderRevenueFund.CLOSE_ACCRUAL_PERIOD_ACTION.call());

            await web3MockedTokenHolderRevenueFundService.setTokenHolderRevenueFund(web3TokenHolderRevenueFund.address);

            await web3MockedRevenueTokenManager._setToken(web3ERC20.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3TokenHolderRevenueFund.deployer.call()).should.equal(glob.owner);
                (await web3TokenHolderRevenueFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('revenueTokenManager()', () => {
            it('should return initial value', async () => {
                (await web3TokenHolderRevenueFund.revenueTokenManager.call())
                    .should.equal(web3MockedRevenueTokenManager.address);
            });
        });

        describe('balanceBlocksCalculator()', () => {
            it('should equal value initialized', async () => {
                (await web3TokenHolderRevenueFund.balanceBlocksCalculator.call())
                    .should.equal(web3MockedBalanceBlocksCalculator.address);
            });
        });

        describe('releasedAmountBlocksCalculator()', () => {
            it('should equal value initialized', async () => {
                (await web3TokenHolderRevenueFund.releasedAmountBlocksCalculator.call())
                    .should.equal(web3MockedReleasedAmountBlocksCalculator.address);
            });
        });

        describe('maxClaimedBlockNumberByWalletCurrencyAccrual()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenHolderRevenueFund.maxClaimedBlockNumberByWalletCurrencyAccrual(
                    glob.user_a, mocks.address0, 0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('claimBlockNumberBatchSize()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenHolderRevenueFund.claimBlockNumberBatchSize())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setRevenueTokenManager()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setRevenueTokenManager(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setBalanceBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let revenueTokenManager;

                beforeEach(() => {
                    revenueTokenManager = Wallet.createRandom().address;
                });

                it('should successfully set revenue token manager', async () => {
                    const result = await web3TokenHolderRevenueFund.setRevenueTokenManager(revenueTokenManager);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueTokenManagerEvent');

                    (await ethersTokenHolderRevenueFund.revenueTokenManager.call())
                        .should.equal(revenueTokenManager);
                });
            });
        });

        describe('setBalanceBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setBalanceBlocksCalculator(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setBalanceBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculator;

                beforeEach(async () => {
                    calculator = Wallet.createRandom().address;
                });

                it('should successfully set the balance blocks calculator', async () => {
                    const result = await web3TokenHolderRevenueFund.setBalanceBlocksCalculator(calculator);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceBlocksCalculatorEvent');

                    (await ethersTokenHolderRevenueFund.balanceBlocksCalculator())
                        .should.equal(calculator);
                });
            });
        });

        describe('setReleasedAmountBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setReleasedAmountBlocksCalculator(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setReleasedAmountBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculator;

                beforeEach(async () => {
                    calculator = Wallet.createRandom().address;
                });

                it('should successfully set the released amount blocks calculator', async () => {
                    const result = await web3TokenHolderRevenueFund.setReleasedAmountBlocksCalculator(calculator);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleasedAmountBlocksCalculatorEvent');

                    (await ethersTokenHolderRevenueFund.releasedAmountBlocksCalculator())
                        .should.equal(calculator);
                });
            });
        });

        describe('setClaimBlockNumberBatchSize()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setClaimBlockNumberBatchSize(
                        1000, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set the claim by block', async () => {
                    const result = await web3TokenHolderRevenueFund.setClaimBlockNumberBatchSize(1000);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClaimBlockNumberBatchSizeEvent');

                    (await ethersTokenHolderRevenueFund.claimBlockNumberBatchSize())
                        ._bn.should.eq.BN(1000);
                });
            });
        });

        describe('nonClaimersCount()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.nonClaimersCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isNonClaimer()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.isNonClaimer(Wallet.createRandom().address))
                    .should.be.false;
            });
        });

        describe('registerNonClaimer()', () => {
            let nonClaimer;

            beforeEach(() => {
                nonClaimer = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.registerNonClaimer(nonClaimer, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should successfully add non-claimer and emit event', async () => {
                    const result = await web3TokenHolderRevenueFund.registerNonClaimer(nonClaimer);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('RegisterNonClaimerEvent');

                    (await ethersTokenHolderRevenueFund.nonClaimersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersTokenHolderRevenueFund.isNonClaimer(nonClaimer))
                        .should.be.true;
                });
            });
        });

        describe('deregisterNonClaimer()', () => {
            let nonClaimer;

            beforeEach(async () => {
                nonClaimer = Wallet.createRandom().address;

                await web3TokenHolderRevenueFund.registerNonClaimer(nonClaimer);
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.deregisterNonClaimer(nonClaimer, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should successfully add non-claimer and emit event', async () => {
                    const result = await web3TokenHolderRevenueFund.deregisterNonClaimer(nonClaimer);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('DeregisterNonClaimerEvent');

                    (await ethersTokenHolderRevenueFund.nonClaimersCount())
                        ._bn.should.eq.BN(0);
                    (await ethersTokenHolderRevenueFund.isNonClaimer(nonClaimer))
                        .should.be.false;
                });
            });
        });

        describe('periodAccrualBalance()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.periodAccrualBalance(mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('aggregateAccrualBalance()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('stagedBalance()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('periodCurrenciesCount()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.periodCurrenciesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('aggregateCurrenciesCount()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.aggregateCurrenciesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('fallback function', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3TokenHolderRevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersTokenHolderRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3TokenHolderRevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });
                });

                it('should add on top of the first deposit', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3TokenHolderRevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersTokenHolderRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveEthersTo()', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    const result = await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ReceiveEvent');

                    (await ethersTokenHolderRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );
                });

                it('should add on top of the first deposit', async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersTokenHolderRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveTokens()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokens('', 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokens('', 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3TokenHolderRevenueFund.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokens('', 9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3TokenHolderRevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);

                        (await ethersERC20.balanceOf(ethersTokenHolderRevenueFund.address))._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3TokenHolderRevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                        (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);

                        (await ethersERC20.balanceOf(ethersTokenHolderRevenueFund.address))._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('receiveTokensTo()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 0, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3TokenHolderRevenueFund.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 9999, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);

                        (await ethersERC20.balanceOf(ethersTokenHolderRevenueFund.address))._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                        (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);

                        (await ethersERC20.balanceOf(ethersTokenHolderRevenueFund.address))._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('periodCurrenciesByIndices()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.periodCurrenciesByIndices.call(0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersTokenHolderRevenueFund.periodCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(mocks.address0);
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersTokenHolderRevenueFund.periodCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(utils.getAddress(web3ERC20.address));
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });
        });

        describe('aggregateCurrenciesByIndices()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.aggregateCurrenciesByIndices.call(0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersTokenHolderRevenueFund.aggregateCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(mocks.address0);
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersTokenHolderRevenueFund.aggregateCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(utils.getAddress(web3ERC20.address));
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });
        });

        describe('closedAccrualsCount()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.closedAccrualsCount(
                        mocks.address0, 0
                    ))._bn.should.eq.BN(0);
                });
            });
        });

        describe('closeAccrualPeriod()', () => {
            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.closeAccrualPeriod([]).should.be.rejected;
                });
            });

            describe('if called by enabled service action', () => {
                let accruals;

                beforeEach(async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );
                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    accruals = [
                        {currency: {ct: mocks.address0, id: 0}, amount: utils.parseEther('1')},
                        {currency: {ct: web3ERC20.address, id: 0}, amount: utils.bigNumberify(10)}
                    ];
                });

                it('should successfully close accrual period of given currencies', async () => {
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        accruals.map(a => a.currency), {gasLimit: 1e6}
                    );

                    const blockNumber = await provider.getBlockNumber();

                    for (let accrual of accruals) {
                        (await ethersTokenHolderRevenueFund.closedAccrualsCount(
                            accrual.currency.ct, accrual.currency.id
                        ))._bn.should.eq.BN(1);

                        const closedAccrual = await ethersTokenHolderRevenueFund.closedAccrualsByCurrency(
                            accrual.currency.ct, accrual.currency.id, 0
                        );
                        closedAccrual.startBlock._bn.should.eq.BN(0);
                        closedAccrual.endBlock._bn.should.eq.BN(blockNumber);
                        closedAccrual.amount._bn.should.eq.BN(accrual.amount._bn);

                        (await ethersTokenHolderRevenueFund.aggregateAccrualAmountByCurrencyBlockNumber(
                            accrual.currency.ct, accrual.currency.id, blockNumber
                        ))._bn.should.eq.BN((await ethersTokenHolderRevenueFund.aggregateAccrualBalance(
                            accrual.currency.ct, accrual.currency.id
                        ))._bn);

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(
                            accrual.currency.ct, accrual.currency.id
                        ))._bn.should.eq.BN(0);
                    }
                });
            });
        });

        describe('closedAccrualIndexByBlockNumber()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.closedAccrualIndexByBlockNumber(
                        mocks.address0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the accrual index', async () => {
                    (await ethersTokenHolderRevenueFund.closedAccrualIndexByBlockNumber(
                        web3ERC20.address, 0, blockNumber - 2
                    ))._bn.should.eq.BN(0);
                    (await ethersTokenHolderRevenueFund.closedAccrualIndexByBlockNumber(
                        web3ERC20.address, 0, blockNumber
                    ))._bn.should.eq.BN(1);
                });
            });
        });

        describe('claimableAmountByAccruals()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, mocks.address0, 0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, mocks.address0, 0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with wrong index parameter ordinality', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 1, 0
                    ).should.be.rejected;
                });
            });

            describe('if called with exact accrual indices', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    ))._bn.should.eq.BN(9);
                });
            });

            describe('if called with overrunning accrual indices', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 10, 20
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with non-claimer registered', () => {
                let nonClaimer;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    nonClaimer = Wallet.createRandom().address;

                    await web3TokenHolderRevenueFund.registerNonClaimer(nonClaimer);

                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, nonClaimer, 8000
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    ))._bn.should.eq.BN(45);
                });
            });
        });

        describe('claimableAmountByBlockNumbers()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, mocks.address0, 0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, mocks.address0, 0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with wrong block number parameter ordinality', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 1, 0
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers strictly within the block span of one accrual', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 1, blockNumber - 1
                    ))._bn.should.eq.BN(2);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of one accrual', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber
                    ))._bn.should.eq.BN(3);
                });
            });

            describe('if called with end block number beyond the block span of one accrual', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber + 1
                    ))._bn.should.eq.BN(3);
                });
            });

            describe('if called with block numbers strictly within the block span of two accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 1, blockNumber - 1
                    ))._bn.should.eq.BN(7);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of two accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber
                    ))._bn.should.eq.BN(9);
                });
            });

            describe('if called with end block number beyond the block span of two accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber + 1
                    ))._bn.should.eq.BN(9);
                });
            });

            describe('if called with block numbers strictly within the block span of three accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 1, blockNumber - 1
                    ))._bn.should.eq.BN(16);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of three accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber
                    ))._bn.should.eq.BN(18);
                });
            });

            describe('if called with end block number beyond the block span of three accruals', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, 0, blockNumber + 1
                    ))._bn.should.eq.BN(18);
                });
            });

            describe('if called with a one block span from start of accrual period', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = (await provider.getBlockNumber()) + 1;

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, blockNumber, blockNumber
                    ))._bn.should.eq.BN(4);
                });
            });

            describe('if called with a one block span from center of accrual period', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, blockNumber, blockNumber
                    ))._bn.should.eq.BN(4);
                });
            });

            describe('if called with a one block span from end of accrual period', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the claimable amount', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0, blockNumber, blockNumber
                    ))._bn.should.eq.BN(4);
                });
            });
        });

        describe('claimAndTransferToBeneficiaryByAccruals()', () => {
            let filter;

            beforeEach(async () => {
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersTokenHolderRevenueFund.interface.events['ClaimAndTransferToBeneficiaryByAccrualsEvent'].topics
                };
            });

            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByAccruals(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByAccruals(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer', async () => {
                        await ethersTokenHolderRevenueFund
                            .connect(glob.signer_a)
                            .claimAndTransferToBeneficiaryByAccruals(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, 0, 0, '', {gasLimit: 1e6}
                            );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });

                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 10,
                            {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '',
                            {from: glob.user_a, gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                        );
                    });

                    it('should successfully claim and transfer', async () => {
                        await ethersTokenHolderRevenueFund
                            .connect(glob.signer_a)
                            .claimAndTransferToBeneficiaryByAccruals(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, 0, 0, '', {gasLimit: 1e6}
                            );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(3);
                    });
                });
            });
        });

        describe('claimAndTransferToBeneficiaryByBlockNumbers()', () => {
            let filter;

            beforeEach(async () => {
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersTokenHolderRevenueFund.interface.events['ClaimAndTransferToBeneficiaryByBlockNumbersEvent'].topics
                };
            });

            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('if called with wrong block number parameter ordinality', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 1, 0, '', {gasLimit: 1e6}
                        ).should.be.rejected;
                });
            });

            describe('if called with block numbers strictly within the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );
                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 1, blockNumber - 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber + 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers strictly within the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 1, blockNumber - 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber + 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers strictly within the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 1, blockNumber - 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, 0, blockNumber + 1, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from start of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = (await provider.getBlockNumber()) + 1;

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, blockNumber, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from center of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, blockNumber, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from end of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            ethersERC20.address, 0, blockNumber, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);
                    benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with Ethers', () => {
                let blockNumber, claimableAmount, balanceBefore;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersMockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, mocks.address0, 0, 0, blockNumber
                    );

                    balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                });

                it('should successfully claim and transfer', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByBlockNumbers(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 0, blockNumber, '', {gasLimit: 1e6}
                        );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const benefit = await ethersMockedBeneficiary._getBenefit(0);
                    benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                    benefit.balanceType.should.equal('staged');
                    benefit.amount._bn.should.eq.BN(claimableAmount._bn);

                    benefit.currencyCt.should.equal(mocks.address0);
                    benefit.currencyId._bn.should.eq.BN(0);
                    benefit.standard.should.be.a('string').that.is.empty;

                    (await provider.getBalance(ethersMockedBeneficiary.address))
                        ._bn.should.be.gt.BN(balanceBefore);
                });
            });
        });

        describe('claimAndTransferToBeneficiary()', () => {
            let filter;

            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                        .claimAndTransferToBeneficiary(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, ''
                        ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                        .claimAndTransferToBeneficiary(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, ''
                        ).should.be.rejected;
                });
            });

            describe('with claim by block number batch size equal to 0', () => {
                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersTokenHolderRevenueFund.interface.events['ClaimAndTransferToBeneficiaryByAccrualsEvent'].topics
                    };
                });

                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(2, 'ether'), gas: 1e6}
                        );
                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, '', {gasLimit: 1e6}
                            );

                        let logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        let benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(1);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.6')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });

                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 10,
                            {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '',
                            {from: glob.user_a, gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                        );

                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 20,
                            {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 20, web3ERC20.address, 0, '',
                            {from: glob.user_a, gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                        );
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, '', {gasLimit: 1e6}
                            );

                        let logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        let benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(3);

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(1);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(6);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(6);
                    });
                });
            });

            describe('with claim by block number batch size greater than 0', () => {
                let firstBlockNumber, secondBlockNumber;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersTokenHolderRevenueFund.interface.events['ClaimAndTransferToBeneficiaryByBlockNumbersEvent'].topics
                    };
                });

                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        firstBlockNumber = await provider.getBlockNumber();

                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(2, 'ether'), gas: 1e6}
                        );
                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        secondBlockNumber = await provider.getBlockNumber();

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer by block numbers', async () => {
                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(firstBlockNumber + 1);

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, '', {gasLimit: 1e6}
                            );

                        let logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        let benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(
                            utils.bigNumberify(secondBlockNumber).sub(firstBlockNumber).div(2)
                        );

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(1);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(
                            utils.bigNumberify(secondBlockNumber).sub(firstBlockNumber)
                        );

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                mocks.address0, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(2);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                        benefit.currencyCt.should.equal(mocks.address0);
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });

                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3ERC20.address, glob.user_a, 3000
                        );
                        await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                            web3MockedRevenueTokenManager.address, mocks.address0, 10000
                        );

                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 10,
                            {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '',
                            {from: glob.user_a, gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                        );

                        firstBlockNumber = await provider.getBlockNumber();

                        await web3ERC20.approve(
                            web3TokenHolderRevenueFund.address, 20,
                            {from: glob.user_a, gas: 1e6}
                        );
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 20, web3ERC20.address, 0, '',
                            {from: glob.user_a, gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                        );

                        secondBlockNumber = await provider.getBlockNumber();
                    });

                    it('should successfully claim and transfer by block numbers', async () => {
                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(firstBlockNumber + 1);

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, '', {gasLimit: 1e6}
                            );

                        let logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        let benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(3);

                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(
                            utils.bigNumberify(secondBlockNumber).sub(firstBlockNumber).div(2)
                        );

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(1);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(2);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(2);

                        await ethersTokenHolderRevenueFund.setClaimBlockNumberBatchSize(
                            utils.bigNumberify(secondBlockNumber).sub(firstBlockNumber)
                        );

                        await ethersTokenHolderRevenueFund.connect(glob.signer_a)
                            .claimAndTransferToBeneficiary(
                                ethersMockedBeneficiary.address, glob.user_b, 'staged',
                                ethersERC20.address, 0, '', {gasLimit: 1e6}
                            );

                        logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        benefit = await ethersMockedBeneficiary._getBenefit(2);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(4);
                        benefit.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(4);
                    });
                });
            });
        });

        describe('claimAndStageByAccruals()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        mocks.address0, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        mocks.address0, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with exact accrual indices', () => {
                let claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByAccrualsEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with overrunning accrual indices', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 10, 20, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').that.is.empty;

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if called with wrong index parameter ordinality', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 1, 0, {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });
        });

        describe('claimAndStageByBlockNumbers()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersTokenHolderRevenueFund.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        mocks.address0, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        mocks.address0, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with wrong block number parameter ordinality', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: web3ERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        mocks.address0, 0, 1, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers strictly within the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of one accrual', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber + 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers strictly within the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of two accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber + 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers strictly within the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 1, blockNumber - 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers exactly overlapping the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with end block number beyond the block span of three accruals', () => {
                let blockNumber, claimableAmount;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 60,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 10; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 30, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, 0, blockNumber + 1
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 0, blockNumber + 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from start of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = (await provider.getBlockNumber()) + 1;

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, blockNumber, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from center of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, blockNumber, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with a one-block span from end of accrual period', () => {
                let claimableAmount, blockNumber;

                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 10000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    for (let i = 0; i < 3; i++)
                        await provider.send('evm_mine');

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 20, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();

                    claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, ethersERC20.address, 0, blockNumber, blockNumber
                    );
                });

                it('should return the claimable amount', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, blockNumber, blockNumber, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });
        });

        describe('fullyClaimed()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.fullyClaimed(
                        glob.user_a, mocks.address0, 0, 0
                    )).should.be.false;
                });
            });

            describe('if called before accrual has been claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.fullyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.false;
                });
            });

            describe('if called after accrual has been fully claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersTokenHolderRevenueFund.fullyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.true;
                });
            });

            describe('if called after accrual has been partially claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    const blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.fullyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.false;
                });
            });
        });

        describe('partiallyClaimed()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.partiallyClaimed(
                        glob.user_a, mocks.address0, 0, 0
                    )).should.be.false;
                });
            });

            describe('if called before accrual has been claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.partiallyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.false;
                });
            });

            describe('if called after accrual has been fully claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.partiallyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.false;
                });
            });

            describe('if called after accrual has been partially claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    const blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.partiallyClaimed(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.true;
                });
            });
        });

        describe('claimedBlockSpans()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        glob.user_a, mocks.address0, 0, 0
                    )).should.be.an('array').that.is.empty;
                });
            });

            describe('if called before accrual has been claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.an('array').that.is.empty;
                });
            });

            describe('if called after accrual has been fully claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.an('array').that.is.empty;
                });
            });

            describe('if called after accrual has been partially claimed', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 30,
                        {from: glob.user_a, gas: 1e6}
                    );

                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    const blockNumber = await provider.getBlockNumber();

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, 1, blockNumber - 1, {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        glob.user_a, ethersERC20.address, 0, 0
                    )).should.be.an('array').and.have.lengthOf(1);
                });
            });
        });

        describe('withdraw()', () => {
            describe('if called with amount that is not strictly positive', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.withdraw(
                        -10, mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        ethersERC20.address, glob.user_b, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );

                    await web3ERC20.approve(
                        web3TokenHolderRevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );
                    await web3TokenHolderRevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                        [{ct: ethersERC20.address, id: 0}], {gasLimit: 1e6}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_b, gas: 1e6}
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_b, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('WithdrawEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_b, ethersERC20.address, 0))
                        ._bn.should.eq.BN(1);

                    (await ethersERC20.balanceOf(glob.user_b))._bn.should.eq.BN(2);
                });
            });
        });
    });
};
