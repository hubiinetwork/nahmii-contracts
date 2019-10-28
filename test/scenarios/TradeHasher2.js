const chai = require('chai');
const mocks2 = require('../mocks2');
const {Contract} = require('ethers');
const TradeHasher2 = artifacts.require('TradeHasher2');

chai.should();

module.exports = function (glob) {
    describe('TradeHasher2', () => {
        let web3TradeHasher, ethersTradeHasher;

        before(async () => {
            web3TradeHasher = await TradeHasher2.new(glob.owner);
            ethersTradeHasher = new Contract(web3TradeHasher.address, TradeHasher2.abi, glob.signer_owner);
        });

        describe('hashTrade()', () => {
            let trade;

            before(async () => {
                trade = await mocks2.mockTrade(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashTrade(trade);
                result.should.equal(trade.seal.hash)
            });
        });

        describe('hashOrderAsWallet()', () => {
            let order;

            before(async () => {
                order = await mocks2.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashOrderAsWallet(order);
                result.should.equal(order.seals.wallet.hash);
            });
        });

        describe('hashOrderAsOperator()', () => {
            let order;

            before(async () => {
                order = await mocks2.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersTradeHasher.hashOrderAsOperator(order);
                result.should.equal(order.seals.operator.hash);
            });
        });
    });
};
