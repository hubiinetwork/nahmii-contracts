/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const walletFactory = require('./wallet_factory');
const contractFactory = require('./contract_factory');
const provider = contractFactory.provider;

const {sleep} = require('../../scripts/common/helpers');

// -----------------------------------------------------------------------------------------------------------------

(async () => {
    // A script template for read-only interaction with nahmii contracts exemplified below by
    // NahmiiToken contract on Ropsten. It may be run as follows:
    //
    //    npm run exec:script:ropsten

    const operatorWallet = walletFactory.create('operator', provider);

    const revenueTokenManager = await contractFactory.create('RevenueTokenManager', provider.name, operatorWallet);

    const totalLockedAmount = await revenueTokenManager.totalLockedAmount();
    console.log(`totalLockedAmount: ${totalLockedAmount}`);

    const releasesCount = await revenueTokenManager.releasesCount();
    console.log(`releasesCount: ${releasesCount}`);

    const executedReleasesCount = await revenueTokenManager.executedReleasesCount();
    console.log(`executedReleasesCount: ${executedReleasesCount}`);

    const blockNumber = await provider.getBlockNumber();

    const releasedAmountBlocks = await revenueTokenManager.releasedAmountBlocksIn(
        blockNumber - 1, blockNumber
    );
    console.log(`releasedAmountBlocks: ${releasedAmountBlocks}`);

    // for (let i = 0; i < 21; i++) {
    //     let release = await revenueTokenManager.releases(i);
    //     console.log(`${new Date(1000 * parseInt(release[0].toString())).toISOString()} (${i}): ${release}`);
    // }

    // let tx;
    // tx = await revenueTokenManager.release(2, {gasLimit: 1e6});
    // console.log(tx);
    // tx = await revenueTokenManager.release(3, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(7, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(6, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(8, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(5, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(4, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(19, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(18, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(17, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(20, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
    // tx = await revenueTokenManager.release(16, {gasLimit: 1e6, nonce: tx.nonce + 1});
    // console.log(tx);
})();

