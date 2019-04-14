const eventSampler = require('../scripts/common/event_sampler');
const {Contract, utils, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const mocks = require('../test/mocks');
const NullSettlementChallengeByPayment = artifacts.require('NullSettlementChallengeByPayment');
const MockedNullSettlementDisputeByPayment = artifacts.require('MockedNullSettlementDisputeByPayment');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

contract('NullSettlementChallengeByPayment', (accounts) => {
    let operator, service, wallet;
    let operatorSigner;
    let provider;
    let web3NullSettlementChallengeByPayment, ethersNullSettlementChallengeByPayment;
    let web3Configuration, ethersConfiguration;
    let web3WalletLocker, ethersWalletLocker;
    let web3BalanceTracker, ethersBalanceTracker;
    let web3NullSettlementDisputeByPayment, ethersNullSettlementDisputeByPayment;
    let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
    let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;

    before(async () => {
        eventSampler.mkdir();

        operator = accounts[0];
        service = accounts[1];
        wallet = accounts[2];

        operatorSigner = web3Provider.getSigner(operator);

        provider = operatorSigner.provider;

        web3NullSettlementDisputeByPayment = await MockedNullSettlementDisputeByPayment.new();
        ethersNullSettlementDisputeByPayment = new Contract(web3NullSettlementDisputeByPayment.address, MockedNullSettlementDisputeByPayment.abi, operatorSigner);
        web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
        ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, operatorSigner);
        web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
        ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, operatorSigner);
        web3Configuration = await MockedConfiguration.new(operator);
        ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, operatorSigner);
        web3WalletLocker = await MockedWalletLocker.new();
        ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, operatorSigner);
        web3BalanceTracker = await MockedBalanceTracker.new();
        ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, operatorSigner);

        await ethersConfiguration.setEarliestSettlementBlockNumber(0);
    });

    beforeEach(async () => {
        web3NullSettlementChallengeByPayment = await NullSettlementChallengeByPayment.new(operator);
        ethersNullSettlementChallengeByPayment = new Contract(web3NullSettlementChallengeByPayment.address, NullSettlementChallengeByPayment.abi, operatorSigner);

        await ethersNullSettlementChallengeByPayment.setConfiguration(ethersConfiguration.address);
        await ethersNullSettlementChallengeByPayment.setWalletLocker(ethersWalletLocker.address);
        await ethersNullSettlementChallengeByPayment.setBalanceTracker(ethersBalanceTracker.address);
        await ethersNullSettlementChallengeByPayment.setNullSettlementDisputeByPayment(ethersNullSettlementDisputeByPayment.address);
        await ethersNullSettlementChallengeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
        await ethersNullSettlementChallengeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);

        await ethersWalletLocker._reset({gasLimit: 1e6});
        await ethersBalanceTracker._reset({gasLimit: 1e6});
        await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
        await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
    });

    describe('startChallenge()', () => {
        let filter;

        beforeEach(async () => {
            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10', 18),
                1, {gasLimit: 1e6}
            );
            await ethersDriipSettlementChallengeState._setProposal(true);
            await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(utils.parseUnits('1', 18));
            await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('2', 18));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementChallengeByPayment.interface.events.StartChallengeEvent.topics
            };
        });

        it('should emit StartChallengeEvent', async () => {
            await ethersNullSettlementChallengeByPayment.startChallenge(
                utils.parseUnits('1', 18), mocks.address0, 0, {gasLimit: 3e6}
            );

            eventSampler.write(
                'NullSettlementChallengeByPayment', 'StartChallengeEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('startChallengeByProxy()', () => {
        let filter;

        beforeEach(async () => {
            await ethersBalanceTracker._setFungibleRecord(
                await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10', 18),
                1, {gasLimit: 1e6}
            );
            await ethersDriipSettlementChallengeState._setProposal(true);
            await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(utils.parseUnits('1', 18));
            await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('2', 18));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementChallengeByPayment.interface.events.StartChallengeByProxyEvent.topics
            };
        });

        it('should emit StartChallengeByProxyEvent', async () => {
            await ethersNullSettlementChallengeByPayment.startChallengeByProxy(
                wallet, utils.parseUnits('1', 18), mocks.address0, 0, {gasLimit: 3e6}
            );

            eventSampler.write(
                'NullSettlementChallengeByPayment', 'StartChallengeByProxyEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('stopChallenge()', () => {
        let filter;

        beforeEach(async () => {
            await ethersNullSettlementChallengeState._setProposal(true);
            await ethersNullSettlementChallengeState._setProposalNonce(1);
            await ethersNullSettlementChallengeState._setProposalStageAmount(1000);
            await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(2000);

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementChallengeByPayment.interface.events.StopChallengeEvent.topics
            };
        });

        it('should emit StopChallengeEvent', async () => {
            await ethersNullSettlementChallengeByPayment.stopChallenge(
                mocks.address1, 10, {gasLimit: 1e6}
            );

            eventSampler.write(
                'NullSettlementChallengeByPayment', 'StopChallengeEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('stopChallengeByProxy()', () => {
        let filter;

        beforeEach(async () => {
            await ethersNullSettlementChallengeState._setProposal(true);
            await ethersNullSettlementChallengeState._setProposalNonce(1);
            await ethersNullSettlementChallengeState._setProposalStageAmount(1000);
            await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(2000);

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementChallengeByPayment.interface.events.StopChallengeByProxyEvent.topics
            };
        });

        it('should emit StopChallengeByProxyEvent', async () => {
            await ethersNullSettlementChallengeByPayment.stopChallengeByProxy(
                wallet, mocks.address1, 10, {gasLimit: 1e6}
            );

            eventSampler.write(
                'NullSettlementChallengeByPayment', 'StopChallengeByProxyEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('challengeByPayment()', () => {
        let payment, filter;

        beforeEach(async () => {
            payment = await mocks.mockPayment(operator);

            await ethersNullSettlementChallengeState._setProposalNonce(1);
            await ethersNullSettlementChallengeState._setProposalStageAmount(1000);
            await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(2000);

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersNullSettlementChallengeByPayment.interface.events.ChallengeByPaymentEvent.topics
            };
        });

        it('should emit ChallengeByPaymentEvent', async () => {
            await ethersNullSettlementChallengeByPayment.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

            eventSampler.write(
                'NullSettlementChallengeByPayment', 'ChallengeByPaymentEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

});
