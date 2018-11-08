/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const NahmiiToken = artifacts.require('NahmiiToken');

// -----------------------------------------------------------------------------------------------------------------

module.exports = async (callback) => {

    // A script template for read-only interaction with nahmii contracts exemplified below by
    // NahmiiToken contract on Ropsten. It may be run as follows:
    //
    //    npm run exec:script:ropsten

    const instance = await NahmiiToken.at('0x65905e653b750bCB8f903374Bc93cbd8E2E71B71');

    const allHolders = await instance.holdersByIndices(0, 2, false);
    console.log(`All holders:                   ${allHolders.join(', ')}`);

    const posHolders = await instance.holdersByIndices(0, 2, true);
    console.log(`Positive holders:              ${posHolders.join(', ')}`);

    const balances = await Promise.all(allHolders.map(async (h) => (await instance.balanceOf(h)).toString()));
    console.log(`Balances:                      ${balances.join(', ')}`);

    const balanceUpdatesCounts = await Promise.all(allHolders.map(async (h) => (await instance.balanceUpdatesCount(h)).toNumber()));
    console.log(`Balance updates counts:        ${balanceUpdatesCounts.join(', ')}`);

    const firstBalanceBlocks = await Promise.all(allHolders.map(async (h) => await instance.balanceBlocks(h, 0)));
    console.log(`First balance blocks:          ${firstBalanceBlocks.join(', ')}`);

    const lastBalanceBlocks = await Promise.all(allHolders.map(async (h) => await instance.balanceBlocks(h, (await instance.balanceUpdatesCount(h)).minus(1))));
    console.log(`Last balance blocks:           ${lastBalanceBlocks.join(', ')}`);

    const firstBalanceBlockNumbers = await Promise.all(allHolders.map(async (h) => await instance.balanceBlockNumbers(h, 0)));
    console.log(`First balance block numbers:   ${firstBalanceBlockNumbers.join(', ')}`);

    const lastBalanceBlockNumbers = await Promise.all(allHolders.map(async (h) => await instance.balanceBlockNumbers(h, (await instance.balanceUpdatesCount(h)).minus(1))));
    console.log(`Last balance blocks:           ${lastBalanceBlockNumbers.join(', ')}`);

    // const balanceBlocksIn = await Promise.all(allHolders.map(async (h) => await instance.balanceBlocksIn(h, 4388600, 4388600)));
    // console.log(`Balance blocks in:             ${balanceBlocksIn.join(', ')}`);

    callback();
};
