cd
node_modules / nahmii - contract - abstractions - ropsten

cat > script.js << EOF

const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementState = artifacts.require('NullSettlementState');

module.exports = async (callback) => {

    const deployer = process.env.FROM;
    const password = process.env.PASSWORD;
    const service = process.env.TO;

    try {
        await web3.eth.personal.unlockAccount(deployer, password, 600); // 10min

        // #### DriipSettlementState ####

        const web3DriipSettlementState = await DriipSettlementState.deployed();

        if (!(await web3DriipSettlementState.isRegisteredService.call(service)))
            throw new Error(`${service} is not registered service`);
        else {
            await web3DriipSettlementState.disableServiceAction(service, await web3DriipSettlementState.SET_MAX_NONCE_ACTION.call());
            await web3DriipSettlementState.disableServiceAction(service, await web3DriipSettlementState.ADD_SETTLED_AMOUNT_ACTION.call());
            await web3DriipSettlementState.disableServiceAction(service, await web3DriipSettlementState.SET_TOTAL_FEE_ACTION.call());
            await web3DriipSettlementState.deregisterService(service);

            console.log(`Service ${service} deregistered as service in DriipSettlementState: ${!(await web3DriipSettlementState.isRegisteredService.call(service))}`);
        }

        // #### NullSettlementState ####

        const web3NullSettlementState = await NullSettlementState.deployed();

        if (!(await web3NullSettlementState.isRegisteredService.call(service)))
            throw new Error(`${service} is not registered service`);
        else {
            await web3NullSettlementState.disableServiceAction(service, await web3NullSettlementState.SET_MAX_NONCE_ACTION.call());
            await web3NullSettlementState.deregisterService(service);

            console.log(`Service ${service} deregistered as service in NullSettlementState: ${!(await web3NullSettlementState.isRegisteredService.call(service))}`);
        }

        callback();
    } catch (e) {
        callback(e);
    } finally {
        await web3.eth.personal.lockAccount(deployer);
    }
};
EOF

cat
script.js
