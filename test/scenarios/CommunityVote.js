const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');

chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = function (glob) {
    describe('CommunityVote', () => {
        let ethersInstance;

        before(() => {
            ethersInstance = glob.ethersIoCommunityVote;
        });

        describe('isDoubleSpenderWallet()', () => {
            it('should return false', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersInstance.isDoubleSpenderWallet(address);
                result.should.be.false;
            });
        });

        describe('getHighestAbsoluteDealNonce()', () => {
            it('should return 0', async () => {
                const result = await ethersInstance.getHighestAbsoluteDealNonce();
                result.eq(utils.bigNumberify(0)).should.be.true;
            });
        });

        describe('isDataAvailable()', () => {
            it('should return true', async () => {
                const result = await ethersInstance.isDataAvailable();
                result.should.be.true;
            });
        });
    });
};
