const eventSampler = require('../scripts/common/event_sampler');
const {Contract, utils, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const mocks = require('../test/mocks');
const DriipSettlementDisputeByPayment = artifacts.require('DriipSettlementDisputeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

contract('DriipSettlementDisputeByPayment', (accounts) => {
    let operator, service, wallet;
    let operatorSigner;
    let provider;
    let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
    let web3SignerManager;
    let web3Configuration, ethersConfiguration;
    let web3Validator, ethersValidator;
    let web3SecurityBond, ethersSecurityBond;
    let web3WalletLocker, ethersWalletLocker;
    let web3BalanceTracker, ethersBalanceTracker;
    let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
    let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
    let web3FraudChallenge, ethersFraudChallenge;

    before(async () => {
        eventSampler.mkdir();

        operator = accounts[0];
        service = accounts[1];
        wallet = accounts[2];

        operatorSigner = web3Provider.getSigner(operator);

        provider = operatorSigner.provider;

        web3SignerManager = await SignerManager.new(operator);

        web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new(operator);
        ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, operatorSigner);
        web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new(operator);
        ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, operatorSigner);
        web3Configuration = await MockedConfiguration.new(operator);
        ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, operatorSigner);
        web3Validator = await MockedValidator.new(operator, web3SignerManager.address);
        ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, operatorSigner);
        web3SecurityBond = await MockedSecurityBond.new();
        ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, operatorSigner);
        web3WalletLocker = await MockedWalletLocker.new();
        ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, operatorSigner);
        web3BalanceTracker = await MockedBalanceTracker.new();
        ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, operatorSigner);
        web3FraudChallenge = await MockedFraudChallenge.new(operator);
        ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, operatorSigner);

        await web3Configuration.setOperatorSettlementStakeFraction(web3.eth.blockNumber + 1, 5e17);
        await web3Configuration.setOperatorSettlementStake(web3.eth.blockNumber + 1, 1e16, mocks.address0, 0);
        await web3Configuration.setSettlementChallengeTimeout(web3.eth.blockNumber + 1, 1000);
    });

    beforeEach(async () => {
        web3DriipSettlementDisputeByPayment = await DriipSettlementDisputeByPayment.new(operator);
        ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, DriipSettlementDisputeByPayment.abi, operatorSigner);

        await ethersDriipSettlementDisputeByPayment.setConfiguration(ethersConfiguration.address);
        await ethersDriipSettlementDisputeByPayment.setValidator(ethersValidator.address);
        await ethersDriipSettlementDisputeByPayment.setSecurityBond(ethersSecurityBond.address);
        await ethersDriipSettlementDisputeByPayment.setWalletLocker(ethersWalletLocker.address);
        await ethersDriipSettlementDisputeByPayment.setBalanceTracker(ethersBalanceTracker.address);
        await ethersDriipSettlementDisputeByPayment.setFraudChallenge(ethersFraudChallenge.address);
        await ethersDriipSettlementDisputeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
        await ethersDriipSettlementDisputeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);

        await ethersValidator._reset({gasLimit: 1e6});
        await ethersFraudChallenge._reset();
        await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
        await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
        await ethersSecurityBond._reset();
        await ethersWalletLocker._reset();
        await ethersBalanceTracker._reset();
    });

    describe('challengeByPayment()', () => {
        let payment, filter;

        beforeEach(async () => {
            await ethersDriipSettlementChallengeState._addProposalIfNone();

            payment = await mocks.mockPayment(operator, {blockNumber: utils.bigNumberify(1)});

            await ethersDriipSettlementDisputeByPayment.registerService(operator);
            await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                operator, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                {gasLimit: 1e6}
            );

            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                1, {gasLimit: 1e6}
            );

            await ethersDriipSettlementChallengeState._setProposal(true);
            await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementDisputeByPayment.interface.events.ChallengeByPaymentEvent.topics
            };
        });

        it('should emit ChallengeByPaymentEvent', async () => {
            await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                payment.sender.wallet, payment, wallet, {gasLimit: 1e6}
            );

            eventSampler.write(
                'DriipSettlementDisputeByPayment', 'ChallengeByPaymentEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });
});
