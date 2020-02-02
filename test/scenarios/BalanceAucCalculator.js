const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet} = require('ethers');

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
                        {n: 2, b: 10}
                    ]);
                });

                it('should return zero', async () => {
                    (await ethersBalanceAucCalculator.calculate(
                        ethersBalanceRecordable.address, wallet, 0, 1
                    ))._bn.should.eq.BN(0);
                });
            });

            describe('if the count of balance records is 1', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: 1000}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(1000);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(3000);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 6
                        ))._bn.should.eq.BN(4000);
                    });
                });

                describe('n_s > n[0] && n[0] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 7
                        ))._bn.should.eq.BN(4000);
                    });
                });
            });

            describe('if the count of balance records is 2', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: 600},
                        {n: 6, b: 1000}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(600);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(1800);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 6
                        ))._bn.should.eq.BN(2800);
                    });
                });

                describe('n_s < n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 8
                        ))._bn.should.eq.BN(4800);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 5
                        ))._bn.should.eq.BN(1800);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 6
                        ))._bn.should.eq.BN(2800);
                    });
                });

                describe('n_s == n[0] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 8
                        ))._bn.should.eq.BN(4800);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 6
                        ))._bn.should.eq.BN(2200);
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 10
                        ))._bn.should.eq.BN(6200);
                    });
                });

                describe('n_s == n[1] && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6, 10
                        ))._bn.should.eq.BN(5000);
                    });
                });

                describe('n[1] < n_s && n[1] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 10
                        ))._bn.should.eq.BN(4000);
                    });
                });
            });

            describe('if the count of balance records is 3', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: 600}, // 2400
                        {n: 7, b: 400}, // 1200 (3600)
                        {n: 10, b: 1000}
                    ], {gasLimit: 5e6});
                });

                describe('n_s < n[0] && n_e == n[0]', () => {
                    it('should return 0', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 3
                        ))._bn.should.eq.BN(600);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 5
                        ))._bn.should.eq.BN(1800);
                    });
                });

                describe('n_s < n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 7
                        ))._bn.should.eq.BN(2800);
                    });
                });

                describe('n_s < n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 8
                        ))._bn.should.eq.BN(3200);
                    });
                });

                describe('n_s < n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 10
                        ))._bn.should.eq.BN(4600);
                    });
                });

                describe('n_s < n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 2, 13
                        ))._bn.should.eq.BN(7600);
                    });
                });

                describe('n_s == n[0] && n[0] < n_e < n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 5
                        ))._bn.should.eq.BN(1800);
                    });
                });

                describe('n_s == n[0] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 7
                        ))._bn.should.eq.BN(2800);
                    });
                });

                describe('n_s == n[0] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 8
                        ))._bn.should.eq.BN(3200);
                    });
                });

                describe('n_s == n[0] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 10
                        ))._bn.should.eq.BN(4600);
                    });
                });

                describe('n_s == n[0] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 3, 13
                        ))._bn.should.eq.BN(7600);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[1]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 7
                        ))._bn.should.eq.BN(2200);
                    });
                });

                describe('n[0] < n_s < n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 8
                        ))._bn.should.eq.BN(2600);
                    });
                });

                describe('n[0] < n_s < n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 10
                        ))._bn.should.eq.BN(4000);
                    });
                });

                describe('n[0] < n_s < n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 4, 13
                        ))._bn.should.eq.BN(7000);
                    });
                });

                describe('n_s == n[1] && n[1] < n_e < n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 9
                        ))._bn.should.eq.BN(1200);
                    });
                });

                describe('n_s == n[1] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 10
                        ))._bn.should.eq.BN(2200);
                    });
                });

                describe('n_s == n[1] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 7, 13
                        ))._bn.should.eq.BN(5200);
                    });
                });

                describe('n[1] < n_s < n[2] && n_e == n[2]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8, 10
                        ))._bn.should.eq.BN(1800);
                    });
                });

                describe('n[1] < n_s < n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 8, 13
                        ))._bn.should.eq.BN(4800);
                    });
                });

                describe('n_s == n[2] && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 10, 13
                        ))._bn.should.eq.BN(4000);
                    });
                });

                describe('n[2] < n_s && n[2] < n_e', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 11, 13
                        ))._bn.should.eq.BN(3000);
                    });
                });
            });

            describe('if the count of balance records is 5', () => {
                beforeEach(async () => {
                    await ethersBalanceRecordable._addBalanceRecords([
                        {n: 3, b: 1000},
                        {n: 5, b: 700},
                        {n: 8, b: 1200},
                        {n: 9, b: 1100},
                        {n: 11, b: 800}
                    ], {gasLimit: 5e6});
                });

                describe('n[0] < n_s < n_e < n[4]', () => {
                    it('should calculate the AUC', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 6, 10
                        ))._bn.should.eq.BN(4800);
                    });
                });

                describe('n_s < n[0] && n[0] < n_e < n[4]', () => {
                    it('should calculate the AUC by clamping n_s to n[0]', async () => {
                        (await ethersBalanceAucCalculator.calculate(
                            ethersBalanceRecordable.address, wallet, 1, 10
                        ))._bn.should.eq.BN(7500);
                    });
                });
            });
        });
    });
};
