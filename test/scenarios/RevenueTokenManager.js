const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet, utils} = require('ethers');
const {address0} = require('../mocks');

const MockedAucCalculator = artifacts.require('MockedAucCalculator');
const NahmiiToken = artifacts.require('NahmiiToken');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('RevenueTokenManager', function () {
        let provider;
        let web3BalanceBlocksCalculator, ethersBalanceBlocksCalculator;
        let web3ReleasedAmountBlocksCalculator, ethersReleasedAmountBlocksCalculator;
        let web3NahmiiToken, ethersNahmiiToken;
        let web3RevenueTokenManager, ethersRevenueTokenManager;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3RevenueTokenManager = await RevenueTokenManager.new(glob.owner);
            ethersRevenueTokenManager = new Contract(web3RevenueTokenManager.address, RevenueTokenManager.abi, glob.signer_owner);

            web3NahmiiToken = await NahmiiToken.new();
            ethersNahmiiToken = new Contract(web3NahmiiToken.address, NahmiiToken.abi, glob.signer_owner);

            web3BalanceBlocksCalculator = await MockedAucCalculator.new();
            ethersBalanceBlocksCalculator = new Contract(web3BalanceBlocksCalculator.address, MockedAucCalculator.abi, glob.signer_owner);

            web3ReleasedAmountBlocksCalculator = await MockedAucCalculator.new();
            ethersReleasedAmountBlocksCalculator = new Contract(web3ReleasedAmountBlocksCalculator.address, MockedAucCalculator.abi, glob.signer_owner);

            await web3RevenueTokenManager.setToken(web3NahmiiToken.address);
            await web3RevenueTokenManager.setBeneficiary(glob.user_a);
            await web3RevenueTokenManager.setBalanceBlocksCalculator(web3BalanceBlocksCalculator.address);
            await web3RevenueTokenManager.setReleasedAmountBlocksCalculator(web3ReleasedAmountBlocksCalculator.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3RevenueTokenManager.deployer.call()).should.equal(glob.owner);
                (await web3RevenueTokenManager.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setBalanceBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setBalanceBlocksCalculator(Wallet.createRandom().address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setBalanceBlocksCalculator(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of token multi time-lock contract', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setBalanceBlocksCalculator(web3RevenueTokenManager.address)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculatorAddress;

                beforeEach(async () => {
                    calculatorAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3RevenueTokenManager.setBalanceBlocksCalculator(calculatorAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceBlocksCalculatorEvent');

                    (await ethersRevenueTokenManager.balanceBlocksCalculator())
                        .should.equal(calculatorAddress);
                });
            });
        });

        describe('setReleasedAmountBlocksCalculator()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setReleasedAmountBlocksCalculator(Wallet.createRandom().address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setReleasedAmountBlocksCalculator(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of token multi time-lock contract', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setReleasedAmountBlocksCalculator(web3RevenueTokenManager.address)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let calculatorAddress;

                beforeEach(async () => {
                    calculatorAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3RevenueTokenManager.setReleasedAmountBlocksCalculator(calculatorAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleasedAmountBlocksCalculatorEvent');

                    (await ethersRevenueTokenManager.releasedAmountBlocksCalculator())
                        .should.equal(calculatorAddress);
                });
            });
        });

        describe('token()', () => {
            it('should equal value initialized', async () => {
                (await web3RevenueTokenManager.token.call())
                    .should.equal(address0);
            });
        });

        describe('beneficiary()', () => {
            it('should equal value initialized', async () => {
                (await web3RevenueTokenManager.beneficiary.call())
                    .should.equal(address0);
            });
        });

        describe('totalLockedAmount()', () => {
            it('should equal value initialized', async () => {
                (await ethersRevenueTokenManager.totalLockedAmount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('releasesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersRevenueTokenManager.releasesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('executedReleasesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersRevenueTokenManager.executedReleasesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setToken()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setToken(Wallet.createRandom().address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setToken(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of token multi time-lock contract', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setToken(web3RevenueTokenManager.address)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let tokenAddress;

                beforeEach(async () => {
                    tokenAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3RevenueTokenManager.setToken(tokenAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTokenEvent');

                    (await ethersRevenueTokenManager.token())
                        .should.equal(tokenAddress);
                });
            });
        });

        describe('setBeneficiary()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setBeneficiary(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setBeneficiary(address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let beneficiaryAddress;

                beforeEach(async () => {
                    beneficiaryAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3RevenueTokenManager.setBeneficiary(beneficiaryAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBeneficiaryEvent');

                    (await ethersRevenueTokenManager.beneficiary())
                        .should.equal(beneficiaryAddress);
                });
            });
        });

        describe('defineReleases()', () => {
            let earliestReleaseTimes, amounts, blockNumbers;

            beforeEach(async () => {
                await web3NahmiiToken.mint(web3RevenueTokenManager.address, 120000);

                await web3RevenueTokenManager.setToken(web3NahmiiToken.address);

                earliestReleaseTimes = [];
                amounts = [];
                blockNumbers = [];

                for (let i = 1; i <= 60; i++) {
                    earliestReleaseTimes.push(futureEpoch(10 * i));
                    amounts.push(1000);
                    if (blockNumbers <= 10)
                        blockNumbers.push(1000000 * i);
                }
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if token has not been set', () => {
                beforeEach(async () => {
                    web3RevenueTokenManager = await RevenueTokenManager.new(glob.owner);
                    ethersRevenueTokenManager = new Contract(web3RevenueTokenManager.address, RevenueTokenManager.abi, glob.signer_owner);

                    await web3NahmiiToken.mint(web3RevenueTokenManager.address, 1000);
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if number of release times differs from number of amounts', () => {
                beforeEach(() => {
                    amounts.push(4000);
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if number of release times is less than the count of block numbers', () => {
                beforeEach(() => {
                    earliestReleaseTimes = [futureEpoch(10)];
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if posterior total locked amount becomes greater than contracts token balance', () => {
                beforeEach(() => {
                    amounts[0] = 121000;
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully define releases', async () => {
                    const result = await web3RevenueTokenManager.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers, {gas: 5e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(60);
                    result.logs[0].event.should.equal('DefineReleaseEvent');

                    (await ethersRevenueTokenManager.totalLockedAmount())
                        ._bn.should.eq.BN(60000);
                    (await ethersRevenueTokenManager.releasesCount())
                        ._bn.should.eq.BN(60);
                    (await ethersRevenueTokenManager.executedReleasesCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('release()', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(web3RevenueTokenManager.address, 120000);

                await web3RevenueTokenManager.setToken(web3NahmiiToken.address);
                await web3RevenueTokenManager.setBeneficiary(glob.user_a);
            });

            describe('if called by non-beneficiary', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.release(0, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called with index of undefined release', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if release timer has not expired', () => {
                beforeEach(async () => {
                    await web3RevenueTokenManager.defineReleases(
                        [futureEpoch(10)], [1000], []
                    );
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('if block number is preset', () => {
                    beforeEach(async () => {
                        await web3RevenueTokenManager.defineReleases(
                            [futureEpoch(1)], [1000], [1000000]
                        );

                        await sleep(1500);
                    });

                    it('should successfully release with preset block number', async () => {
                        const result = await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6});

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersRevenueTokenManager.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.releasesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersRevenueTokenManager.executedReleasesCount())
                            ._bn.should.eq.BN(1);

                        const release = await ethersRevenueTokenManager.releases(0);
                        release.done.should.be.true;
                        release.blockNumber._bn.should.eq.BN(1000000);

                        (await ethersNahmiiToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(1000);
                    });
                });

                describe('if block number is not preset', () => {
                    beforeEach(async () => {
                        await web3RevenueTokenManager.defineReleases(
                            [futureEpoch(1)], [1000], []
                        );

                        await sleep(1500);
                    });

                    it('should successfully release with current block number', async () => {
                        const result = await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6});

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersRevenueTokenManager.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.releasesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersRevenueTokenManager.executedReleasesCount())
                            ._bn.should.eq.BN(1);

                        const release = await ethersRevenueTokenManager.releases(0);
                        release.done.should.be.true;
                        release.blockNumber._bn.should.eq.BN(await provider.getBlockNumber());

                        (await ethersNahmiiToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(1000);
                    });
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await web3RevenueTokenManager.defineReleases(
                        [futureEpoch(1)], [1000], []
                    );

                    await sleep(1500);

                    await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6});
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6}).should.be.rejected;
                });
            });
        });

        describe('setReleaseBlockNumber', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(web3RevenueTokenManager.address, 120000);

                await web3RevenueTokenManager.setToken(web3NahmiiToken.address);
                await web3RevenueTokenManager.setBeneficiary(glob.user_a);

                await web3RevenueTokenManager.defineReleases(
                    [futureEpoch(1)], [1000], []
                );
            });

            describe('if called by non-beneficiary', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.setReleaseBlockNumber(0, 1000000, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called with index that has not been released', () => {
                it('should successfully update the release block number', async () => {
                    const result = await web3RevenueTokenManager.setReleaseBlockNumber(0, 1000000, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleaseBlockNumberEvent');

                    (await ethersRevenueTokenManager.releases(0)).blockNumber
                        ._bn.should.eq.BN(1000000);
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await sleep(1500);

                    await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6});
                });

                it('should revert', async () => {
                    web3RevenueTokenManager.setReleaseBlockNumber(0, 1000000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('balanceBlocksIn()', () => {
            let wallet;
            
            before(() => {
                wallet = Wallet.createRandom().address;    
            });
            
            it('should call the calculation of the balance blocks calculator', async () => {
                (await ethersRevenueTokenManager.balanceBlocksIn(wallet, 4, 10))
                    ._bn.should.eq.BN(6); // Balance of 1 times block number span
            });
        });

        describe('releasedAmountBlocksIn()', () => {
            let wallet;

            before(() => {
                wallet = Wallet.createRandom().address;
            });

            it('should call the calculation of the released amount blocks calculator', async () => {
                (await ethersRevenueTokenManager.releasedAmountBlocksIn(4, 10))
                    ._bn.should.eq.BN(6); // Released amount of 1 times block number span
            });
        });
    });
};
