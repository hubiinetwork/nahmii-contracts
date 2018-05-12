const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const utils = require('ethers').utils;

chai.use(chaiAsPromised);
chai.should();

module.exports = function (glob) {
    describe.only('CommunityVote', () => {
        let ethersInstance;

        before(() => {
            ethersInstance = glob.ethersIoCommunityVote;
        });

        describe('getDoubleSpenders()', () => {
            it('should return 0', async () => {
                const result = await ethersInstance.getDoubleSpenders();
                result.should.equal(utils.bigNumberify(0));
            });
        });
        describe('getHighestAbsoluteDealNonce()', () => {
            it('should return 0', async () => {
                const result = await ethersInstance.getHighestAbsoluteDealNonce();
                result.should.equal(utils.bigNumberify(0));
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
