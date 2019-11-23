const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract} = require('ethers');
const mocks = require('../mocks');
const RevenueFundAccrualMonitor = artifacts.require('RevenueFundAccrualMonitor');
const MockedTokenHolderRevenueFund = artifacts.require('MockedTokenHolderRevenueFund');
const MockedRevenueTokenManager = artifacts.require('MockedRevenueTokenManager');
const MockedRevenueFund = artifacts.require('MockedRevenueFund');
const MockedBalanceAucCalculator = artifacts.require('MockedBalanceAucCalculator');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('RevenueFundAccrualMonitor', function () {
        let provider;
        let web3RevenueFundAccrualMonitor, ethersRevenueFundAccrualMonitor;
        let web3MockedRevenueFund, ethersMockedRevenueFund;
        let web3MockedRevenueTokenManager, ethersMockedRevenueTokenManager;
        let web3MockedBalanceAucCalculator, ethersMockedBalanceAucCalculator;
        let web3MockedTokenHolderRevenueFund, ethersMockedTokenHolderRevenueFund;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3RevenueFundAccrualMonitor = await RevenueFundAccrualMonitor.new(glob.owner);
            ethersRevenueFundAccrualMonitor = new Contract(web3RevenueFundAccrualMonitor.address, RevenueFundAccrualMonitor.abi, glob.signer_owner);

            web3MockedRevenueFund = await MockedRevenueFund.new();
            ethersMockedRevenueFund = new Contract(web3MockedRevenueFund.address, MockedRevenueFund.abi, glob.signer_owner);
            web3MockedRevenueTokenManager = await MockedRevenueTokenManager.new();
            ethersMockedRevenueTokenManager = new Contract(web3MockedRevenueTokenManager.address, MockedRevenueTokenManager.abi, glob.signer_owner);
            web3MockedBalanceAucCalculator = await MockedBalanceAucCalculator.new();
            ethersMockedBalanceAucCalculator = new Contract(web3MockedBalanceAucCalculator.address, MockedBalanceAucCalculator.abi, glob.signer_owner);
            web3MockedTokenHolderRevenueFund = await MockedTokenHolderRevenueFund.new();
            ethersMockedTokenHolderRevenueFund = new Contract(web3MockedTokenHolderRevenueFund.address, MockedTokenHolderRevenueFund.abi, glob.signer_owner);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3RevenueFundAccrualMonitor.deployer.call()).should.equal(glob.owner);
                (await web3RevenueFundAccrualMonitor.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3RevenueFundAccrualMonitor.setRevenueFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3RevenueFundAccrualMonitor.setRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueFundEvent');

                    (await ethersRevenueFundAccrualMonitor.revenueFund())
                        .should.equal(address);
                });
            });
        });

        describe('setTokenHolderRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3RevenueFundAccrualMonitor.setTokenHolderRevenueFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3RevenueFundAccrualMonitor.setTokenHolderRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTokenHolderRevenueFundEvent');

                    (await ethersRevenueFundAccrualMonitor.tokenHolderRevenueFund())
                        .should.equal(address);
                });
            });
        });

        describe('setRevenueTokenManager()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3RevenueFundAccrualMonitor.setRevenueTokenManager(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3RevenueFundAccrualMonitor.setRevenueTokenManager(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueTokenManagerEvent');

                    (await ethersRevenueFundAccrualMonitor.revenueTokenManager())
                        .should.equal(address);
                });
            });
        });

        describe('setBalanceBlocksCalculator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3RevenueFundAccrualMonitor.setBalanceBlocksCalculator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3RevenueFundAccrualMonitor.setBalanceBlocksCalculator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceBlocksCalculatorEvent');

                    (await ethersRevenueFundAccrualMonitor.balanceBlocksCalculator())
                        .should.equal(address);
                });
            });
        });

        describe('setReleasedAmountBlocksCalculator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3RevenueFundAccrualMonitor.setReleasedAmountBlocksCalculator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3RevenueFundAccrualMonitor.setReleasedAmountBlocksCalculator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleasedAmountBlocksCalculatorEvent');

                    (await ethersRevenueFundAccrualMonitor.releasedAmountBlocksCalculator())
                        .should.equal(address);
                });
            });
        });

        describe('claimableAmount()', () => {
            let wallet, currencyCt, currencyId, token;

            beforeEach(async () => {
                wallet = Wallet.createRandom().address;
                currencyCt = Wallet.createRandom().address;
                currencyId = 123;
                token = Wallet.createRandom().address;

                await web3RevenueFundAccrualMonitor.setRevenueFund(web3MockedRevenueFund.address);
                await web3RevenueFundAccrualMonitor.setTokenHolderRevenueFund(web3MockedTokenHolderRevenueFund.address);
                await web3RevenueFundAccrualMonitor.setRevenueTokenManager(web3MockedRevenueTokenManager.address);
                await web3RevenueFundAccrualMonitor.setBalanceBlocksCalculator(web3MockedBalanceAucCalculator.address);
                await web3RevenueFundAccrualMonitor.setReleasedAmountBlocksCalculator(web3MockedBalanceAucCalculator.address);

                await web3MockedRevenueFund._setPeriodAccrualBalance(currencyCt, currencyId, 1000);
                await web3MockedRevenueFund._setBeneficiaryFraction(
                    web3MockedTokenHolderRevenueFund.address, 99e16
                );

                await web3MockedRevenueTokenManager._setToken(token);
            });

            describe('if there is a previously closed accrual', () => {
                beforeEach(async () => {
                    await ethersMockedTokenHolderRevenueFund._setClosedAccrualByCurrency(
                        currencyCt, currencyId, {startBlock: 10, endBlock: 20, amount: 100}, {gasLimit: 1e6}
                    );

                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256,uint256)'](
                        token, wallet, 21, 1000
                    );
                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 21, 10000
                    );
                });

                it('should successfully calculate and return the claimable amount', async () => {
                    (await ethersRevenueFundAccrualMonitor.claimableAmount(wallet, currencyCt, currencyId))
                        ._bn.should.eq.BN(99);
                });
            });

            describe('if there is no previously closed accrual', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256)'](
                        token, wallet, 1000
                    );
                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );
                });

                it('should successfully calculate and return the claimable amount', async () => {
                    (await ethersRevenueFundAccrualMonitor.claimableAmount(wallet, currencyCt, currencyId))
                        ._bn.should.eq.BN(99);
                });
            });

            describe('if there is a non-claimer', () => {
                beforeEach(async () => {
                    const nonClaimer = Wallet.createRandom().address;

                    await web3MockedTokenHolderRevenueFund._setNonClaimer(nonClaimer);

                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256)'](
                        token, wallet, 1000
                    );
                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256)'](
                        token, nonClaimer, 9000
                    );
                    await ethersMockedBalanceAucCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );
                });

                it('should successfully calculate and return the claimable amount', async () => {
                    (await ethersRevenueFundAccrualMonitor.claimableAmount(wallet, currencyCt, currencyId))
                        ._bn.should.eq.BN(990);
                });
            });
        });
    });
};
