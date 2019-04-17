const mocks = require('../test/mocks');
const eventSampler = require('../scripts/common/event_sampler');
const {Contract, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const ERC20Token = artifacts.require('TestERC20');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const ClientFund = artifacts.require('ClientFund');
const BalanceTracker = artifacts.require('BalanceTracker');
const TransactionTracker = artifacts.require('TransactionTracker');
const WalletLocker = artifacts.require('MockedWalletLocker');

contract('ClientFund', accounts => {
    let operator, service, wallet;
    let operatorSigner;
    let provider;
    let web3TransferControllerManager;
    let web3ERC20, ethersERC20;
    let web3BalanceTracker, ethersBalanceTracker;
    let web3TransactionTracker, ethersTransactionTracker;
    let web3WalletLocker, ethersWalletLocker;
    let web3ClientFund, ethersClientFund;
    let depositedBalanceType, settledBalanceType, stagedBalanceType;
    let depositTransactionType;

    before(async () => {
        eventSampler.mkdir();

        operator = accounts[0];
        service = accounts[1];
        wallet = accounts[2];

        operatorSigner = web3Provider.getSigner(operator);

        provider = operatorSigner.provider;

        web3TransferControllerManager = await TransferControllerManager.deployed();
    });

    beforeEach(async () => {
        web3ERC20 = await ERC20Token.new();
        ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, operatorSigner);

        await web3ERC20.mint(wallet, 1000);

        await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: operator});

        web3ClientFund = await ClientFund.new(operator);
        ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, operatorSigner);
        web3BalanceTracker = await BalanceTracker.new(operator);
        ethersBalanceTracker = new Contract(web3BalanceTracker.address, BalanceTracker.abi, operatorSigner);
        web3TransactionTracker = await TransactionTracker.new(operator);
        ethersTransactionTracker = new Contract(web3TransactionTracker.address, TransactionTracker.abi, operatorSigner);
        web3WalletLocker = await WalletLocker.new();
        ethersWalletLocker = new Contract(web3WalletLocker.address, WalletLocker.abi, operatorSigner);

        await web3ClientFund.setTransferControllerManager(web3TransferControllerManager.address);
        await web3ClientFund.setBalanceTracker(web3BalanceTracker.address);
        await web3ClientFund.setTransactionTracker(web3TransactionTracker.address);
        await web3ClientFund.setWalletLocker(web3WalletLocker.address);

        await web3ClientFund.registerService(service);
        await web3ClientFund.authorizeInitialService(service);

        await web3BalanceTracker.registerService(web3ClientFund.address);

        await web3TransactionTracker.registerService(web3ClientFund.address);

        depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
        settledBalanceType = await web3BalanceTracker.settledBalanceType();
        stagedBalanceType = await web3BalanceTracker.stagedBalanceType();

        depositTransactionType = await web3TransactionTracker.depositTransactionType();
    });

    describe('receiveEthersTo()', () => {
        let filter;

        beforeEach(async () => {
            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersClientFund.interface.events.ReceiveEvent.topics
            };
        });

        it('should emit ReceiveEvent', async () => {
            await web3ClientFund.receiveEthersTo(
                wallet, '', {from: wallet, value: web3.toWei(1, 'ether')}
            );

            eventSampler.write(
                'ClientFund', 'ReceiveEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('stage()', () => {
        let filter;

        beforeEach(async () => {
            await web3ClientFund.receiveEthersTo(
                wallet, '', {from: wallet, value: web3.toWei(1, 'ether'), gas: 1e6}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersClientFund.interface.events.StageEvent.topics
            };
        });

        it('should emit StageEvent', async () => {
            await web3ClientFund.stage(
                wallet, web3.toWei(1, 'ether'), mocks.address0, 0, '', {from: service}
            );

            eventSampler.write(
                'ClientFund', 'StageEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('unstage()', () => {
        let filter;

        beforeEach(async () => {
            await web3ClientFund.receiveEthersTo(
                wallet, '', {from: wallet, value: web3.toWei(1, 'ether'), gas: 1e6}
            );

            await web3ClientFund.stage(
                wallet, web3.toWei(1, 'ether'), mocks.address0, 0, '', {from: service, gas: 1e6}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersClientFund.interface.events.UnstageEvent.topics
            };
        });

        it('should emit UnstageEvent', async () => {
            await web3ClientFund.unstage(
                web3.toWei(1, 'ether'), mocks.address0, 0, '', {from: service, gas: 1e6}
            );

            eventSampler.write(
                'ClientFund', 'UnstageEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('seizeBalances()', () => {
        let filter;

        beforeEach(async () => {
            await web3ClientFund.receiveEthersTo(
                wallet, '', {from: wallet, value: web3.toWei(1, 'ether'), gas: 1e6}
            );

            await web3WalletLocker._setLockedAmount(web3.toWei(1, 'ether'));

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersClientFund.interface.events.SeizeBalancesEvent.topics
            };
        });

        it('should emit SeizeBalancesEvent', async () => {
            await web3ClientFund.seizeBalances(
                wallet, mocks.address0, 0, '', {from: service, gas: 1e6}
            );

            eventSampler.write(
                'ClientFund', 'SeizeBalancesEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });
});

