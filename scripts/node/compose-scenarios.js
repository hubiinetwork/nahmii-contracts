const fs = require('fs').promises;
const assert = require('assert');

const rootDir = 'state';

async function parseJSON(subDir, action) {
    const inDir = `${rootDir}/export/${subDir}`;

    const files = await fs.readdir(inDir);

    let settleNull = [];
    for (let file of files)
        settleNull = settleNull.concat(JSON.parse(await fs.readFile(`${inDir}/${file}`)));

    settleNull.forEach(d => d.action = action);

    return settleNull;
}

function byBlockNumber(d1, d2) {
    return d1.blockNumber - d2.blockNumber;
}

function byWallet(m, d) {
    if (!m.has(d.wallet))
        m.set(d.wallet, []);
    m.get(d.wallet).push(d);
    return m;
}

function selectPayments(payments, steps) {
    const selected = [];
    steps.forEach(s => {
        const p = payments.find(p => (p.sender.wallet == s.wallet && p.sender.nonce == s.data.nonce) ||
            (p.recipient.wallet == s.wallet && p.recipient.nonce == s.data.nonce));

        if (!p || !p.blockNumber)
            return;

        const step = {
            wallet: s.wallet,
            blockNumber: p.blockNumber,
            data: Object.assign({}, p),
            action: p.action
        };

        delete step.data.action;

        if (!step.data.sender.fees.total.figure.amount)
            step.data.sender.fees.total.figure.amount = '0';
        if (!step.data.recipient.fees.total.figure.amount)
            step.data.recipient.fees.total.figure.amount = '0';

        selected.push(step);
    });
    return selected;
}

function createStepsFromPayments(payments) {
    const steps = [];
    payments.forEach(p => {

        const senderStep = {
            wallet: p.sender.wallet,
            blockNumber: p.blockNumber,
            data: Object.assign({}, p),
            action: p.action
        };

        delete senderStep.data.action;

        steps.push(senderStep);

        const recipientStep = {
            wallet: p.recipient.wallet,
            blockNumber: p.blockNumber,
            data: Object.assign({}, p),
            action: p.action
        };

        delete recipientStep.data.action;

        steps.push(recipientStep);

    });
    return steps;
}

function connectPayments(scenarios) {
    for (let [wallet, steps] of scenarios[Symbol.iterator]())
        for (let step of steps) {
            if ('start-payment-challenge' != step.action)
                continue;

            const p = steps.find(s => 'pay' == s.action && (
                (wallet == s.data.sender.wallet && step.data.nonce == s.data.sender.nonce) ||
                (wallet == s.data.recipient.wallet && step.data.nonce == s.data.recipient.nonce)
            ));

            assert(p, `Missing payment for wallet ${wallet} at step ${JSON.stringify(step, null, 2)}`);

            step.ref = p.data;
        }
}

async function writeScenarios(scenarios) {
    const outDir = `${rootDir}/scenarios`;

    await fs.mkdir(outDir, {recursive: true});

    for (let d of scenarios[Symbol.iterator]())
        await fs.writeFile(`${outDir}/${d[0]}.json`, JSON.stringify(d[1], null, 2));
}

(async function () {
    const steps = (await parseJSON('NullSettlement', 'settle-null'))
        .concat(await parseJSON('NullSettlementChallengeByPayment', 'start-null-challenge'))
        .concat(await parseJSON('DriipSettlementByPayment', 'settle-payment'))
        .concat(await parseJSON('DriipSettlementChallengeByPayment', 'start-payment-challenge'));

    const payments = createStepsFromPayments(await parseJSON('offchain', 'pay'));

    const receptions = await parseJSON('ClientFund', 'receive');

    const scenarios = steps.concat(payments)
        .concat(receptions)
        .sort(byBlockNumber)
        .reduce(byWallet, new Map());

    connectPayments(scenarios);

    await writeScenarios(scenarios);
})();