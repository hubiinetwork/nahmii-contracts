module.exports = async (callback) => {

    const from = process.env.FROM;
    const startBlockNumber = process.env.START;
    const endBlockNumber = process.env.END;

    try {
        const startBalanceAmount = web3.utils.toBN(await web3.eth.getBalance(from, startBlockNumber));
        const endBalanceAmount = web3.utils.toBN(await web3.eth.getBalance(from, endBlockNumber));

        console.log(web3.utils.fromWei(endBalanceAmount.sub(startBalanceAmount)) + ' ETH');

        callback();
    } catch (e) {
        callback(e);
    }
};
