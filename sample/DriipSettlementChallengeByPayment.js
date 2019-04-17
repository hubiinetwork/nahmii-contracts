const eventSampler = require('../scripts/common/event_sampler');
const {Contract, utils, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const mocks = require('../test/mocks');
const DriipSettlementChallengeByPayment = artifacts.require('DriipSettlementChallengeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementDisputeByPayment = artifacts.require('MockedDriipSettlementDisputeByPayment');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

contract('DriipSettlementChallengeByPayment', (accounts) => {
    let operator, service, wallet;
    let operatorSigner;
    let provider;
    let web3DriipSettlementChallengeByPayment, ethersDriipSettlementChallengeByPayment;
    let web3SignerManager;
    let web3Configuration, ethersConfiguration;
    let web3Validator, ethersValidator;
    let web3WalletLocker, ethersWalletLocker;
    let web3BalanceTracker, ethersBalanceTracker;
    let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
    let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
    let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;

    before(async () => {
        eventSampler.mkdir();

        operator = accounts[0];
        service = accounts[1];
        wallet = accounts[2];

        operatorSigner = web3Provider.getSigner(operator);

        provider = operatorSigner.provider;

        web3SignerManager = await SignerManager.new(operator);

        web3DriipSettlementDisputeByPayment = await MockedDriipSettlementDisputeByPayment.new();
        ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, MockedDriipSettlementDisputeByPayment.abi, operatorSigner);
        web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
        ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, operatorSigner);
        web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
        ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, operatorSigner);
        web3Configuration = await MockedConfiguration.new(operator);
        ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, operatorSigner);
        web3Validator = await MockedValidator.new(operator, web3SignerManager.address);
        ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, operatorSigner);
        web3WalletLocker = await MockedWalletLocker.new();
        ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, operatorSigner);
        web3BalanceTracker = await MockedBalanceTracker.new();
        ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, operatorSigner);

        await ethersConfiguration.setEarliestSettlementBlockNumber(0);
    });

    beforeEach(async () => {
        web3DriipSettlementChallengeByPayment = await DriipSettlementChallengeByPayment.new(operator);
        ethersDriipSettlementChallengeByPayment = new Contract(web3DriipSettlementChallengeByPayment.address, DriipSettlementChallengeByPayment.abi, operatorSigner);

        await ethersDriipSettlementChallengeByPayment.setConfiguration(ethersConfiguration.address);
        await ethersDriipSettlementChallengeByPayment.setValidator(ethersValidator.address);
        await ethersDriipSettlementChallengeByPayment.setWalletLocker(ethersWalletLocker.address);
        await ethersDriipSettlementChallengeByPayment.setBalanceTracker(ethersBalanceTracker.address);
        await ethersDriipSettlementChallengeByPayment.setDriipSettlementDisputeByPayment(ethersDriipSettlementDisputeByPayment.address);
        await ethersDriipSettlementChallengeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
        await ethersDriipSettlementChallengeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);

        await ethersValidator._reset({gasLimit: 1e6});
        await ethersWalletLocker._reset({gasLimit: 1e6});
        await ethersBalanceTracker._reset({gasLimit: 1e6});
        await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
        await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
    });

    describe('startChallengeFromPayment()', () => {
        let payment, filter;

        beforeEach(async () => {
            payment = await mocks.mockPayment(operator, {sender: {wallet: operator}});

            await ethersBalanceTracker._set(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('1', 18),
                {gasLimit: 1e6}
            );

            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('1', 18),
                payment.blockNumber, {gasLimit: 1e6}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementChallengeByPayment.interface.events.StartChallengeFromPaymentEvent.topics
            };
        });

        it('should emit StartChallengeFromPaymentEvent', async () => {
            await ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                payment, payment.sender.balances.current, {gasLimit: 3e6}
            );

            eventSampler.write(
                'DriipSettlementChallengeByPayment', 'StartChallengeFromPaymentEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('startChallengeFromPaymentByProxy()', () => {
        let payment, filter;

        beforeEach(async () => {
            payment = await mocks.mockPayment(operator, {sender: {wallet: operator}});

            await ethersBalanceTracker._set(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('1', 18),
                {gasLimit: 1e6}
            );
            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('1', 18),
                payment.blockNumber, {gasLimit: 1e6}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementChallengeByPayment.interface.events.StartChallengeFromPaymentByProxyEvent.topics
            };
        });

        it('should emit StartChallengeFromPaymentByProxyEvent', async () => {
            await ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
            );

            eventSampler.write(
                'DriipSettlementChallengeByPayment', 'StartChallengeFromPaymentByProxyEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('stopChallenge()', () => {
        let filter;

        beforeEach(async () => {
            await ethersDriipSettlementChallengeState._setProposal(true);
            await ethersDriipSettlementChallengeState._setProposalNonce(1);
            await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(utils.parseUnits('1', 18));
            await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('2', 18));
            await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(utils.parseUnits('3', 18));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementChallengeByPayment.interface.events.StopChallengeEvent.topics
            };
        });

        it('should emit StopChallengeEvent', async () => {
            await ethersDriipSettlementChallengeByPayment.stopChallenge(
                mocks.address1, 10, {gasLimit: 1e6}
            );

            eventSampler.write(
                'DriipSettlementChallengeByPayment', 'StopChallengeEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('stopChallengeByProxy()', () => {
        let filter;

        beforeEach(async () => {
            await ethersDriipSettlementChallengeState._setProposal(true);
            await ethersDriipSettlementChallengeState._setProposalNonce(1);
            await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(utils.parseUnits('1', 18));
            await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('2', 18));
            await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(utils.parseUnits('3', 18));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementChallengeByPayment.interface.events.StopChallengeByProxyEvent.topics
            };
        });

        it('should emit StopChallengeByProxyEvent', async () => {
            await ethersDriipSettlementChallengeByPayment.stopChallengeByProxy(
                wallet, mocks.address1, 10, {gasLimit: 1e6}
            );

            eventSampler.write(
                'DriipSettlementChallengeByPayment', 'StopChallengeByProxyEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('challengeByPayment()', () => {
        let payment, filter;

        beforeEach(async () => {
            payment = await mocks.mockPayment(operator);

            await ethersDriipSettlementChallengeState._setProposalNonce(1);
            await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(utils.parseUnits('1', 18));
            await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('2', 18));
            await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(utils.parseUnits('3', 18));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersDriipSettlementChallengeByPayment.interface.events.ChallengeByPaymentEvent.topics
            };
        });

        it('should emit ChallengeByPaymentEvent', async () => {
            await ethersDriipSettlementChallengeByPayment.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

            eventSampler.write(
                'DriipSettlementChallengeByPayment', 'ChallengeByPaymentEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });
});
