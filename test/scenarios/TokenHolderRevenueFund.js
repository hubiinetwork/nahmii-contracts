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
const MockedClaimableAmountCalculator = artifacts.require('MockedClaimableAmountCalculator');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('TokenHolderRevenueFund', function () {
        let provider;
        let accruals;
        let web3ERC20TransferController;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3TokenHolderRevenueFund, ethersTokenHolderRevenueFund;
        let web3MockedTokenHolderRevenueFundService, ethersMockedTokenHolderRevenueFundService;
        let web3MockedBeneficiary, ethersMockedBeneficiary;
        let web3MockedClaimableAmountCalculator, ethersMockedClaimableAmountCalculator;
        let baselineBlockNumber;

        async function closeAndLogAccrual(accrualAmount, claimableAmount, currency, steps) {
            let accrualAmountBN, claimableAmountBN;

            if (mocks.address0 === currency.ct) {
                accrualAmountBN = utils.parseEther(`${accrualAmount}`);
                claimableAmountBN = utils.parseEther(`${claimableAmount}`);

                await ethersTokenHolderRevenueFund
                    .connect(glob.signer_a)
                    .receiveEthersTo(
                        glob.user_a, '',
                        {value: accrualAmountBN, gasLimit: 1e6}
                    );
            } else {
                accrualAmountBN = utils.parseUnits(`${accrualAmount}`, 15);
                claimableAmountBN = utils.parseUnits(`${claimableAmount}`, 15);

                await ethersERC20
                    .connect(glob.signer_a)
                    .approve(
                        ethersTokenHolderRevenueFund.address,
                        accrualAmountBN,
                        {gasLimit: 1e6}
                    );

                await ethersTokenHolderRevenueFund
                    .connect(glob.signer_a)
                    .receiveTokensTo(
                        glob.user_a,
                        '',
                        accrualAmountBN,
                        currency.ct,
                        currency.id,
                        '',
                        {gasLimit: 1e6}
                    );
            }

            await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                [currency], {gasLimit: 1e6}
            );

            accruals.push({
                startBlock: accruals.length ? accruals[accruals.length - 1].endBlock + 1 : baselineBlockNumber,
                endBlock: await provider.getBlockNumber(),
                amount: accrualAmountBN
            });

            if (steps)
                await Promise.all(steps.map(async (s) =>
                    ethersMockedClaimableAmountCalculator._setCalculate(
                        glob.user_a, accrualAmountBN,
                        accruals[accruals.length - 1].startBlock + s,
                        accruals[accruals.length - 1].startBlock + s,
                        claimableAmountBN
                    )
                ));
            else
                await ethersMockedClaimableAmountCalculator._setCalculate(
                    glob.user_a, accrualAmountBN,
                    accruals[accruals.length - 1].startBlock,
                    accruals[accruals.length - 1].endBlock,
                    claimableAmountBN
                );
        }

        before(async () => {
            provider = glob.signer_owner.provider;

            web3ERC20TransferController = await ERC20TransferController.new();

            web3TransferControllerManager = await TransferControllerManager.new(glob.owner);
            await web3TransferControllerManager.registerTransferController('ERC20', web3ERC20TransferController.address);

            web3MockedTokenHolderRevenueFundService = await MockedTokenHolderRevenueFundService.new();
            ethersMockedTokenHolderRevenueFundService = new Contract(web3MockedTokenHolderRevenueFundService.address, MockedTokenHolderRevenueFundService.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            accruals = [];

            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await ethersERC20.mint(glob.user_a, utils.parseUnits('1000', 15));

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3MockedClaimableAmountCalculator = await MockedClaimableAmountCalculator.new();
            ethersMockedClaimableAmountCalculator = new Contract(web3MockedClaimableAmountCalculator.address, MockedClaimableAmountCalculator.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            web3TokenHolderRevenueFund = await TokenHolderRevenueFund.new(glob.owner);
            ethersTokenHolderRevenueFund = new Contract(web3TokenHolderRevenueFund.address, TokenHolderRevenueFund.abi, glob.signer_owner);

            baselineBlockNumber = await provider.getBlockNumber();

            await web3TokenHolderRevenueFund.setTransferControllerManager(web3TransferControllerManager.address);
            await web3TokenHolderRevenueFund.setClaimableAmountCalculator(web3MockedClaimableAmountCalculator.address);
            await web3TokenHolderRevenueFund.registerService(web3MockedTokenHolderRevenueFundService.address);
            await web3TokenHolderRevenueFund.enableServiceAction(web3MockedTokenHolderRevenueFundService.address,
                await web3TokenHolderRevenueFund.CLOSE_ACCRUAL_PERIOD_ACTION.call());

            await web3MockedTokenHolderRevenueFundService.setTokenHolderRevenueFund(web3TokenHolderRevenueFund.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3TokenHolderRevenueFund.deployer.call()).should.equal(glob.owner);
                (await web3TokenHolderRevenueFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('claimableAmountCalculator()', () => {
            it('should equal value initialized', async () => {
                (await web3TokenHolderRevenueFund.claimableAmountCalculator.call())
                    .should.equal(web3MockedClaimableAmountCalculator.address);
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

        describe('baselineBlockNumber()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenHolderRevenueFund.baselineBlockNumber())
                    ._bn.should.eq.BN(baselineBlockNumber);
            });
        });

        describe('setClaimableAmountCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setClaimableAmountCalculator(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.setClaimableAmountCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculator;

                beforeEach(async () => {
                    calculator = Wallet.createRandom().address;
                });

                it('should successfully set the balance blocks calculator', async () => {
                    const result = await web3TokenHolderRevenueFund.setClaimableAmountCalculator(calculator);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClaimableAmountCalculatorEvent');

                    (await ethersTokenHolderRevenueFund.claimableAmountCalculator())
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
                        await web3TokenHolderRevenueFund.receiveTokens('', 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        await web3TokenHolderRevenueFund.receiveTokens('', 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await ethersERC20
                            .connect(glob.signer_a)
                            .approve(
                                ethersTokenHolderRevenueFund.address,
                                utils.parseUnits('9999', 15),
                                {
                                    gasLimit: 1e6
                                }
                            );
                    });

                    it('should revert', async () => {
                        await ethersTokenHolderRevenueFund
                            .connect(glob.signer_a)
                            .receiveTokens('', utils.parseUnits('9999', 15), ethersERC20.address, 0, '')
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
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 0, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        await web3TokenHolderRevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await ethersERC20
                            .connect(glob.signer_a)
                            .approve(
                                ethersTokenHolderRevenueFund.address,
                                utils.parseUnits('9999', 15),
                                {
                                    gasLimit: 1e6
                                }
                            );
                    });

                    it('should revert', async () => {
                        await ethersTokenHolderRevenueFund
                            .connect(glob.signer_a)
                            .receiveTokensTo(glob.user_a, '', utils.parseUnits('9999', 15), ethersERC20.address, 0, '')
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
                    await web3TokenHolderRevenueFund.periodCurrenciesByIndices.call(0, 0).should.be.rejected;
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
                    await web3TokenHolderRevenueFund.aggregateCurrenciesByIndices.call(0, 0).should.be.rejected;
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
                        closedAccrual.startBlock._bn.should.eq.BN(baselineBlockNumber);
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
                    await ethersTokenHolderRevenueFund.closedAccrualIndexByBlockNumber(
                        mocks.address0, 0, 10
                    ).should.be.rejected;
                });
            });

            describe('if called after an accrual period has been closed', () => {
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
            beforeEach(async () => {
                await closeAndLogAccrual(
                    10, 1, {ct: web3ERC20.address, id: 0}
                );
                await closeAndLogAccrual(
                    20, 2, {ct: web3ERC20.address, id: 0}
                );
            });

            describe('if called with wrong index parameter ordinality', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 1, 0
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(() => {
                    currencyCt = Wallet.createRandom().address;
                })

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, currencyCt, 0, 0, 1
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called by non-claimer wallet', () => {
                beforeEach(async () => {
                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, mocks.address0, 0, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with indices of one accrual only', () => {
                it('should return the claimable amount of the specified accrual', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 0
                    ))._bn.should.eq.BN(utils.parseUnits('1', 15)._bn);
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 1, 1
                    ))._bn.should.eq.BN(utils.parseUnits('2', 15)._bn);
                });
            });

            describe('if called with indices of multiple accruals', () => {
                it('should return the combined claimable amount of the accruals', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    ))._bn.should.eq.BN(utils.parseUnits('3', 15)._bn);
                });
            });

            describe('if called with overrunning end accrual index', () => {
                it('should return the combined claimable amount of only the completed accruals in the range', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 10
                    ))._bn.should.eq.BN(utils.parseUnits('3', 15)._bn);
                });
            });

            describe('if called with overrunning start and end accrual index', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 3, 10
                    ))._bn.should.eq.BN(0);
                });
            });
        });

        describe('claimableAmountByBlockNumbers()', () => {
            beforeEach(async () => {
                await closeAndLogAccrual(
                    10, 1, {ct: web3ERC20.address, id: 0}
                );
                await closeAndLogAccrual(
                    20, 2, {ct: web3ERC20.address, id: 0}
                );
            });

            describe('if called with wrong index parameter ordinality', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[1].startBlock, accruals[0].endBlock
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(() => {
                    currencyCt = Wallet.createRandom().address;
                })

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, currencyCt, 0,
                        accruals[0].startBlock, accruals[1].endBlock
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called by non-claimer wallet', () => {
                beforeEach(async () => {
                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[1].endBlock
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with block numbers underrunning the accrual scope', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock - 2, accruals[0].endBlock - 1
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with block numbers overrunning the accrual scope', () => {
                it('should return 0', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[1].startBlock + 1, accruals[1].endBlock + 2
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called with block numbers spanning one accrual', () => {
                it('should return the claimable amount of the specified accrual', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[0].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('1', 15)._bn);
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[1].startBlock, accruals[1].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('2', 15)._bn);
                });
            });

            describe('if called with block numbers spanning two accruals', () => {
                it('should return the combined claimable amount of the specified accruals', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[1].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('3', 15)._bn);
                });
            });

            describe('if called with block numbers spanning three accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        30, 3, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the combined claimable amount of the specified accruals', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[2].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('6', 15)._bn);
                });
            });

            describe('if called with block numbers spanning ten accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        30, 3, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        40, 4, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        50, 5, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        60, 6, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        70, 7, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        80, 8, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        90, 9, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        100, 10, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the combined claimable amount of the specified accruals', async () => {
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[4].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('15', 15)._bn);
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[5].startBlock, accruals[9].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('40', 15)._bn);
                    (await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[9].endBlock
                    ))._bn.should.eq.BN(utils.parseUnits('55', 15)._bn);
                });
            });
        });

        describe('claimAndStageByAccruals()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        currencyCt, 0, 0, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with wrong index parameter ordinality', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 1, 0, {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with indices of one accrual only', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim and stage the claimable amount of the specified accrual', async () => {
                    let claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 0
                    );
                    claimableAmount._bn.should.not.be.zero;

                    let result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByAccrualsEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);

                    claimableAmount = claimableAmount.add(await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 1, 1
                    ));
                    claimableAmount._bn.should.not.be.zero;

                    result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 1, 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByAccrualsEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with indices of multiple accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim and stage the combined claimable amount of the accruals', async () => {
                    const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    );
                    claimableAmount._bn.should.not.be.zero;

                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 1, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByAccrualsEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with overrunning end accrual index', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim and stage the combined claimable amount of only the completed accruals in the range', async () => {
                    const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                        glob.user_a, web3ERC20.address, 0, 0, 1
                    );
                    claimableAmount._bn.should.not.be.zero;

                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 10, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByAccrualsEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with overrunning start and end accrual index', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim and stage 0', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 2, 10, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').that.is.empty;

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if called with claimable amount of 0', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 0, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim 0 but not stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').that.is.empty;

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('claimAndStageByBlockNumbers()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[1].endBlock,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with wrong block number argument ordinality', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[1].startBlock, accruals[0].endBlock,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        currencyCt, 0, accruals[0].startBlock, accruals[1].endBlock,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers underrunning the accrual scope', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        currencyCt, 0, accruals[0].startBlock - 2, accruals[0].startBlock - 1,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers overrunning the accrual scope', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        currencyCt, 0, accruals[1].startBlock + 1, accruals[1].startBlock + 2,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers spanning one accrual', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the claimable amount of the specified accrual', async () => {
                    let claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[0].endBlock
                    );
                    claimableAmount._bn.should.not.be.zero;

                    let result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[0].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);

                    claimableAmount = claimableAmount.add(await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[1].startBlock, accruals[1].endBlock
                    ));
                    claimableAmount._bn.should.not.be.zero;

                    result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[1].startBlock, accruals[1].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers spanning two accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the combined claimable amount of the specified accruals', async () => {
                    const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[1].endBlock
                    );
                    claimableAmount._bn.should.not.be.zero;

                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[1].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers spanning three accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        30, 3, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the combined claimable amount of the specified accruals', async () => {
                    const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[2].endBlock
                    );
                    claimableAmount._bn.should.not.be.zero;

                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[2].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with block numbers spanning ten accruals', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        30, 3, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        40, 4, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        50, 5, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        60, 6, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        70, 7, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        80, 8, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        90, 9, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        100, 10, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('should return the combined claimable amount of the specified accruals', async () => {
                    const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                        glob.user_a, web3ERC20.address, 0,
                        accruals[0].startBlock, accruals[9].endBlock
                    );
                    claimableAmount._bn.should.not.be.zero;

                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[9].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageByBlockNumbersEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(claimableAmount._bn);
                });
            });

            describe('if called with claimable amount of 0', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 0, {ct: web3ERC20.address, id: 0}
                    );
                });

                it('claim 0 but not stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[0].endBlock,
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').that.is.empty;

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

        });

        describe('claimAndTransferToBeneficiaryByAccruals()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );

                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByAccruals(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund
                        .connect(glob.signer_a)
                        .claimAndTransferToBeneficiaryByAccruals(
                            ethersMockedBeneficiary.address, glob.user_b, 'staged',
                            currencyCt, 0, 0, 0, ''
                        )
                        .should.be.rejected;
                });
            });

            describe('of ERC20 token', () => {
                describe('if called with indices of one accrual only', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('claim and stage the claimable amount of the specified accrual', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, web3ERC20.address, 0, 0, 0
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        const benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount0._bn);

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, web3ERC20.address, 0, 1, 1
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 1, 1, '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        const benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount1._bn);
                    });
                });

                describe('if called with indices of multiple accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('claim and stage the combined claimable amount of the accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, web3ERC20.address, 0, 0, 1
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 0, 1, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

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

                describe('if called with overrunning end accrual index', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('claim and stage the combined claimable amount of only the completed accruals in the range', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, web3ERC20.address, 0, 0, 1
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 0, 10, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

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

                describe('if called with overrunning start and end accrual index', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('neither claim 0 nor transfer ', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 2, 10, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, web3ERC20.address, 0, 2))
                            .should.be.false;
                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, web3ERC20.address, 0, 10))
                            .should.be.false;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('if called with claimable amount of 0', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 0, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('claim 0 but not transfer ', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, 0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, web3ERC20.address, 0, 0))
                            .should.be.true;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });
            });

            describe('of Ether', () => {
                let balanceBefore;

                beforeEach(async () => {
                    balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                });

                describe('if called with indices of one accrual only', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('claim and stage the claimable amount of the specified accrual', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 0, 0
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        const benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(mocks.address0);
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 1, 1
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 1, 1, '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        const benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(mocks.address0);
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });

                describe('if called with indices of multiple accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('claim and stage the combined claimable amount of the accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 0, 1
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 0, 1, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

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

                describe('if called with overrunning end accrual index', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('claim and stage the combined claimable amount of only the completed accruals in the range', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 0, 1
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 0, 10, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

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

                describe('if called with overrunning start and end accrual index', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('neither claim 0 nor transfer ', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 2, 10, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, mocks.address0, 0, 2))
                            .should.be.false;
                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, mocks.address0, 0, 10))
                            .should.be.false;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });

                describe('if called with claimable amount of 0', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 0, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('claim 0 but not transfer ', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByAccruals(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, 0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(glob.user_a, mocks.address0, 0, 0))
                            .should.be.true;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('claimAndTransferToBeneficiaryByBlockNumbers()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                        ethersMockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                        web3MockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, 0, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wrong block number argument ordinality', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: mocks.address0, id: 0}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                        web3MockedBeneficiary.address, glob.user_b, 'staged',
                        mocks.address0, 0, 1, 0, '', {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers underrunning the accrual scope', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: mocks.address0, id: 0}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                        mocks.address0, 0, accruals[0].startBlock - 2, accruals[0].startBlock - 1,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block numbers overrunning the accrual scope', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: mocks.address0, id: 0}
                    );
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                        mocks.address0, 0, accruals[0].startBlock + 1, accruals[0].startBlock + 2,
                        {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('of ERC20 token', () => {
                describe('if called with block numbers spanning one accrual', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('should return the claimable amount of the specified accrual', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, web3ERC20.address, 0,
                            accruals[0].startBlock, accruals[0].endBlock
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0,
                            accruals[0].startBlock, accruals[0].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        const benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount0._bn);

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, web3ERC20.address, 0,
                            accruals[1].startBlock, accruals[1].endBlock
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0,
                            accruals[1].startBlock, accruals[1].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        const benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount1._bn);
                    });
                });

                describe('if called with block numbers spanning two accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the included accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, web3ERC20.address, 0,
                            accruals[0].startBlock, accruals[1].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, accruals[0].startBlock, accruals[1].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with block numbers spanning three accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            30, 3, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the specified accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, web3ERC20.address, 0,
                            accruals[0].startBlock, accruals[2].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, accruals[0].startBlock, accruals[2].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with block numbers spanning ten accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            30, 3, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            40, 4, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            50, 5, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            60, 6, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            70, 7, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            80, 8, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            90, 9, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            100, 10, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the specified accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, web3ERC20.address, 0,
                            accruals[0].startBlock, accruals[9].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, accruals[0].startBlock, accruals[9].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with claimable amount of 0', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 0, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('claim 0 but not transfer', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, accruals[0].startBlock, accruals[0].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(glob.user_a, web3ERC20.address, 0, 0))
                            .should.be.true;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });
            });

            describe('of Ether', () => {
                let balanceBefore;

                beforeEach(async () => {
                    balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                });

                describe('if called with block numbers spanning one accrual', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('should return the claimable amount of the specified accrual', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, mocks.address0, 0,
                            accruals[0].startBlock, accruals[0].endBlock
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, accruals[0].startBlock, accruals[0].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        const benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(mocks.address0);
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, mocks.address0, 0,
                            accruals[1].startBlock, accruals[1].endBlock
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0,
                            accruals[1].startBlock, accruals[1].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        const benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(mocks.address0);
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });

                describe('if called with block numbers spanning two accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the included accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, mocks.address0, 0,
                            accruals[0].startBlock, accruals[1].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, accruals[0].startBlock, accruals[1].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with block numbers spanning three accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            30, 3, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the specified accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, mocks.address0, 0,
                            accruals[0].startBlock, accruals[2].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, accruals[0].startBlock, accruals[2].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with block numbers spanning ten accruals', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            30, 3, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            40, 4, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            50, 5, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            60, 6, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            70, 7, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            80, 8, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            90, 9, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            100, 10, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('should return the combined claimable amount of the specified accruals', async () => {
                        const claimableAmount = await ethersTokenHolderRevenueFund.claimableAmountByBlockNumbers(
                            glob.user_a, mocks.address0, 0,
                            accruals[0].startBlock, accruals[9].endBlock
                        );
                        claimableAmount._bn.should.not.be.zero;

                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, accruals[0].startBlock, accruals[9].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

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

                describe('if called with claimable amount of 0', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 0, {ct: mocks.address0, id: 0}
                        );
                    });

                    it('claim 0 but not transfer', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiaryByBlockNumbers(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, accruals[0].startBlock, accruals[0].endBlock,
                            '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(glob.user_a, mocks.address0, 0, 0))
                            .should.be.true;
                        (await ethersMockedBeneficiary.benefitsCount())
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('claimAndTransferToBeneficiary()', () => {
            describe('if called by non-claimer', () => {
                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    await ethersMockedClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called before any accrual period has been closed', () => {
                let currencyCt;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );
                    await closeAndLogAccrual(
                        20, 2, {ct: web3ERC20.address, id: 0}
                    );

                    currencyCt = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, glob.user_b, 'staged', currencyCt, 0, ''
                    ).should.be.rejected;
                });
            });

            describe('with claim by block number batch size equal to 0', () => {
                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}
                        );
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, ethersERC20.address, 0, 0, 0
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        let benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(
                            glob.user_a, ethersERC20.address, 0, 0
                        )).should.be.true;
                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount0._bn);

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, ethersERC20.address, 0, 1, 1
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        let benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(
                            glob.user_a, ethersERC20.address, 0, 1
                        )).should.be.true;
                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount1._bn);
                    });
                });

                describe('of Ether', () => {
                    let balanceBefore

                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: mocks.address0, id: 0}
                        );

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        const claimableAmount0 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 0, 0
                        );
                        claimableAmount0._bn.should.not.be.zero;

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        let benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(mocks.address0);
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(
                            glob.user_a, mocks.address0, 0, 0
                        )).should.be.true;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;

                        const claimableAmount1 = await ethersTokenHolderRevenueFund.claimableAmountByAccruals(
                            glob.user_a, mocks.address0, 0, 1, 1
                        );
                        claimableAmount1._bn.should.not.be.zero;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByAccrualsEvent');

                        let benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount1._bn);
                        benefit1.currencyCt.should.equal(mocks.address0);
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.fullyClaimed(
                            glob.user_a, mocks.address0, 0, 1
                        )).should.be.true;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
                });
            });

            describe('with claim by block number batch size greater than 0', () => {
                let batchSize;

                beforeEach(async () => {
                    batchSize = 1;
                    await web3TokenHolderRevenueFund.setClaimBlockNumberBatchSize(batchSize);
                });

                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: web3ERC20.address, id: 0}, [0, 1, 2]
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}, [0, 1, 2]
                        );
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        const claimableAmount0 = utils.parseUnits('1', 15);

                        // TODO Remove
                        // const accrualsCount = (await ethersTokenHolderRevenueFund.closedAccrualsCount(
                        //     ethersERC20.address, 0
                        // )).toNumber();
                        // const accruals = [];
                        // for (let i = 0; i < accrualsCount; i++)
                        //     accruals.push(await ethersTokenHolderRevenueFund.closedAccrualsByCurrency(
                        //         ethersERC20.address, 0, i
                        //     ));
                        // accruals.forEach(a => {
                        //     a.startBlock = a.startBlock.toNumber();
                        //     a.endBlock = a.endBlock.toNumber();
                        //     a.amount = a.amount.toString();
                        // });
                        // console.log(accruals);
                        //
                        // console.log(`calculate(... 0, 0): ${(await ethersMockedClaimableAmountCalculator.calculate(
                        //     glob.user_a, utils.parseUnits('10', 15), 0, 0, 0, 0
                        // )).toString()}`);
                        // console.log(`calculate(... 0, 1): ${(await ethersMockedClaimableAmountCalculator.calculate(
                        //     glob.user_a, utils.parseUnits('10', 15), 0, 1, 0, 1
                        // )).toString()}`);
                        // console.log(`calculate(... 1, 1): ${(await ethersMockedClaimableAmountCalculator.calculate(
                        //     glob.user_a, utils.parseUnits('10', 15), 1, 1, 1, 1
                        // )).toString()}`);
                        // console.log(`calculate(... 1, 2): ${(await ethersMockedClaimableAmountCalculator.calculate(
                        //     glob.user_a, utils.parseUnits('10', 15), 1, 2, 1, 2
                        // )).toString()}`);

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        // TODO Remove
                        // const claimedBlockSpans0 = (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        //     glob.user_a, ethersERC20.address, 0, 0
                        // )).map(s => ({startBlock: s.startBlock.toNumber(), endBlock: s.endBlock.toNumber()}));
                        // console.log(claimedBlockSpans0);

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        let benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(
                            glob.user_a, ethersERC20.address, 0, 0
                        )).should.be.true;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount0._bn);

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        // TODO Remove
                        // const claimedBlockSpans1 = (await ethersTokenHolderRevenueFund.claimedBlockSpans(
                        //     glob.user_a, ethersERC20.address, 0, 0
                        // )).map(s => ({startBlock: s.startBlock.toNumber(), endBlock: s.endBlock.toNumber()}));
                        // console.log(claimedBlockSpans1);

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        let benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit1.currencyCt.should.equal(utils.getAddress(ethersERC20.address));
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(
                            glob.user_a, ethersERC20.address, 0, 0
                        )).should.be.true;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(claimableAmount0._bn);
                    });
                });

                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await closeAndLogAccrual(
                            10, 1, {ct: mocks.address0, id: 0}, [0, 1, 2]
                        );
                        await closeAndLogAccrual(
                            20, 2, {ct: web3ERC20.address, id: 0}, [0, 1, 2]
                        );

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer by accruals', async () => {
                        const claimableAmount0 = utils.parseEther('1');

                        const result0 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result0.logs.should.be.an('array').and.have.lengthOf(1);
                        result0.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        let benefit0 = await ethersMockedBeneficiary._getBenefit(0);
                        benefit0.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit0.balanceType.should.equal('staged');
                        benefit0.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit0.currencyCt.should.equal(mocks.address0);
                        benefit0.currencyId._bn.should.eq.BN(0);
                        benefit0.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(
                            glob.user_a, mocks.address0, 0, 0
                        )).should.be.true;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;

                        const result1 = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged',
                            mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result1.logs.should.be.an('array').and.have.lengthOf(1);
                        result1.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryByBlockNumbersEvent');

                        let benefit1 = await ethersMockedBeneficiary._getBenefit(1);
                        benefit1.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit1.balanceType.should.equal('staged');
                        benefit1.amount._bn.should.eq.BN(claimableAmount0._bn);
                        benefit1.currencyCt.should.equal(mocks.address0);
                        benefit1.currencyId._bn.should.eq.BN(0);
                        benefit1.standard.should.be.a('string').that.is.empty;

                        (await ethersTokenHolderRevenueFund.partiallyClaimed(
                            glob.user_a, mocks.address0, 0, 0
                        )).should.be.true;

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.be.gt.BN(balanceBefore);
                    });
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[0].endBlock - 1, {
                            from: glob.user_a,
                            gas: 1e6
                        }
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock, accruals[0].endBlock - 1, {
                            from: glob.user_a,
                            gas: 1e6
                        }
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
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
                    await closeAndLogAccrual(
                        10, 1, {ct: web3ERC20.address, id: 0}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByBlockNumbers(
                        web3ERC20.address, 0, accruals[0].startBlock + 1, accruals[0].endBlock - 1, {
                            from: glob.user_a,
                            gas: 1e6
                        }
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
                    await web3TokenHolderRevenueFund.withdraw(
                        -10, mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let balanceBefore;

                beforeEach(async () => {
                    await closeAndLogAccrual(
                        10, 3, {ct: web3ERC20.address, id: 0}
                    );

                    await web3TokenHolderRevenueFund.claimAndStageByAccruals(
                        web3ERC20.address, 0, 0, 0, {from: glob.user_a, gas: 1e6}
                    );

                    balanceBefore = await ethersERC20.balanceOf(glob.user_a);
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.withdraw(
                        utils.parseUnits('2', 15).toString(), web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('WithdrawEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, ethersERC20.address, 0))
                        ._bn.should.eq.BN(utils.parseUnits('1', 15)._bn);

                    (await ethersERC20.balanceOf(glob.user_a))._bn.should.eq.BN(
                        balanceBefore.add(utils.parseUnits('2', 15))._bn
                    );
                });
            });
        });
    });
};
