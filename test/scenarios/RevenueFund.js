const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const RevenueFund = artifacts.require('RevenueFund');
const MockedAccrualBeneficiary = artifacts.require('MockedAccrualBeneficiary');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('RevenueFund', function () {
        let provider;
        let web3TransferControllerManager;
        let web3ERC20, ethersERC20;
        let web3RevenueFund, ethersRevenueFund;
        let web3MockedAccrualBeneficiary99, ethersMockedAccrualBeneficiary99;
        let web3MockedAccrualBeneficiary01, ethersMockedAccrualBeneficiary01;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3MockedAccrualBeneficiary99 = await MockedAccrualBeneficiary.new(glob.owner);
            ethersMockedAccrualBeneficiary99 = new Contract(web3MockedAccrualBeneficiary99.address, MockedAccrualBeneficiary.abi, glob.signer_owner);
            web3MockedAccrualBeneficiary01 = await MockedAccrualBeneficiary.new(glob.owner);
            ethersMockedAccrualBeneficiary01 = new Contract(web3MockedAccrualBeneficiary01.address, MockedAccrualBeneficiary.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3RevenueFund = await RevenueFund.new(glob.owner);
            ethersRevenueFund = new Contract(web3RevenueFund.address, RevenueFund.abi, glob.signer_owner);

            await web3RevenueFund.setTransferControllerManager(web3TransferControllerManager.address);
            await web3RevenueFund.registerFractionalBeneficiary(web3MockedAccrualBeneficiary99.address, 99e16);
            await web3RevenueFund.registerFractionalBeneficiary(web3MockedAccrualBeneficiary01.address, 1e16);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3RevenueFund.deployer.call()).should.equal(glob.owner);
                (await web3RevenueFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                (await ethersRevenueFund.depositsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('periodAccrualBalance()', () => {
            it('should return initial value', async () => {
                (await ethersRevenueFund.periodAccrualBalance(mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('aggregateAccrualBalance()', () => {
            it('should return initial value', async () => {
                (await ethersRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('periodCurrenciesCount()', () => {
            it('should return initial value', async () => {
                (await ethersRevenueFund.periodCurrenciesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('aggregateCurrenciesCount()', () => {
            it('should return initial value', async () => {
                (await ethersRevenueFund.aggregateCurrenciesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('fallback function', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3RevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersRevenueFund.depositsCount())
                        ._bn.should.eq.BN(1);

                    (await ethersRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3RevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });
                });

                it('should add on top of the first deposit', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3RevenueFund.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersRevenueFund.depositsCount())
                        ._bn.should.eq.BN(2);

                    (await ethersRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    (await ethersRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveEthersTo()', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    const result = await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ReceiveEvent');

                    (await ethersRevenueFund.depositsCount())
                        ._bn.should.eq.BN(1);

                    (await ethersRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                    (await ethersRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );
                });

                it('should add on top of the first deposit', async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersRevenueFund.depositsCount())
                        ._bn.should.eq.BN(2);

                    (await ethersRevenueFund.periodAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                    (await ethersRevenueFund.aggregateAccrualBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveTokens()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3RevenueFund.receiveTokens('', 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3RevenueFund.receiveTokens('', 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3RevenueFund.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3RevenueFund.receiveTokens('', 9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3RevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3RevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersRevenueFund.depositsCount())
                            ._bn.should.eq.BN(1);

                        (await ethersRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3RevenueFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3RevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3RevenueFund.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        (await ethersRevenueFund.depositsCount())
                            ._bn.should.eq.BN(2);

                        (await ethersRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                        (await ethersRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('receiveTokensTo()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 0, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3RevenueFund.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 9999, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3RevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersRevenueFund.depositsCount())
                            ._bn.should.eq.BN(1);

                        (await ethersRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                        (await ethersRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3RevenueFund.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3RevenueFund.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersRevenueFund.depositsCount())
                            ._bn.should.eq.BN(2);

                        (await ethersRevenueFund.periodAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                        (await ethersRevenueFund.aggregateAccrualBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3RevenueFund.deposit.call(0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersRevenueFund.deposit(0);

                    deposit.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3RevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3RevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersRevenueFund.deposit(0);

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
                    web3RevenueFund.periodCurrenciesByIndices.call(0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersRevenueFund.periodCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(mocks.address0);
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3RevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3RevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersRevenueFund.periodCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(utils.getAddress(web3ERC20.address));
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });
        });

        describe('aggregateCurrenciesByIndices()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3RevenueFund.aggregateCurrenciesByIndices.call(0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersRevenueFund.aggregateCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(mocks.address0);
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3RevenueFund.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3RevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersRevenueFund.aggregateCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(utils.getAddress(web3ERC20.address));
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });
        });
        describe('closeAccrualPeriod()', () => {
            describe('if called by non-operator', () => {
                beforeEach(() => {
                    ethersRevenueFund = ethersRevenueFund.connect(glob.signer_b);
                });

                it('should revert', async () => {
                    ethersRevenueFund.closeAccrualPeriod([]).should.be.rejected;
                });
            });

            describe('if called by operator', () => {
                let currencies;

                beforeEach(async () => {
                    await web3RevenueFund.receiveEthersTo(
                        glob.user_a, '',
                        {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );

                    await web3ERC20.approve(
                        web3RevenueFund.address, 10,
                        {from: glob.user_a, gas: 1e6}
                    );
                    await web3RevenueFund.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '',
                        {from: glob.user_a, gas: 1e6}
                    );

                    currencies = [{ct: mocks.address0, id: 0}, {ct: web3ERC20.address, id: 0}];
                });

                it('should successfully close accrual period of given currencies', async () => {
                    await ethersRevenueFund.closeAccrualPeriod(currencies, {gasLimit: 1e6});

                    (await ethersMockedAccrualBeneficiary99._closedAccrualPeriodsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersMockedAccrualBeneficiary01._closedAccrualPeriodsCount())
                        ._bn.should.eq.BN(1);
                });
            });
        });
    });
};

