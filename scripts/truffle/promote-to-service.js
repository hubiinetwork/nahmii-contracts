// cd node_modules/nahmii-contract-abstractions-ropsten
//
// cat > script.js << EOF

const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementState = artifacts.require('NullSettlementState');

module.exports = async (callback) => {

    const from = process.env.FROM;         // Deployer
    const password = process.env.PASSWORD; // Deployer's password
    const to = process.env.TO;             // The service

    try {
        await web3.eth.personal.unlockAccount(from, password, 1800); // 30min

        // #### DriipSettlementState ####

        const web3DriipSettlementState = await DriipSettlementState.deployed();

        if (!(await web3DriipSettlementState.isRegisteredService.call(to)))
            await web3DriipSettlementState.registerService(to);
        if (!(await web3DriipSettlementState.isEnabledServiceAction(to, await web3DriipSettlementState.SET_MAX_NONCE_ACTION.call())))
            await web3DriipSettlementState.enableServiceAction(to, await web3DriipSettlementState.SET_MAX_NONCE_ACTION.call());
        if (!(await web3DriipSettlementState.isEnabledServiceAction(to, await web3DriipSettlementState.ADD_SETTLED_AMOUNT_ACTION.call())))
            await web3DriipSettlementState.enableServiceAction(to, await web3DriipSettlementState.ADD_SETTLED_AMOUNT_ACTION.call());
        if (!(await web3DriipSettlementState.isEnabledServiceAction(to, await web3DriipSettlementState.SET_TOTAL_FEE_ACTION.call())))
            await web3DriipSettlementState.enableServiceAction(to, await web3DriipSettlementState.SET_TOTAL_FEE_ACTION.call());

        console.log(`Service ${to} registered as service in DriipSettlementState: ${await web3DriipSettlementState.isRegisteredService.call(to)}`);

        // #### NullSettlementState ####

        const web3NullSettlementState = await NullSettlementState.deployed();

        if (!(await web3NullSettlementState.isRegisteredService.call(to)))
            await web3NullSettlementState.registerService(to);
        if (!(await web3NullSettlementState.isEnabledServiceAction(to, await web3NullSettlementState.SET_MAX_NONCE_ACTION.call())))
            await web3NullSettlementState.enableServiceAction(to, await web3NullSettlementState.SET_MAX_NONCE_ACTION.call());

        console.log(`Service ${to} registered as service in NullSettlementState: ${await web3NullSettlementState.isRegisteredService.call(to)}`);

        callback();
    } catch (e) {
        callback(e);
    } finally {
        await web3.eth.personal.lockAccount(from);
    }
};
// EOF
//
// cat script.js
