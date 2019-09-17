// cd node_modules/nahmii-contract-abstractions
//
// cat > script.js << EOF

module.exports = async (callback) => {
    try {
        const from = process.env.FROM;         // Deployer
        const password = process.env.PASSWORD; // Deployer's password
        const message = process.env.MESSAGE;   // Message

        await web3.eth.personal.unlockAccount(from, password, 600); // 10min

        console.log(await web3.eth.sign(message, from));

        callback();
    } catch (e) {
        callback(e);
    } finally {
        await web3.eth.personal.lockAccount(from);
    }
};
// EOF
//
// FROM=%eth.mainnet.account% PASSWORD="%eth.mainnet.secret%" MESSAGE="[Etherscan.io 27/08/2019 13:54:19] I, hereby verify that I am the owner/creator of the address [0xac4f2f204b38390b92d0540908447d5ed352799a]" npx truffle exec script.js --network mainnet