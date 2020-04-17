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
    describe.only('BalanceAucCalculator', function () {
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
                        {n: 2, b: utils.bigNumberify(10)}
                    ]);
                });

                it('should return zero', async () => {
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 0, 1
                    ))._bn.should.eq.BN(utils.bigNumberify(0)._bn);
                });
            });

            describe('if the count of balance records is 1', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: utils.bigNumberify(1000)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(utils.bigNumberify(1000)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(utils.bigNumberify(3000)._bn);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 6
                        ))._bn.should.eq.BN(utils.bigNumberify(4000)._bn);
                    });
                });

                describe('n_s > n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 7
                        ))._bn.should.eq.BN(utils.bigNumberify(4000)._bn);
                    });
                });
            });

            describe('if the count of balance records is 2', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: utils.bigNumberify(600)},
                        {n: 6, b: utils.bigNumberify(1000)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(utils.bigNumberify(600)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(utils.bigNumberify(1800)._bn);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 6
                        ))._bn.should.eq.BN(utils.bigNumberify(2800)._bn);
                    });
                });

                describe('n_s < n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 8
                        ))._bn.should.eq.BN(utils.bigNumberify(4800)._bn);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 5
                        ))._bn.should.eq.BN(utils.bigNumberify(1800)._bn);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 6
                        ))._bn.should.eq.BN(utils.bigNumberify(2800)._bn);
                    });
                });

                describe('n_s == n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 8
                        ))._bn.should.eq.BN(utils.bigNumberify(4800)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 6
                        ))._bn.should.eq.BN(utils.bigNumberify(2200)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(6200)._bn);
                    });
                });

                describe('n_s == n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(5000)._bn);
                    });
                });

                describe('n[1] < n_s && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(4000)._bn);
                    });
                });
            });

            describe('if the count of balance records is 3', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: utils.bigNumberify(600)}, // 2400
                        {n: 7, b: utils.bigNumberify(400)}, // 1200 (3600)
                        {n: 10, b: utils.bigNumberify(1000)}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(utils.bigNumberify(600)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(utils.bigNumberify(1800)._bn);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 7
                        ))._bn.should.eq.BN(utils.bigNumberify(2800)._bn);
                    });
                });

                describe('n_s < n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 8
                        ))._bn.should.eq.BN(utils.bigNumberify(3200)._bn);
                    });
                });

                describe('n_s < n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(4600)._bn);
                    });
                });

                describe('n_s < n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(7600)._bn);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 5
                        ))._bn.should.eq.BN(utils.bigNumberify(1800)._bn);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 7
                        ))._bn.should.eq.BN(utils.bigNumberify(2800)._bn);
                    });
                });

                describe('n_s == n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 8
                        ))._bn.should.eq.BN(utils.bigNumberify(3200)._bn);
                    });
                });

                describe('n_s == n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(4600)._bn);
                    });
                });

                describe('n_s == n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(7600)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 7
                        ))._bn.should.eq.BN(utils.bigNumberify(2200)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 8
                        ))._bn.should.eq.BN(utils.bigNumberify(2600)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(4000)._bn);
                    });
                });

                describe('n[0] < n_s < n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(7000)._bn);
                    });
                });

                describe('n_s == n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 9
                        ))._bn.should.eq.BN(utils.bigNumberify(1200)._bn);
                    });
                });

                describe('n_s == n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(2200)._bn);
                    });
                });

                describe('n_s == n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(5200)._bn);
                    });
                });

                describe('n[1] < n_s < n[2] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(1800)._bn);
                    });
                });

                describe('n[1] < n_s < n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(4800)._bn);
                    });
                });

                describe('n_s == n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 10, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(4000)._bn);
                    });
                });

                describe('n[2] < n_s && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 11, 13
                        ))._bn.should.eq.BN(utils.bigNumberify(3000)._bn);
                    });
                });
            });

            describe('if the count of balance records is 5', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: utils.bigNumberify(1000)},
                        {n: 5, b: utils.bigNumberify(700)},
                        {n: 8, b: utils.bigNumberify(1200)},
                        {n: 9, b: utils.bigNumberify(1100)},
                        {n: 11, b: utils.bigNumberify(800)}
                    ], {gasLimit: 5e6});
                });

                describe('n[0] < n_s < n_e < n[4]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(4800)._bn);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[4]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1, 10
                        ))._bn.should.eq.BN(utils.bigNumberify(7500)._bn);
                    });
                });

                describe('n_s < n[0] && n[4] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1, 12
                        ))._bn.should.eq.BN(utils.bigNumberify(9100)._bn);
                    });
                });
            });

            describe('if calculating for partial block number spans', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: utils.bigNumberify(1000)},
                        {n: 5, b: utils.bigNumberify(700)},
                        {n: 8, b: utils.bigNumberify(1200)},
                        {n: 9, b: utils.bigNumberify(1100)},
                        {n: 11, b: utils.bigNumberify(800)}
                    ], {gasLimit: 5e6});
                });

                it('should calculate the sum of partial calculations as the amount calculated for the complete block number span', async () => {
                    const partials = await Promise.all([
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1, 4
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 5, 7
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8, 11
                        ),
                        ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 12, 14
                        ),
                    ]);
                    const partialSum = partials.reduce((a, c) => a.add(c), utils.bigNumberify(0));
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 1, 14
                    ))._bn.should.eq.BN(partialSum._bn);
                });
            });
        });
    });
};
