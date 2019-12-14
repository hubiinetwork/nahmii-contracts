const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet, utils} = require('ethers');
const {sleep} = require('../../scripts/common/helpers');
const {address0} = require('../mocks');
const {futureEpoch} = require('../helpers');

const NahmiiToken = artifacts.require('NahmiiToken');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('RevenueTokenManager', function () {
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
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3RevenueTokenManager.deployer.call()).should.equal(glob.owner);
                (await web3RevenueTokenManager.operator.call()).should.equal(glob.owner);
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
                    await web3RevenueTokenManager.setToken(Wallet.createRandom().address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setToken(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of token multi time-lock contract', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setToken(web3RevenueTokenManager.address)
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
                    await web3RevenueTokenManager.setBeneficiary(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setBeneficiary(address0)
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
            let releases;

            beforeEach(async () => {
                await web3NahmiiToken.mint(web3RevenueTokenManager.address, 120000);

                await web3RevenueTokenManager.setToken(web3NahmiiToken.address);

                releases = [];
                for (let i = 1; i <= 20; i++) {
                    releases.push({
                        blockNumber: i <= 10 ? 1000000 * i : 0,
                        earliestReleaseTime: futureEpoch(10 * i),
                        amount: 1000,
                        totalAmount: 0,
                        done: false
                    });
                }
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    await ethersRevenueTokenManager.connect(glob.signer_a).defineReleases(releases)
                        .should.be.rejected;
                });
            });

            describe('if token has not been set', () => {
                beforeEach(async () => {
                    web3RevenueTokenManager = await RevenueTokenManager.new(glob.owner);
                    ethersRevenueTokenManager = new Contract(web3RevenueTokenManager.address, RevenueTokenManager.abi, glob.signer_owner);

                    await web3NahmiiToken.mint(web3RevenueTokenManager.address, 1000);
                });

                it('should revert', async () => {
                    await ethersRevenueTokenManager.defineReleases(releases)
                        .should.be.rejected;
                });
            });

            describe('if posterior total locked amount becomes greater than contracts token balance', () => {
                beforeEach(() => {
                    releases[0].amount = 121000;
                });

                it('should revert', async () => {
                    await ethersRevenueTokenManager.defineReleases(releases)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    topic = ethersRevenueTokenManager.interface.events.DefineReleaseEvent.topics[0];
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: [topic]
                    };
                });

                it('should successfully define releases', async () => {
                    const result = await ethersRevenueTokenManager.defineReleases(
                        releases, {gasLimit: 5e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs.should.be.an('array').and.have.lengthOf(20);
                    logs[logs.length - 1].topics[0].should.equal(topic);

                    (await ethersRevenueTokenManager.totalLockedAmount())
                        ._bn.should.eq.BN(20000);
                    (await ethersRevenueTokenManager.releasesCount())
                        ._bn.should.eq.BN(20);
                    (await ethersRevenueTokenManager.executedReleasesCount())
                        ._bn.should.eq.BN(0);

                    (await ethersRevenueTokenManager.balanceRecordsCount(address0))
                        ._bn.should.eq.BN(0);

                    (await ethersRevenueTokenManager.recordBalance(address0, 0))
                        ._bn.should.eq.BN(0);
                    (await ethersRevenueTokenManager.recordBlockNumber(address0, 0))
                        ._bn.should.eq.BN(releases[0].blockNumber);

                    (await ethersRevenueTokenManager.recordBalance(address0, 10))
                        ._bn.should.eq.BN(0);
                    (await ethersRevenueTokenManager.recordBlockNumber(address0, 10))
                        ._bn.should.eq.BN(0);

                    (await ethersRevenueTokenManager.recordIndexByBlockNumber(address0, releases[0].blockNumber))
                        ._bn.should.eq.BN(0);
                    (await ethersRevenueTokenManager.recordIndexByBlockNumber(address0, releases[0].blockNumber + 10))
                        ._bn.should.eq.BN(0);

                    (await ethersRevenueTokenManager.recordIndexByBlockNumber(address0, releases[9].blockNumber))
                        ._bn.should.eq.BN(9);
                    (await ethersRevenueTokenManager.recordIndexByBlockNumber(address0, releases[9].blockNumber + 10))
                        ._bn.should.eq.BN(9);
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
                    await web3RevenueTokenManager.release(0, {from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if called with index of undefined release', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if release timer has not expired', () => {
                beforeEach(async () => {
                    await ethersRevenueTokenManager.defineReleases([{
                        blockNumber: 0,
                        earliestReleaseTime: futureEpoch(10),
                        amount: 1000,
                        totalAmount: 0,
                        done: false
                    }], {gasLimit: 5e6});
                });

                it('should revert', async () => {
                    await web3RevenueTokenManager.release(0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('if block number is preset', () => {
                    beforeEach(async () => {
                        await ethersRevenueTokenManager.defineReleases([{
                            blockNumber: 1000000,
                            earliestReleaseTime: futureEpoch(1),
                            amount: 1000,
                            totalAmount: 0,
                            done: false
                        }], {gasLimit: 5e6});

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

                        (await ethersRevenueTokenManager.balanceRecordsCount(address0))
                            ._bn.should.eq.BN(1);

                        (await ethersRevenueTokenManager.recordBalance(address0, 0))
                            ._bn.should.eq.BN(1000);
                        (await ethersRevenueTokenManager.recordBlockNumber(address0, 0))
                            ._bn.should.eq.BN(1000000);
                    });
                });

                describe('if block number is not preset', () => {
                    beforeEach(async () => {
                        await ethersRevenueTokenManager.defineReleases([{
                            blockNumber: 0,
                            earliestReleaseTime: futureEpoch(1),
                            amount: 1000,
                            totalAmount: 0,
                            done: false
                        }], {gasLimit: 5e6});

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

                        (await ethersRevenueTokenManager.balanceRecordsCount(address0))
                            ._bn.should.eq.BN(1);

                        (await ethersRevenueTokenManager.recordBalance(address0, 0))
                            ._bn.should.eq.BN(1000);
                        (await ethersRevenueTokenManager.recordBlockNumber(address0, 0))
                            ._bn.should.eq.BN(await provider.getBlockNumber());
                    });
                });
            });

            describe('if called with index that has already been released', () => {
                beforeEach(async () => {
                    await ethersRevenueTokenManager.defineReleases([{
                        blockNumber: 0,
                        earliestReleaseTime: futureEpoch(1),
                        amount: 1000,
                        totalAmount: 0,
                        done: false
                    }], {gasLimit: 5e6});

                    await sleep(1500);

                    await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6});
                });

                it('should revert', async () => {
                    await web3RevenueTokenManager.release(0, {from: glob.user_a, gas: 1e6})
                        .should.be.rejected;
                });
            });
        });

        describe('setReleaseBlockNumber', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(web3RevenueTokenManager.address, 120000);

                await web3RevenueTokenManager.setToken(web3NahmiiToken.address);
                await web3RevenueTokenManager.setBeneficiary(glob.user_a);

                await ethersRevenueTokenManager.defineReleases([{
                    blockNumber: 0,
                    earliestReleaseTime: futureEpoch(1),
                    amount: 1000,
                    totalAmount: 0,
                    done: false
                }], {gasLimit: 5e6});
            });

            describe('if called by non-beneficiary', () => {
                it('should revert', async () => {
                    await web3RevenueTokenManager.setReleaseBlockNumber(0, 1000000, {from: glob.user_b}).should.be.rejected;
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
                    await web3RevenueTokenManager.setReleaseBlockNumber(0, 1000000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('balanceRecordsCount()', () => {
            describe('if no release has been executed', () => {
                it('should equal value initialized', async () => {
                    (await ethersRevenueTokenManager.balanceRecordsCount(address0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('recordBalance()', () => {
            describe('if no release has been defined', () => {
                it('should revert', async () => {
                    await ethersRevenueTokenManager.recordBalance(address0, 0)
                        .should.be.rejected;
                });
            });
        });

        describe('recordBlockNumber()', () => {
            describe('if no release has been defined', () => {
                it('should revert', async () => {
                    await ethersRevenueTokenManager.recordBlockNumber(address0, 0)
                        .should.be.rejected;
                });
            });
        });

        describe('recordIndexByBlockNumber()', () => {
            describe('if no release has been defined', () => {
                it('should revert', async () => {
                    (await ethersRevenueTokenManager.recordIndexByBlockNumber(address0, 1000000))
                        ._bn.should.eq.BN(-1);
                });
            });
        });
    });
};
