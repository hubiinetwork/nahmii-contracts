// cd node_modules/nahmii-contract-abstractions
//
// cat > script.js << EOF

const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');

module.exports = async (callback) => {

    try {

        // #### DriipSettlementChallengeState ####

        console.log('\nFreezing upgrades of DriipSettlementChallengeState...');

        const web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
        await web3DriipSettlementChallengeState.freezeUpgrades();

        console.log('> Done');

        // ### NullSettlementChallengeState ####

        console.log('\nFreezing upgrades of NullSettlementChallengeState...');

        const web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
        await web3NullSettlementChallengeState.freezeUpgrades();

        console.log('> Done');

        // #### DriipSettlementState ####

        console.log('\nFreezing upgrades of DriipSettlementState...');

        const web3DriipSettlementState = await DriipSettlementState.deployed();
        await web3DriipSettlementState.freezeUpgrades();

        console.log('> Done');

        callback();
    } catch (e) {
        callback(e);
    }
};
// EOF
//
// cat script.js
