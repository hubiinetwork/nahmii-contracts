const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const CommunityVote = artifacts.require('CommunityVote');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('CommunityVote', () => {
        let web3CommunityVote, ethersCommunityVote;

        before(async () => {
            web3CommunityVote = await CommunityVote.deployed();
            ethersCommunityVote = new Contract(web3CommunityVote.address, CommunityVote.abi, glob.signer_owner);
        });

        describe('isDoubleSpenderWallet()', () => {
            it('should return false', async () => {
                const address = Wallet.createRandom().address;
                (await ethersCommunityVote.isDoubleSpenderWallet(address))
                    .should.be.false;
            });
        });

        describe('getMaxDriipNonce()', () => {
            it('should return 0', async () => {
                (await ethersCommunityVote.getMaxDriipNonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getMaxNullNonce()', () => {
            it('should return 0', async () => {
                (await ethersCommunityVote.getMaxNullNonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isDataAvailable()', () => {
            it('should return true', async () => {
                (await ethersCommunityVote.isDataAvailable())
                    .should.be.true;
            });
        });
    });
};
