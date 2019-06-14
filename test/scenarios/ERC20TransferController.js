const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const ERC20Token = artifacts.require('TestERC20');
const ERC20TransferController = artifacts.require('ERC20TransferController');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ERC20TransferController', function () {
        let web3ERC20, ethersERC20;
        let web3ERC20TransferController, ethersERC20TransferController;

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            web3ERC20TransferController = await ERC20TransferController.new();
            ethersERC20TransferController = new Contract(web3ERC20TransferController.address, ERC20TransferController.abi, glob.signer_owner);
        });

        describe('isFungible()', () => {
            it('should return true', async () => {
                (await web3ERC20TransferController.isFungible.call()).should.be.true;
            });
        });

        describe('standard()', () => {
            it('should return \'ERC20\'', async () => {
                (await web3ERC20TransferController.standard.call()).should.equal('ERC20');
            });
        });

        describe('receive()', () => {
            beforeEach(async () => {
                await web3ERC20.mint(glob.user_a, 100);
                await web3ERC20.approve(web3ERC20TransferController.address, 10, {from: glob.user_a, gas: 1e6});
            });

            describe('if amount is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.receive(glob.user_a, glob.user_b, 0, web3ERC20.address, 0)
                        .should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.receive(glob.user_a, glob.user_b, 10, web3ERC20.address, 1)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully receive funds', async () => {
                    const result = await web3ERC20TransferController.receive(
                        glob.user_a, glob.user_b, 10, web3ERC20.address, 0, {gas: 1e6}
                    );

                    result.logs[0].event.should.equal('CurrencyTransferred');

                    (await ethersERC20.balanceOf(glob.user_a))._bn.should.eq.BN(90);
                    (await ethersERC20.balanceOf(glob.user_b))._bn.should.eq.BN(10);
                });
            });
        });

        describe('approve()', () => {
            beforeEach(async () => {
                await web3ERC20.mint(web3ERC20TransferController.address, 100);
            });

            describe('if amount is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.approve(glob.user_a, 0, web3ERC20.address, 0)
                        .should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.approve(glob.user_a, 10, web3ERC20.address, 1)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully approve', async () => {
                    await web3ERC20TransferController.approve(glob.user_a, 10, web3ERC20.address, 0, {gas: 1e6});

                    (await ethersERC20.allowance(web3ERC20TransferController.address, glob.user_a))
                        ._bn.should.eq.BN(10);
                });
            });
        });

        describe('dispatch()', () => {
            beforeEach(async () => {
                await web3ERC20.mint(web3ERC20TransferController.address, 100);
            });

            describe('if amount is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.dispatch(
                        web3ERC20TransferController.address, glob.user_a, 0, web3ERC20.address, 0
                    ).should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC20TransferController.dispatch(
                        web3ERC20TransferController.address, glob.user_a, 10, web3ERC20.address, 1
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully send funds', async () => {
                    const result = await web3ERC20TransferController.dispatch(
                        web3ERC20TransferController.address, glob.user_a, 10, web3ERC20.address, 0, {gas: 1e6}
                    );

                    result.logs[0].event.should.equal('CurrencyTransferred');

                    (await ethersERC20.balanceOf(glob.user_a))._bn.should.eq.BN(10);
                });
            });
        });
    });
};
