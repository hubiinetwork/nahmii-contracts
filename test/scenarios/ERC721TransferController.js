const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const ERC721Token = artifacts.require('TestERC721');
const ERC721TransferController = artifacts.require('ERC721TransferController');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ERC721TransferController', function () {
        let web3ERC721, ethersERC721;
        let web3ERC721TransferController, ethersERC721TransferController;

        beforeEach(async () => {
            web3ERC721 = await ERC721Token.new();
            ethersERC721 = new Contract(web3ERC721.address, ERC721Token.abi, glob.signer_owner);

            web3ERC721TransferController = await ERC721TransferController.new();
            ethersERC721TransferController = new Contract(web3ERC721TransferController.address, ERC721TransferController.abi, glob.signer_owner);
        });

        describe('isFungible()', () => {
            it('should return false', async () => {
                (await web3ERC721TransferController.isFungible.call()).should.be.false;
            });
        });

        describe('standard()', () => {
            it('should return \'ERC20\'', async () => {
                (await web3ERC721TransferController.standard.call()).should.equal('ERC721');
            });
        });

        describe('receive()', () => {
            beforeEach(async () => {
                await web3ERC721.mint(glob.user_a, 10);
                await web3ERC721.approve(web3ERC721TransferController.address, 10, {from: glob.user_a, gas: 1e6});
            });

            describe('if id is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.receive(glob.user_a, glob.user_b, 0, web3ERC721.address, 0)
                        .should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.receive(glob.user_a, glob.user_b, 10, web3ERC721.address, 1)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully receive funds', async () => {
                    const result = await web3ERC721TransferController.receive(
                        glob.user_a, glob.user_b, 10, web3ERC721.address, 0, {gas: 1e6}
                    );

                    result.logs[0].event.should.equal('CurrencyTransferred');

                    (await ethersERC721.ownerOf(10)).should.equal(utils.getAddress(glob.user_b));
                });
            });
        });

        describe('approve()', () => {
            beforeEach(async () => {
                await web3ERC721.mint(web3ERC721TransferController.address, 10);
            });

            describe('if id is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.approve(glob.user_a, 0, web3ERC721.address, 0)
                        .should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.approve(glob.user_a, 10, web3ERC721.address, 1)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully approve', async () => {
                    await web3ERC721TransferController.approve(glob.user_a, 10, web3ERC721.address, 0, {gas: 1e6});

                    (await ethersERC721.getApproved(10))
                        .should.equal(utils.getAddress(glob.user_a));
                });
            });
        });

        describe('dispatch()', () => {
            beforeEach(async () => {
                await web3ERC721.mint(glob.user_a, 10);
                await web3ERC721.approve(web3ERC721TransferController.address, 10, {from: glob.user_a, gas: 1e6});
            });

            describe('if id is 0 or negative', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.dispatch(
                         glob.user_a, glob.user_b, 0, web3ERC721.address, 0
                    ).should.be.rejected;
                });
            });

            describe('if currency ID is non-zero', () => {
                it('should revert', async () => {
                    web3ERC721TransferController.dispatch(
                        glob.user_a, glob.user_b, 10, web3ERC721.address, 1
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully send funds', async () => {
                    const result = await web3ERC721TransferController.dispatch(
                        glob.user_a, glob.user_b, 10, web3ERC721.address, 0, {gas: 1e6}
                    );

                    result.logs[0].event.should.equal('CurrencyTransferred');

                    (await ethersERC721.ownerOf(10)).should.equal(utils.getAddress(glob.user_b));
                });
            });
        });
    });
};
