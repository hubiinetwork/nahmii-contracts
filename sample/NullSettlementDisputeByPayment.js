const eventSampler = require('../scripts/common/event_sampler');
const {Contract, utils, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const mocks = require('../test/mocks');
const NullSettlementDisputeByPayment = artifacts.require('NullSettlementDisputeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

contract('NullSettlementDisputeByPayment', (accounts) => {
    let operator, service, wallet;
    let operatorSigner;
    let provider;
    let web3NullSettlementDisputeByPayment, ethersNullSettlementDisputeByPayment;
    let web3SignerManager;
    let web3Configuration, ethersConfiguration;
    let web3Validator, ethersValidator;
    let web3SecurityBond, ethersSecurityBond;
    let web3WalletLocker, ethersWalletLocker;
    let web3BalanceTracker, ethersBalanceTracker;
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
        web3NullSettlementDisputeByPayment = await NullSettlementDisputeByPayment.new(operator);
        ethersNullSettlementDisputeByPayment = new Contract(web3NullSettlementDisputeByPayment.address, NullSettlementDisputeByPayment.abi, operatorSigner);

        await ethersNullSettlementDisputeByPayment.setConfiguration(ethersConfiguration.address);
        await ethersNullSettlementDisputeByPayment.setValidator(ethersValidator.address);
        await ethersNullSettlementDisputeByPayment.setSecurityBond(ethersSecurityBond.address);
        await ethersNullSettlementDisputeByPayment.setWalletLocker(ethersWalletLocker.address);
        await ethersNullSettlementDisputeByPayment.setBalanceTracker(ethersBalanceTracker.address);
        await ethersNullSettlementDisputeByPayment.setFraudChallenge(ethersFraudChallenge.address);
        await ethersNullSettlementDisputeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);

        await ethersValidator._reset({gasLimit: 1e6});
        await ethersFraudChallenge._reset();
        await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
        await ethersSecurityBond._reset();
        await ethersWalletLocker._reset();
        await ethersBalanceTracker._reset();
    });

    describe('challengeByPayment()', () => {
        let payment, filter;

        beforeEach(async () => {
            await ethersNullSettlementChallengeState._addProposalIfNone();

            payment = await mocks.mockPayment(operator, {blockNumber: utils.bigNumberify(1)});

            await ethersNullSettlementDisputeByPayment.registerService(operator);
            await ethersNullSettlementDisputeByPayment.enableServiceAction(
                operator, await ethersNullSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                {gasLimit: 1e6}
            );

            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                1, {gasLimit: 1e6}
            );

            await ethersNullSettlementChallengeState._setProposal(true);
            await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementDisputeByPayment.interface.events.ChallengeByPaymentEvent.topics
            };
        });

        it('should emit ChallengeByPaymentEvent', async () => {
            await ethersNullSettlementDisputeByPayment.challengeByPayment(
                payment.sender.wallet, payment, wallet, {gasLimit: 1e6}
            );

            eventSampler.write(
                'NullSettlementDisputeByPayment', 'ChallengeByPaymentEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });
});
