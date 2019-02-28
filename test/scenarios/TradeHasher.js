const chai = require('chai');
const mocks = require('../mocks');
const {Contract} = require('ethers');
const TradeHasher = artifacts.require('TradeHasher');

chai.should();

module.exports = function (glob) {
    describe('TradeHasher', () => {
        let web3TradeHasher, ethersTradeHasher;

        before(async () => {
            web3TradeHasher = await TradeHasher.new(glob.owner);
            ethersTradeHasher = new Contract(web3TradeHasher.address, TradeHasher.abi, glob.signer_owner);
        });

        describe('hashTrade()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashTrade(trade);
                result.should.equal(trade.seal.hash)
            });
        });

        describe('hashOrderAsWallet()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashOrderAsWallet(order);
                result.should.equal(order.seals.wallet.hash);
            });
        });

        describe('hashOrderAsOperator()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashOrderAsOperator(order);
                result.should.equal(order.seals.operator.hash);
            });
        });
    });
};
