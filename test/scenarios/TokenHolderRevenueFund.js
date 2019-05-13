const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const MockedTokenHolderRevenueFundService = artifacts.require('MockedTokenHolderRevenueFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedRevenueTokenManager = artifacts.require('MockedRevenueTokenManager');
const MockedRevenueToken = artifacts.require('MockedRevenueToken');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('TokenHolderRevenueFund', function () {
        let provider;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3TokenHolderRevenueFund, ethersTokenHolderRevenueFund;
        let web3MockedTokenHolderRevenueFundService, ethersMockedTokenHolderRevenueFundService;
        let web3MockedBeneficiary, ethersMockedBeneficiary;
        let web3MockedRevenueTokenManager, ethersMockedRevenueTokenManager;
        let web3MockedRevenueToken, ethersMockedRevenueToken;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3MockedTokenHolderRevenueFundService = await MockedTokenHolderRevenueFundService.new();
            ethersMockedTokenHolderRevenueFundService = new Contract(web3MockedTokenHolderRevenueFundService.address, MockedTokenHolderRevenueFundService.abi, glob.signer_owner);
            web3MockedRevenueTokenManager = await MockedRevenueTokenManager.new();
            ethersMockedRevenueTokenManager = new Contract(web3MockedRevenueTokenManager.address, MockedRevenueTokenManager.abi, glob.signer_owner);
            web3MockedRevenueToken = await MockedRevenueToken.at(await web3MockedRevenueTokenManager.token());
            ethersMockedRevenueToken = new Contract(web3MockedRevenueToken.address, MockedRevenueToken.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            web3TokenHolderRevenueFund = await TokenHolderRevenueFund.new(glob.owner);
            ethersTokenHolderRevenueFund = new Contract(web3TokenHolderRevenueFund.address, TokenHolderRevenueFund.abi, glob.signer_owner);

            await web3TokenHolderRevenueFund.setTransferControllerManager(web3TransferControllerManager.address);
            await web3TokenHolderRevenueFund.setRevenueTokenManager(web3MockedRevenueTokenManager.address);
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

        describe('revenueTokenManager()', () => {
            it('should return initial value', async () => {
                (await web3TokenHolderRevenueFund.revenueTokenManager.call())
                    .should.equal(web3MockedRevenueTokenManager.address);
            });
        });

        describe('setRevenueTokenManager()', () => {
            let revenueTokenManager;

            beforeEach(() => {
                revenueTokenManager = Wallet.createRandom().address;
            });

            it('should successfully set revenue token manager and emit event', async () => {
                const result = await web3TokenHolderRevenueFund.setRevenueTokenManager(revenueTokenManager);

                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('SetRevenueTokenManagerEvent');

                (await ethersTokenHolderRevenueFund.revenueTokenManager.call())
                    .should.equal(revenueTokenManager);
            });
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                (await ethersTokenHolderRevenueFund.depositsCount())
                    ._bn.should.eq.BN(0);
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

                    (await ethersTokenHolderRevenueFund.depositsCount())
                        ._bn.should.eq.BN(1);

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

                    (await ethersTokenHolderRevenueFund.depositsCount())
                        ._bn.should.eq.BN(2);

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

                    (await ethersTokenHolderRevenueFund.depositsCount())
                        ._bn.should.eq.BN(1);

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

                    (await ethersTokenHolderRevenueFund.depositsCount())
                        ._bn.should.eq.BN(2);

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

                        (await ethersTokenHolderRevenueFund.depositsCount())
                            ._bn.should.eq.BN(1);

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

                        (await ethersTokenHolderRevenueFund.depositsCount())
                            ._bn.should.eq.BN(2);

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

                        (await ethersTokenHolderRevenueFund.depositsCount())
                            ._bn.should.eq.BN(1);

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

                        (await ethersTokenHolderRevenueFund.depositsCount())
                            ._bn.should.eq.BN(2);

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                        (await ethersTokenHolderRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);

                        (await ethersERC20.balanceOf(ethersTokenHolderRevenueFund.address))._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.deposit.call(0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3TokenHolderRevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersTokenHolderRevenueFund.deposit(0);

                    deposit.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId._bn.should.eq.BN(0);
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
                    const deposit = await ethersTokenHolderRevenueFund.deposit(0);

                    deposit.amount._bn.should.eq.BN(10);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    deposit.currencyId._bn.should.eq.BN(0);
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

        describe('closeAccrualPeriod()', () => {
            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    await ethersTokenHolderRevenueFund.closeAccrualPeriod([]).should.be.rejected;
                });
            });

            describe('if called by enabled service action', () => {
                let currencies;

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

                    currencies = [{ct: mocks.address0, id: 0}, {ct: web3ERC20.address, id: 0}];
                });

                it('should successfully close accrual period of given currencies', async () => {
                    await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(currencies, {gasLimit: 1e6});

                    const blockNumber = await provider.getBlockNumber();

                    currencies.forEach(async (currency) => {
                        const accrualBlockNumber = await ethersTokenHolderRevenueFund.accrualBlockNumbersByCurrency(currency.ct, currency.id, 0);
                        accrualBlockNumber._bn.should.eq.BN(blockNumber);

                        (await ethersTokenHolderRevenueFund.aggregateAccrualAmountByCurrencyBlockNumber(
                            currency.ct, currency.id, blockNumber
                        ))._bn.should.eq.BN((await ethersTokenHolderRevenueFund.aggregateAccrualBalance(currency.ct, currency.id))._bn);

                        (await ethersTokenHolderRevenueFund.periodAccrualBalance(currency.ct, currency.id))
                            ._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('claimAndTransferToBeneficiary()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await web3TokenHolderRevenueFund.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );

                        await ethersMockedTokenHolderRevenueFundService.closeAccrualPeriod(
                            [{ct: mocks.address0, id: 0}], {gasLimit: 1e6}
                        );

                        await web3MockedRevenueToken._setBalanceBlocksIn(3000);
                        await web3MockedRevenueTokenManager._setReleasedAmountBlocksIn(10000);

                        balanceBefore = (await provider.getBalance(ethersMockedBeneficiary.address))._bn;
                    });

                    it('should successfully claim and transfer', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged', mocks.address0, 0, '', {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryEvent');

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

                        await web3MockedRevenueToken._setBalanceBlocksIn(3000);
                        await web3MockedRevenueTokenManager._setReleasedAmountBlocksIn(10000);
                    });

                    it('should successfully claim and transfer', async () => {
                        const result = await web3TokenHolderRevenueFund.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, glob.user_b, 'staged', web3ERC20.address, 0, '', {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryEvent');

                        const benefit = await ethersMockedBeneficiary._getBenefit(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_b));
                        benefit.balanceType.should.equal('staged');
                        benefit.amount._bn.should.eq.BN(3);
                        benefit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                        benefit.currencyId._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersTokenHolderRevenueFund.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(3);
                    });
                });
            });
        });

        describe('claimAndStage()', () => {
            describe('if called before any accrual period has been closed', () => {
                it('should revert', async () => {
                    web3TokenHolderRevenueFund.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
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

                    await web3MockedRevenueToken._setBalanceBlocksIn(3000);
                    await web3MockedRevenueTokenManager._setReleasedAmountBlocksIn(10000);
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.claimAndStage(
                        web3ERC20.address, 0, {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ClaimAndStageEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(3);
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

                    await web3MockedRevenueToken._setBalanceBlocksIn(3000);
                    await web3MockedRevenueTokenManager._setReleasedAmountBlocksIn(10000);

                    await web3TokenHolderRevenueFund.claimAndStage(
                        web3ERC20.address, 0, {from: glob.user_b, gas: 1e6}
                    );
                });

                it('should successfully claim and stage', async () => {
                    const result = await web3TokenHolderRevenueFund.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_b, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('WithdrawEvent');

                    (await ethersTokenHolderRevenueFund.stagedBalance(glob.user_b, web3ERC20.address, 0))
                        ._bn.should.eq.BN(1);

                    (await ethersERC20.balanceOf(glob.user_b))._bn.should.eq.BN(2);
                });
            });
        });
    });
};
