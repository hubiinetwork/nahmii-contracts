const eventSampler = require('../scripts/common/event_sampler');
const {Contract, providers: {Web3Provider}} = require('ethers');
const web3Provider = new Web3Provider(web3.currentProvider);
const {address0} = require('../test/mocks');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const WalletLocker = artifacts.require('WalletLocker');

contract('WalletLocker', (accounts) => {
    let operator, service, walletA, walletB;
    let operatorSigner;
    let provider;
    let web3Configuration, ethersConfiguration;
    let web3WalletLocker, ethersWalletLocker;

    before(async () => {
        eventSampler.mkdir();

        operator = accounts[0];
        service = accounts[1];
        walletA = accounts[2];
        walletB = accounts[3];

        operatorSigner = web3Provider.getSigner(operator);

        provider = operatorSigner.provider;

        web3Configuration = await MockedConfiguration.new(operator);
        ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, operatorSigner);
    });

    beforeEach(async () => {
        web3WalletLocker = await WalletLocker.new(operator);
        ethersWalletLocker = new Contract(web3WalletLocker.address, WalletLocker.abi, operatorSigner);

        await web3WalletLocker.setConfiguration(web3Configuration.address);

        await web3WalletLocker.registerService(service, {from: operator});
        await web3WalletLocker.authorizeInitialService(service, {from: operator});

        await web3Configuration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 3600);
    });

    describe('unlockFungible()', () => {
        let filter;

        beforeEach(async () => {
            await web3Configuration.setWalletLockTimeout(
                (await provider.getBlockNumber()) + 1, 0
            );

            await web3WalletLocker.lockFungibleByProxy(
                walletA, walletB, web3.toWei(1, 'ether'), address0, 0, 0, {from: service}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersWalletLocker.interface.events.UnlockFungibleEvent.topics
            };
        });

        it('should emit UnlockFungibleEvent', async () => {
            await web3WalletLocker.unlockFungible(walletA, walletB, address0, 0);

            eventSampler.write(
                'WalletLocker', 'UnlockFungibleEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });

    describe('unlockFungibleByProxy()', () => {
        let filter;

        beforeEach(async () => {
            await web3Configuration.setWalletLockTimeout(
                (await provider.getBlockNumber()) + 1, 0
            );

            await web3WalletLocker.lockFungibleByProxy(
                walletA, walletB, web3.toWei(1, 'ether'), address0, 0, 0, {from: service}
            );

            filter = {
                fromBlock: await provider.getBlockNumber(),
                topics: ethersWalletLocker.interface.events.UnlockFungibleByProxyEvent.topics
            };
        });

        it('should emit UnlockFungibleEvent', async () => {
            await web3WalletLocker.unlockFungibleByProxy(walletA, walletB, address0, 0, {from: service});

            eventSampler.write(
                'WalletLocker', 'UnlockFungibleByProxyEvent', (await provider.getLogs(filter)).shift()
            );
        });
    });
});
