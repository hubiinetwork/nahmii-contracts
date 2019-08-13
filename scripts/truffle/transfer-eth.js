// cd node_modules/nahmii-contract-abstractions-ropsten
//
// cat > script.js << EOF

module.exports = async (callback) => {

    const from = process.env.FROM;
    const password = process.env.PASSWORD;
    const to = process.env.TO;
    const value = process.env.VALUE;
    const gasPrice = process.env.GAS_PRICE;

    try {
        await web3.eth.personal.unlockAccount(from, password, 600);

        const tx = {
            from,
            to,
            value: web3.utils.toWei(value, 'ether'),
            gasPrice,
            gas: '21000',
            nonce: await web3.eth.getTransactionCount(from)
        };

        const signedTx = await web3.eth.personal.signTransaction(tx, password);

        console.log(await web3.eth.sendSignedTransaction(signedTx.raw));

        callback()
    } catch (e) {
        callback(e);
    } finally {
        web3.eth.personal.lockAccount(from);
    }
};
// EOF
//
// cat script.js
