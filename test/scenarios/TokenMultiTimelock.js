const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet} = require('ethers');
const {sleep} = require('../../scripts/common/helpers');
const {address0} = require('../mocks');
const {futureEpoch} = require('../helpers');
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
                await web3RevenueToken.mint(web3TokenMultiTimelock.address, 120000);

                await web3TokenMultiTimelock.setToken(web3RevenueToken.address);

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
                    earliestReleaseTimes = [futureEpoch(10)];
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if posterior total locked amount becomes greater than contracts token balance', () => {
                beforeEach(() => {
                    amounts[0] = 121000;
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully define releases', async () => {
                    const result = await web3TokenMultiTimelock.defineReleases(
                        earliestReleaseTimes, amounts, blockNumbers, {gas: 5e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(60);
                    result.logs[0].event.should.equal('DefineReleaseEvent');

                    (await ethersTokenMultiTimelock.totalLockedAmount())
                        ._bn.should.eq.BN(60000);
                    (await ethersTokenMultiTimelock.releasesCount())
                        ._bn.should.eq.BN(60);
                    (await ethersTokenMultiTimelock.executedReleasesCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('release()', () => {
            beforeEach(async () => {
                await web3RevenueToken.mint(web3TokenMultiTimelock.address, 120000);

                await web3TokenMultiTimelock.setToken(web3RevenueToken.address);
                await web3TokenMultiTimelock.setBeneficiary(glob.user_a);
            });

            describe('if called by non-beneficiary', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called with index of undefined release', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if release timer has not expired', () => {
                beforeEach(async () => {
                    await web3TokenMultiTimelock.defineReleases(
                        [futureEpoch(10)], [1000], []
                    );
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('if block number is preset', () => {
                    beforeEach(async () => {
                        await web3TokenMultiTimelock.defineReleases(
                            [futureEpoch(1)], [1000], [1000000]
                        );

                        await sleep(1500);
                    });

                    it('should successfully release with preset block number', async () => {
                        const result = await web3TokenMultiTimelock.release(0, {from: glob.user_a, gas: 1e6});

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersTokenMultiTimelock.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersTokenMultiTimelock.releasesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersTokenMultiTimelock.executedReleasesCount())
                            ._bn.should.eq.BN(1);

                        const release = await ethersTokenMultiTimelock.releases(0);
                        release.done.should.be.true;
                        release.blockNumber._bn.should.eq.BN(1000000);

                        (await ethersRevenueToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(1000);
                    });
                });

                describe('if block number is not preset', () => {
                    beforeEach(async () => {
                        await web3TokenMultiTimelock.defineReleases(
                            [futureEpoch(1)], [1000], []
                        );

                        await sleep(1500);
                    });

                    it('should successfully release with current block number', async () => {
                        const result = await web3TokenMultiTimelock.release(0, {from: glob.user_a, gas: 1e6});

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersTokenMultiTimelock.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersTokenMultiTimelock.releasesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersTokenMultiTimelock.executedReleasesCount())
                            ._bn.should.eq.BN(1);

                        const release = await ethersTokenMultiTimelock.releases(0);
                        release.done.should.be.true;
                        release.blockNumber._bn.should.eq.BN(await provider.getBlockNumber());

                        (await ethersRevenueToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(1000);
                    });
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await web3TokenMultiTimelock.defineReleases(
                        [futureEpoch(1)], [1000], []
                    );

                    await sleep(1500);

                    await web3TokenMultiTimelock.release(0, {from: glob.user_a, gas: 1e6});
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.release(0, {from: glob.user_a, gas: 1e6}).should.be.rejected;
                });
            });
        });

        describe('setReleaseBlockNumber', () => {
            beforeEach(async () => {
                await web3RevenueToken.mint(web3TokenMultiTimelock.address, 120000);

                await web3TokenMultiTimelock.setToken(web3RevenueToken.address);
                await web3TokenMultiTimelock.setBeneficiary(glob.user_a);

                await web3TokenMultiTimelock.defineReleases(
                    [futureEpoch(1)], [1000], []
                );
            });

            describe('if called by non-beneficiary', () => {
                it('should revert', async () => {
                    web3TokenMultiTimelock.setReleaseBlockNumber(0, 1000000, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called with index that has not been released', () => {
                it('should successfully update the release block number', async () => {
                    const result = await web3TokenMultiTimelock.setReleaseBlockNumber(0, 1000000, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetReleaseBlockNumberEvent');

                    (await ethersTokenMultiTimelock.releases(0)).blockNumber
                        ._bn.should.eq.BN(1000000);
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await sleep(1500);

                    await web3TokenMultiTimelock.release(0, {from: glob.user_a, gas: 1e6});
                });

                it('should revert', async () => {
                    web3TokenMultiTimelock.setReleaseBlockNumber(0, 1000000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });
    });
};
