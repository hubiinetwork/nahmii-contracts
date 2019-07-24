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
        const _p = payments.find(p => (p.sender.wallet == s.wallet && p.sender.nonce == s.data.nonce) ||
            (p.recipient.wallet == s.wallet && p.recipient.nonce == s.data.nonce));

        if (!_p || !_p.blockNumber)
            return;

        const p = {
            wallet: s.wallet,
            blockNumber: _p.blockNumber,
            data: _p,
            action: _p.action
        };

        if (0 <= selected.findIndex(_p => _p.wallet == p.wallet && _p.blockNumber == p.blockNumber))
            return;

        delete p.data.action;

        if (!p.data.sender.fees.total.figure.amount)
            p.data.sender.fees.total.figure.amount = '0';
        if (!p.data.recipient.fees.total.figure.amount)
            p.data.recipient.fees.total.figure.amount = '0';

        selected.push(p);
    });
    return selected;
}

function selectReceptions(receptions, steps) {
    const selected = [];
    steps.forEach(s => {
        const r = receptions.find(r => r.wallet == s.wallet);

        if (!r)
            return;

        if (0 <= selected.findIndex(_r => _r.wallet == r.wallet && _r.blockNumber == r.blockNumber))
            return;

        selected.push(r);
    });
    return selected;
}

function connectPayments(scenarios) {
    for (let [wallet, steps] of scenarios[Symbol.iterator]())
        for (let step of steps) {
            if ('start-payment-challenge' != step.action)
                continue;

            const p = steps.find(s => 'pay' == s.action && wallet == s.wallet && (step.data.nonce == s.data.sender.nonce || step.data.nonce == s.data.recipient.nonce));

            assert(p);

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

    const payments = selectPayments(await parseJSON('offchain', 'pay'), steps);

    const receptions = selectReceptions(await parseJSON('ClientFund', 'receive'), steps);

    const scenarios = steps.concat(payments)
        .concat(receptions)
        .sort(byBlockNumber)
        .reduce(byWallet, new Map());

    connectPayments(scenarios);

    await writeScenarios(scenarios);
})();