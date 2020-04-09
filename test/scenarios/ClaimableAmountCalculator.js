const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
const ClaimableAmountCalculator = artifacts.require('ClaimableAmountCalculator');
const MockedRevenueTokenManager = artifacts.require('MockedRevenueTokenManager');
const MockedBalanceAucCalculator = artifacts.require('MockedBalanceAucCalculator');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ClaimableAmountCalculator', function () {
        let provider;
        let web3ERC20, ethersERC20;
        let web3ClaimableAmountCalculator, ethersClaimableAmountCalculator;
        let web3MockedRevenueTokenManager, ethersMockedRevenueTokenManager;
        let web3MockedBalanceBlocksCalculator, ethersMockedBalanceBlocksCalculator;
        let web3MockedReleasedAmountBlocksCalculator, ethersMockedReleasedAmountBlocksCalculator;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 100000);

            web3ClaimableAmountCalculator = await ClaimableAmountCalculator.new(glob.owner);
            ethersClaimableAmountCalculator = new Contract(web3ClaimableAmountCalculator.address, ClaimableAmountCalculator.abi, glob.signer_owner);

            web3MockedRevenueTokenManager = await MockedRevenueTokenManager.new();
            ethersMockedRevenueTokenManager = new Contract(web3MockedRevenueTokenManager.address, MockedRevenueTokenManager.abi, glob.signer_owner);
            web3MockedBalanceBlocksCalculator = await MockedBalanceAucCalculator.new();
            ethersMockedBalanceBlocksCalculator = new Contract(web3MockedBalanceBlocksCalculator.address, MockedBalanceAucCalculator.abi, glob.signer_owner);
            web3MockedReleasedAmountBlocksCalculator = await MockedBalanceAucCalculator.new();
            ethersMockedReleasedAmountBlocksCalculator = new Contract(web3MockedReleasedAmountBlocksCalculator.address, MockedBalanceAucCalculator.abi, glob.signer_owner);

            await web3ClaimableAmountCalculator.setRevenueTokenManager(web3MockedRevenueTokenManager.address);
            await web3ClaimableAmountCalculator.setBalanceBlocksCalculator(web3MockedBalanceBlocksCalculator.address);
            await web3ClaimableAmountCalculator.setReleasedAmountBlocksCalculator(web3MockedReleasedAmountBlocksCalculator.address);

            await web3MockedRevenueTokenManager._setToken(web3ERC20.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3ClaimableAmountCalculator.deployer.call()).should.equal(glob.owner);
                (await web3ClaimableAmountCalculator.operator.call()).should.equal(glob.owner);
            });
        });

        describe('revenueTokenManager()', () => {
            it('should return initial value', async () => {
                (await web3ClaimableAmountCalculator.revenueTokenManager.call())
                    .should.equal(web3MockedRevenueTokenManager.address);
            });
        });

        describe('balanceBlocksCalculator()', () => {
            it('should equal value initialized', async () => {
                (await web3ClaimableAmountCalculator.balanceBlocksCalculator.call())
                    .should.equal(web3MockedBalanceBlocksCalculator.address);
            });
        });

        describe('releasedAmountBlocksCalculator()', () => {
            it('should equal value initialized', async () => {
                (await web3ClaimableAmountCalculator.releasedAmountBlocksCalculator.call())
                    .should.equal(web3MockedReleasedAmountBlocksCalculator.address);
            });
        });

        describe('setRevenueTokenManager()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setRevenueTokenManager(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setBalanceBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let revenueTokenManager;

                beforeEach(() => {
                    revenueTokenManager = Wallet.createRandom().address;
                });

                it('should successfully set revenue token manager', async () => {
                    const result = await web3ClaimableAmountCalculator.setRevenueTokenManager(revenueTokenManager);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueTokenManagerEvent');

                    (await ethersClaimableAmountCalculator.revenueTokenManager.call())
                        .should.equal(revenueTokenManager);
                });
            });
        });

        describe('setBalanceBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setBalanceBlocksCalculator(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setBalanceBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculator;

                beforeEach(async () => {
                    calculator = Wallet.createRandom().address;
                });

                it('should successfully set the balance blocks calculator', async () => {
                    const result = await web3ClaimableAmountCalculator.setBalanceBlocksCalculator(calculator);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceBlocksCalculatorEvent');

                    (await ethersClaimableAmountCalculator.balanceBlocksCalculator())
                        .should.equal(calculator);
                });
            });
        });

        describe('setReleasedAmountBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setReleasedAmountBlocksCalculator(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.setReleasedAmountBlocksCalculator(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculator;

                beforeEach(async () => {
                    calculator = Wallet.createRandom().address;
                });

                it('should successfully set the released amount blocks calculator', async () => {
                    const result = await web3ClaimableAmountCalculator.setReleasedAmountBlocksCalculator(calculator);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleasedAmountBlocksCalculatorEvent');

                    (await ethersClaimableAmountCalculator.releasedAmountBlocksCalculator())
                        .should.equal(calculator);
                });
            });
        });

        describe('nonClaimersCount()', () => {
            it('should return initial value', async () => {
                (await ethersClaimableAmountCalculator.nonClaimersCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isNonClaimer()', () => {
            it('should return initial value', async () => {
                (await ethersClaimableAmountCalculator.isNonClaimer(Wallet.createRandom().address))
                    .should.be.false;
            });
        });

        describe('registerNonClaimer()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.registerNonClaimer(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should successfully add non-claimer and emit event', async () => {
                    const result = await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                    await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_b);
                    await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_c);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('RegisterNonClaimerEvent');

                    (await ethersClaimableAmountCalculator.nonClaimersCount())
                        ._bn.should.eq.BN(3);
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_a))
                        .should.be.true;
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_b))
                        .should.be.true;
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_c))
                        .should.be.true;
                });
            });
        });

        describe('deregisterNonClaimer()', () => {
            beforeEach(async () => {
                await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_a);
                await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_b);
                await web3ClaimableAmountCalculator.registerNonClaimer(glob.user_c);
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    await web3ClaimableAmountCalculator.deregisterNonClaimer(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should successfully add non-claimer and emit event', async () => {
                    const result = await web3ClaimableAmountCalculator.deregisterNonClaimer(glob.user_a);
                    await web3ClaimableAmountCalculator.deregisterNonClaimer(glob.user_c);
                    await web3ClaimableAmountCalculator.deregisterNonClaimer(glob.user_b);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('DeregisterNonClaimerEvent');

                    (await ethersClaimableAmountCalculator.nonClaimersCount())
                        ._bn.should.eq.BN(0);
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_a))
                        .should.be.false;
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_b))
                        .should.be.false;
                    (await ethersClaimableAmountCalculator.isNonClaimer(glob.user_c))
                        .should.be.false;
                });
            });
        });

        describe('calculate()', () => {
            describe('if called with 0 released amount blocks', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 0
                    );
                });

                it('should return 0', async () => {
                    (await ethersClaimableAmountCalculator.calculate(
                        glob.user_a, 2000, 0, 10, 0, 10
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if called without non-claimers', () => {
                beforeEach(async () => {
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersClaimableAmountCalculator.calculate(
                        glob.user_a, 2000, 0, 10, 0, 10
                    ))._bn.should.eq.BN(600);
                });
            });

            describe('if called with non-claimers', () => {
                beforeEach(async () => {
                    await ethersClaimableAmountCalculator.registerNonClaimer(glob.user_b);
                    await ethersClaimableAmountCalculator.registerNonClaimer(glob.user_c);

                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_a, 3000
                    );
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_b, 2000
                    );
                    await ethersMockedBalanceBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3ERC20.address, glob.user_c, 3000
                    );
                    await ethersMockedReleasedAmountBlocksCalculator['_setCalculate(address,address,uint256)'](
                        web3MockedRevenueTokenManager.address, mocks.address0, 10000
                    );
                });

                it('should return the claimable amount', async () => {
                    (await ethersClaimableAmountCalculator.calculate(
                        glob.user_a, 2000, 0, 10, 0, 10
                    ))._bn.should.eq.BN(1200);
                });
            });
        });
    });
};
