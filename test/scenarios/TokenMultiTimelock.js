const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet} = require('ethers');
const {address0} = require('../mocks');
const {sleep, futureEpoch} = require('../helpers');
const RevenueToken = artifacts.require('RevenueToken');
const TokenMultiTimelock = artifacts.require('TokenMultiTimelock');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('TokenMultiTimelock', function () {
        let provider;
        let web3RevenueToken, ethersRevenueToken;
        let web3TokenMultiTimelock, ethersTokenMultiTimelock;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3TokenMultiTimelock = await TokenMultiTimelock.new(glob.owner);
            ethersTokenMultiTimelock = new Contract(web3TokenMultiTimelock.address, TokenMultiTimelock.abi, glob.signer_owner);

            web3RevenueToken = await RevenueToken.new();
            ethersRevenueToken = new Contract(web3RevenueToken.address, RevenueToken.abi, glob.signer_owner);

            await web3RevenueToken.mint(web3TokenMultiTimelock.address, 10000);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3TokenMultiTimelock.deployer.call()).should.equal(glob.owner);
                (await web3TokenMultiTimelock.operator.call()).should.equal(glob.owner);
            });
        });

        describe('token()', () => {
            it('should equal value initialized', async () => {
                (await web3TokenMultiTimelock.token.call())
                    .should.equal(address0);
            });
        });

        describe('beneficiary()', () => {
            it('should equal value initialized', async () => {
                (await web3TokenMultiTimelock.beneficiary.call())
                    .should.equal(address0);
            });
        });

        describe('totalLockedAmount()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenMultiTimelock.totalLockedAmount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('releasesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenMultiTimelock.releasesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('executedReleasesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersTokenMultiTimelock.executedReleasesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setToken()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setToken(Wallet.createRandom().address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setToken(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of token multi time-lock contract', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setToken(web3TokenMultiTimelock.address)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let tokenAddress;

                beforeEach(async () => {
                    tokenAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3TokenMultiTimelock.setToken(tokenAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTokenEvent');

                    (await ethersTokenMultiTimelock.token())
                        .should.equal(tokenAddress);
                });
            });
        });

        describe('setBeneficiary()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setBeneficiary(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setBeneficiary(address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let beneficiaryAddress;

                beforeEach(async () => {
                    beneficiaryAddress = Wallet.createRandom().address;
                });

                it('should successfully set token', async () => {
                    const result = await web3TokenMultiTimelock.setBeneficiary(beneficiaryAddress);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBeneficiaryEvent');

                    (await ethersTokenMultiTimelock.beneficiary())
                        .should.equal(beneficiaryAddress);
                });
            });
        });

        describe('defineReleases()', () => {
            let earliestReleaseTimes, amounts, blockNumbers;

            beforeEach(async () => {
                await web3TokenMultiTimelock.setToken(web3RevenueToken.address);

                earliestReleaseTimes = [futureEpoch(10), futureEpoch(20), futureEpoch(30)];
                amounts = [1000, 2000, 3000];
                blockNumbers = [1000000, 2000000];
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if token has not been set', () => {
                beforeEach(async () => {
                    web3TokenMultiTimelock = await TokenMultiTimelock.new(glob.owner);
                    ethersTokenMultiTimelock = new Contract(web3TokenMultiTimelock.address, TokenMultiTimelock.abi, glob.signer_owner);

                    await web3RevenueToken.mint(web3TokenMultiTimelock.address, 1000);
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if number of release times differs from number of amounts', () => {
                beforeEach(() => {
                    amounts.push(4000);
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if number of release times is smaller than the count of block numbers', () => {
                beforeEach(() => {
                    blockNumbers.push(4000000);
                    blockNumbers.push(5000000);
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if posterior total locked amount becomes greater than contracts token balance', () => {
                it('should revert', async () => {
                    earliestReleaseTimes.push(futureEpoch(40));
                    amounts.push(10000);

                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully define release', async () => {
                    const result = await web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(3);
                    result.logs[0].event.should.equal('AddReleaseEvent');

                    (await ethersTokenMultiTimelock.totalLockedAmount())
                        ._bn.should.eq.BN(6000);
                    (await ethersTokenMultiTimelock.releasesCount())
                        ._bn.should.eq.BN(3);
                    (await ethersTokenMultiTimelock.executedReleasesCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('release()', () => {
            beforeEach(async () => {
                await web3TokenMultiTimelock.setToken(web3RevenueToken.address);
                await web3TokenMultiTimelock.setBeneficiary(glob.user_a);

                await web3TokenMultiTimelock.defineReleases(
                    [futureEpoch(1)], [1000], []
                );
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with non-existent index', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.release(1).should.be.rejected;
                });
            });

            describe('if release timer has not expired', () => {
                beforeEach(async () => {
                    await web3RevenueToken.mint(web3TokenMultiTimelock.address, 1000);

                    await web3TokenMultiTimelock.defineReleases(
                        [futureEpoch(10)], [1000], []
                    );
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.release(1).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully release', async () => {
                    await sleep(1500);

                    const result = await web3TokenMultiTimelock.release(0, {gas: 1e6});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ReleaseEvent');

                    (await ethersTokenMultiTimelock.totalLockedAmount())
                        ._bn.should.eq.BN(0);
                    (await ethersTokenMultiTimelock.releasesCount())
                        ._bn.should.eq.BN(1);
                    (await ethersTokenMultiTimelock.executedReleasesCount())
                        ._bn.should.eq.BN(1);

                    (await ethersRevenueToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(1000);
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await sleep(1500);

                    await web3TokenMultiTimelock.release(0, {gas: 1e6});
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {gas: 1e6}).should.be.rejected;
                });
            });
        });
    });
};
