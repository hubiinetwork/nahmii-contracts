const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet, utils} = require('ethers');

const BalanceAucCalculator = artifacts.require('BalanceAucCalculator');
const MockedBalanceRecordable = artifacts.require('MockedBalanceRecordable');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('BalanceAucCalculator', function () {
        let provider;
        let web3BalanceAucCalculator, ethersBalanceAucCalculator;
        let web3BalanceRecordable, ethersBalanceRecordable;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3BalanceAucCalculator = await BalanceAucCalculator.new();
            ethersBalanceAucCalculator = new Contract(web3BalanceAucCalculator.address, BalanceAucCalculator.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3BalanceRecordable = await MockedBalanceRecordable.new();
            ethersBalanceRecordable = new Contract(web3BalanceRecordable.address, MockedBalanceRecordable.abi, glob.signer_owner);
        });

        describe('calculate(BalanceRecordable, address, uint256 n_s, uint256 n_e)', () => {
            let wallet;

            beforeEach(() => {
                wallet = Wallet.createRandom().address;
            });

            describe('if start block is greater than end block', () => {
                it('should return zero', async () => {
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 1, 0
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if the count of balance records is 0', () => {
                it('should return zero', async () => {
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 0, 1
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if the end block number is less than the first record\'s block number', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 2000000, b: utils.parseUnits('10', 15)}
                    ]);
                });

                it('should return zero', async () => {
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 0, 1
                    ))._bn.should.eq.BN(utils.parseUnits('0', 15)._bn);
                });
            });

            describe('if the count of balance records is 1', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3000000, b: utils.parseUnits('1000', 15)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 3000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 5000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(2000001)._bn);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 6000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(3000001)._bn);
                    });
                });

                describe('n_s > n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 7000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(3000001)._bn);
                    });
                });
            });

            describe('if the count of balance records is 2', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3000000, b: utils.parseUnits('600', 15)},
                        {n: 6000000, b: utils.parseUnits('1000', 15)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 3000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 5000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15).mul(2000001)._bn);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 6000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 8000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15).mul(2000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 5000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15).mul(2000001)._bn);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 6000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 8000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15).mul(2000001))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 6000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(2000000)
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(2000000)
                                .add(utils.parseUnits('1000', 15).mul(4000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6000000, 10000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(4000001)._bn);
                    });
                });

                describe('n[1] < n_s && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7000000, 10000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(3000001)._bn);
                    });
                });
            });

            describe('if the count of balance records is 3', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3000000, b: utils.parseUnits('600', 15)}, // 2400
                        {n: 7000000, b: utils.parseUnits('400', 15)}, // 1200 (3600)
                        {n: 10000000, b: utils.parseUnits('1000', 15)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 3000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 5000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15).mul(2000001)._bn);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 7000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 8000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(1000001))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2000000, 13000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15).mul(3000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 5000000
                        ))._bn.should.eq.BN(utils.parseUnits('600', 15).mul(2000001)._bn);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 7000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 8000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(1000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3000000, 13000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(4000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15).mul(3000001))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 7000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('400', 15))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 8000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('400', 15).mul(1000001))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n[0] < n_s < n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4000000, 13000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('600', 15).mul(3000000)
                                .add(utils.parseUnits('400', 15).mul(3000000))
                                .add(utils.parseUnits('1000', 15).mul(3000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7000000, 9000000
                        ))._bn.should.eq.BN(utils.parseUnits('400', 15).mul(2000001)._bn
                        );
                    });
                });

                describe('n_s == n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('400', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7000000, 13000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('400', 15).mul(3000000)
                                .add(utils.parseUnits('1000', 15).mul(3000001))
                                ._bn
                        );
                    });
                });

                describe('n[1] < n_s < n[2] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('400', 15).mul(2000000)
                                .add(utils.parseUnits('1000', 15))
                                ._bn
                        );
                    });
                });

                describe('n[1] < n_s < n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8000000, 13000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('400', 15).mul(2000000)
                                .add(utils.parseUnits('1000', 15).mul(3000001))
                                ._bn
                        );
                    });
                });

                describe('n_s == n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 10000000, 13000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(3000001)._bn);
                    });
                });

                describe('n[2] < n_s && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 11000000, 13000000
                        ))._bn.should.eq.BN(utils.parseUnits('1000', 15).mul(2000001)._bn);
                    });
                });
            });

            describe('if the count of balance records is 5', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3000000, b: utils.parseUnits('1000', 15)},
                        {n: 5000000, b: utils.parseUnits('700', 15)},
                        {n: 8000000, b: utils.parseUnits('1200', 15)},
                        {n: 9000000, b: utils.parseUnits('1100', 15)},
                        {n: 11000000, b: utils.parseUnits('800', 15)}
                    ], {gasLimit: 5e6});
                });

                describe('n[0] < n_s < n_e < n[4]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('700', 15).mul(2000000)
                                .add(utils.parseUnits('1200', 15).mul(1000000))
                                .add(utils.parseUnits('1100', 15).mul(1000001))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[4]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1000000, 10000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('1000', 15).mul(2000000)
                                .add(utils.parseUnits('700', 15).mul(3000000))
                                .add(utils.parseUnits('1200', 15).mul(1000000))
                                .add(utils.parseUnits('1100', 15).mul(1000001))
                                ._bn
                        );
                    });
                });

                describe('n_s < n[0] && n[4] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1000000, 12000000
                        ))._bn.should.eq.BN(
                            utils.parseUnits('1000', 15).mul(2000000)
                                .add(utils.parseUnits('700', 15).mul(3000000))
                                .add(utils.parseUnits('1200', 15).mul(1000000))
                                .add(utils.parseUnits('1100', 15).mul(2000000))
                                .add(utils.parseUnits('800', 15).mul(1000001))
                                ._bn
                        );
                    });
                });
            });

            describe('if calculating for deterministic partial block number spans', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3000000, b: utils.parseUnits('1000', 15)},
                        {n: 5000000, b: utils.parseUnits('700', 15)},
                        {n: 8000000, b: utils.parseUnits('1200', 15)},
                        {n: 9000000, b: utils.parseUnits('1100', 15)},
                        {n: 11000000, b: utils.parseUnits('800', 15)}
                    ], {gasLimit: 5e6});
                });

                it('should calculate the sum of partial calculations as the amount calculated for the complete block number span', async () => {
                    const partials = await Promise.all([
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1000000, 4999999
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 5000000, 7999999
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8000000, 11999999
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 12000000, 14000000
                        ),
                    ]);
                    const partialSum = partials.reduce((a, c) => a.add(c), utils.bigNumberify(0));
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 1000000, 14000000
                    ))._bn.should.eq.BN(partialSum._bn);
                });
            });

            describe('if calculating for random partial block number spans', () => {
                let minBlock, maxBlock, partitions;

                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min) + min);
                }

                beforeEach(async () => {
                    minBlock = 1234;
                    maxBlock = 12345678;
                    const maxBalance = 1234;
                    const numBalanceRecords = 10;

                    const balanceRecords = [...Array(numBalanceRecords).keys()]
                        .map(() => ({
                            n: getRandomInt(minBlock, maxBlock),
                            b: utils.parseUnits(getRandomInt(0, maxBalance).toString())
                        }))
                        .sort((d1, d2) => d1.n - d2.n)

                    await ethersBalanceRecordable._addBalanceRecords(balanceRecords, {gasLimit: 5e6});

                    const numPartitions = 4;
                    partitions = [...Array(numPartitions).keys()]
                        .map(() => getRandomInt(minBlock, maxBlock))
                        .sort((d1, d2) => d1 - d2)
                        .map((d, i, arr) =>
                            ({
                                lowerBlock: i === 0 ? getRandomInt(minBlock, d) : arr[i - 1] + 1,
                                upperBlock: i < arr.length - 1 ? d : getRandomInt(d, maxBlock)
                            })
                        );
                });

                it('should calculate the sum of partial calculations as the amount calculated for the complete block number span', async () => {
                    const partials = await Promise.all(partitions.map(({lowerBlock, upperBlock}) =>
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, lowerBlock, upperBlock
                        )
                    ));

                    const partialSum = partials.reduce((a, c) => a.add(c), utils.bigNumberify(0));

                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet,
                        partitions[0].lowerBlock, partitions[partitions.length - 1].upperBlock
                    ))._bn.should.eq.BN(partialSum._bn);
                });
            });
        });
    });
};
