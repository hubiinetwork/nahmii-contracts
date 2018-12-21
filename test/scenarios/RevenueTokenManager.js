const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const {sleep} = require('../../scripts/common/helpers');
const {futureEpoch} = require('../helpers');
const NahmiiToken = artifacts.require('NahmiiToken');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe.only('RevenueTokenManager', function () {
        let provider;
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

            await web3RevenueTokenManager.setToken(web3NahmiiToken.address);
            await web3RevenueTokenManager.setBeneficiary(glob.user_a);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3RevenueTokenManager.deployer.call()).should.equal(glob.owner);
                (await web3RevenueTokenManager.operator.call()).should.equal(glob.owner);
            });
        });

        describe('release()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('if called once', () => {
                    beforeEach(async () => {
                        await web3NahmiiToken.mint(web3RevenueTokenManager.address, 1000);

                        await web3RevenueTokenManager.defineReleases(
                            [futureEpoch(1)], [1000], []
                        );
                    });

                    it('should successfully release and update amount blocks', async () => {
                        await sleep(1500);

                        const result = await web3RevenueTokenManager.release(0);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersRevenueTokenManager.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.releasesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersRevenueTokenManager.executedReleasesCount())
                            ._bn.should.eq.BN(1);

                        (await ethersNahmiiToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(1000);

                        (await ethersRevenueTokenManager.totalReleasedAmounts(0))
                            ._bn.should.eq.BN(1000);
                        (await ethersRevenueTokenManager.totalReleasedAmountBlocks(0))
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.releaseBlockNumbers(0))
                            ._bn.should.eq.BN(await provider.getBlockNumber());
                    });
                });

                describe('if called twice', () => {
                    beforeEach(async () => {
                        await web3NahmiiToken.mint(web3RevenueTokenManager.address, 2000);

                        await web3RevenueTokenManager.defineReleases(
                            [futureEpoch(1), futureEpoch(2)], [1000, 1000], []
                        );
                    });

                    it('should successfully release and update amount blocks', async () => {
                        await sleep(2500);

                        let result = await web3RevenueTokenManager.release(0);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        result = await web3RevenueTokenManager.release(1);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReleaseEvent');

                        (await ethersRevenueTokenManager.totalLockedAmount())
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.releasesCount())
                            ._bn.should.eq.BN(2);
                        (await ethersRevenueTokenManager.executedReleasesCount())
                            ._bn.should.eq.BN(2);

                        (await ethersNahmiiToken.balanceOf(glob.user_a))
                            ._bn.should.eq.BN(2000);

                        (await ethersRevenueTokenManager.totalReleasedAmounts(0))
                            ._bn.should.eq.BN(1000);
                        (await ethersRevenueTokenManager.totalReleasedAmounts(1))
                            ._bn.should.eq.BN(2000);
                        (await ethersRevenueTokenManager.totalReleasedAmountBlocks(0))
                            ._bn.should.eq.BN(0);
                        (await ethersRevenueTokenManager.totalReleasedAmountBlocks(1))
                            ._bn.should.eq.BN(1000);
                        (await ethersRevenueTokenManager.releaseBlockNumbers(0))
                            ._bn.should.eq.BN((await provider.getBlockNumber()) - 1);
                        (await ethersRevenueTokenManager.releaseBlockNumbers(1))
                            ._bn.should.eq.BN(await provider.getBlockNumber());
                    });
                });
            });
        });

        describe('releasedAmountBlocksIn()', () => {
            describe('if called with the lower block above the higher block number', () => {
                it('should revert', async () => {
                    web3RevenueTokenManager.releasedAmountBlocksIn.call(10, 5)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3NahmiiToken.mint(web3RevenueTokenManager.address, 6000);

                    await web3RevenueTokenManager.defineReleases(
                        [futureEpoch(1), futureEpoch(1), futureEpoch(1)],
                        [1000, 2000, 3000],
                        []
                    );

                    await sleep(1500);

                    await web3RevenueTokenManager.release(0);
                    await web3RevenueTokenManager.release(1);
                    await web3RevenueTokenManager.release(2);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully release and update amount blocks', async () => {
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber - 3, blockNumber - 2))
                        ._bn.should.eq.BN(0);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber - 2, blockNumber - 1))
                        ._bn.should.eq.BN(1000);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber - 2, blockNumber))
                        ._bn.should.eq.BN(4000);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber - 2, blockNumber + 1))
                        ._bn.should.eq.BN(10000);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber - 1, blockNumber + 1))
                        ._bn.should.eq.BN(9000);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber, blockNumber + 1))
                        ._bn.should.eq.BN(6000);
                    (await ethersRevenueTokenManager.releasedAmountBlocksIn(blockNumber + 1, blockNumber + 2))
                        ._bn.should.eq.BN(6000);
                });
            });
        });
    });
};
