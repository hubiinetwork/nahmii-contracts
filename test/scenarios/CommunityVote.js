const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, utils} = require('ethers');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('CommunityVote', () => {
        let ethersInstance;

        before(() => {
            ethersInstance = glob.ethersIoCommunityVote;
        });

        describe('isDoubleSpenderWallet()', () => {
            it('should return false', async () => {
                const address = Wallet.createRandom().address;
                (await ethersInstance.isDoubleSpenderWallet(address))
                    .should.be.false;
            });
        });

        describe('getMaxDriipNonce()', () => {
            it('should return 0', async () => {
                (await ethersInstance.getMaxDriipNonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getMaxNullNonce()', () => {
            it('should return 0', async () => {
                (await ethersInstance.getMaxNullNonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isDataAvailable()', () => {
            it('should return true', async () => {
                (await ethersInstance.isDataAvailable())
                    .should.be.true;
            });
        });
    });
};
