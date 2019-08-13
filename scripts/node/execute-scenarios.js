const fs = require('fs').promises;
const BN = require('./bn-mod.js');
const assert = require('assert');
const chalk = require('chalk');
const debug = require('debug')('execute-scenarios');

const rootDir = 'state';

const settlementChallengeTimeout = parseInt(process.env.SETTLEMENT_CHALLENGE_TIMEOUT) || 60 * 60 * 24 * 5;

const bn0 = new BN('0');
const hash0 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const address0 = '0x0000000000000000000000000000000000000000';

function key(...entries) {
    let _entries = [];
    for (let e of entries)
        _entries.push('object' != typeof (e) ? e : key(...(Object.values(e))));
    return _entries.join('-');
}

function unkey(key) {
    return key.split('-');
}

function walletCurrencyKey(wallet, currency) {
    return `${wallet}-${currency.ct}/${currency.id} (w-c)`
}

function walletNonceKey(wallet, nonce) {
    return `${wallet}-${nonce} (w-n)`
}

class BlockNumberedCumulativeBN {

    constructor() {
        this.value = new BN('0');
        this.values = new Map();
        this.blockNumberMax = 0;
    }

    getValueByBlockNumber(blockNumber) {
        return this.getRecordByBlockNumber(blockNumber)[1];
    }

    getCurrentValue() {
        return this.getCurrentRecord()[1];
    }

    getRecordByBlockNumber(blockNumber) {
        for (let [b, v] of Array.from(this.values.entries()).reverse())
            if (blockNumber < b)
                continue;
            else
                return [b, v];
        return [0, bn0];
    }

    getCurrentRecord() {
        return 0 < this.values.size ? [this.blockNumberMax, this.values.get(this.blockNumberMax)] : [0, bn0];
    }

    setByBlockNumber(value, blockNumber) {
        assert(blockNumber >= this.blockNumberMax, `New block number ${blockNumber} is smaller than existing block number max ${this.blockNumberMax}`);
        this.value = value;
        this.values.set(blockNumber, value);
        this.blockNumberMax = blockNumber;
    }

    addByBlockNumber(value, blockNumber) {
        this.setByBlockNumber(this.value.add(value), blockNumber);
    }

    subByBlockNumber(value, blockNumber) {
        this.setByBlockNumber(this.value.sub(value), blockNumber);
    }
}

// class BlockNumberedDiscreteBN {
//
//     constructor() {
//         this.values = new Map();
//     }
//
//     getValueByBlockNumber(blockNumber) {
//         const setBlockNumber = this.getSetBlockNumber(blockNumber);
//         return 0 < setBlockNumber ? this.values.get(setBlockNumber) : 0;
//     }
//
//     getCurrentValue() {
//         const setBlockNumbers = Array.from(this.values.keys());
//         return this.values.get(setBlockNumbers[setBlockNumbers.length - 1]);
//     }
//
//     addByBlockNumber(value, prevBlockNumber, currBlockNumber) {
//         // assert(prevBlockNumber >= this.blockNumberMax, `New block number ${prevBlockNumber} is smaller than existing block number max ${this.blockNumberMax}`);
//         const setBlockNumber = this.getSetBlockNumber(prevBlockNumber);
//         this.values.set(setBlockNumber, value.add(this.values.has(setBlockNumber) ? this.values.get(setBlockNumber) : bn0));
//         this.values.set(currBlockNumber, bn0);
//     }
//
//     getSetBlockNumber(blockNumber) {
//         for (let b of Array.from(this.values.keys()).reverse())
//             if (b <= blockNumber)
//                 return b;
//         return 0;
//     }
// }

class DenominatedBlockNumberedCumulativeBN {
    constructor() {
        this.values = new Map();
    }

    hasDenomination(currency) {
        return this.values.has(key(currency));
    }

    getValueByBlockNumber(currency, blockNumber) {
        return this.hasDenomination(currency) ?
            this.values.get(key(currency)).getValueByBlockNumber(blockNumber) :
            bn0;
    }

    getCurrentValue(currency) {
        return this.hasDenomination(currency) ?
            this.values.get(key(currency)).getCurrentValue() :
            bn0;
    }

    getRecordByBlockNumber(currency, blockNumber) {
        return this.hasDenomination(currency) ?
            this.values.get(key(currency)).getRecordByBlockNumber(blockNumber) :
            [0, bn0];
    }

    getCurrentRecord(currency) {
        return this.hasDenomination(currency) ?
            this.values.get(key(currency)).getCurrentRecord() :
            [0, bn0];
    }

    setByBlockNumber(currency, value, blockNumber) {
        if (!this.hasDenomination(currency))
            this.values.set(key(currency), new BlockNumberedCumulativeBN());

        this.values.get(key(currency)).setByBlockNumber(value, blockNumber);
    }

    addByBlockNumber(currency, value, blockNumber) {
        if (!this.hasDenomination(currency))
            this.values.set(key(currency), new BlockNumberedCumulativeBN());

        this.values.get(key(currency)).addByBlockNumber(value, blockNumber);
    }

    subByBlockNumber(currency, value, blockNumber) {
        if (!this.hasDenomination(currency))
            this.values.set(key(currency), new BlockNumberedCumulativeBN());

        this.values.get(key(currency)).subByBlockNumber(value, blockNumber);
    }
}

// class DenominatedBlockNumberedDiscreteBN {
//     constructor() {
//         this.values = new Map();
//     }
//
//     hasDenomination(currency) {
//         return this.values.has(key(currency));
//     }
//
//     getValueByBlockNumber(currency, blockNumber) {
//         return this.hasDenomination(currency) ?
//             this.values.get(key(currency)).getValueByBlockNumber(blockNumber) :
//             bn0;
//     }
//
//     getCurrentValue(currency) {
//         return this.hasDenomination(currency) ?
//             this.values.get(key(currency)).getCurrentValue() :
//             bn0;
//     }
//
//     addByBlockNumber(currency, value, prevBlockNumber, currBlockNumber) {
//         if (!this.hasDenomination(currency))
//             this.values.set(key(currency), new BlockNumberedDiscreteBN());
//
//         this.values.get(key(currency)).addByBlockNumber(value, prevBlockNumber, currBlockNumber);
//     }
// }

class AllocatedDenominatedBlockNumberedCumulativeBN {
    constructor() {
        this.values = new Map();
    }

    hasAllocation(wallet) {
        return this.values.has(wallet);
    }

    getValueByBlockNumber(wallet, currency, blockNumber) {
        return this.hasAllocation(wallet) ?
            this.values.get(wallet).getValueByBlockNumber(currency, blockNumber) :
            bn0;
    }

    getCurrentValue(wallet, currency) {
        return this.hasAllocation(wallet) ?
            this.values.get(wallet).getCurrentValue(currency) :
            bn0;
    }

    getRecordByBlockNumber(wallet, currency, blockNumber) {
        return this.hasAllocation(wallet) ?
            this.values.get(wallet).getRecordByBlockNumber(currency, blockNumber) :
            [0, bn0];
    }

    getCurrentRecord(wallet, currency) {
        return this.hasAllocation(wallet) ?
            this.values.get(wallet).getCurrentRecord(currency) :
            [0, bn0];
    }

    setByBlockNumber(wallet, currency, value, blockNumber) {
        if (!this.hasAllocation(wallet))
            this.values.set(wallet, new DenominatedBlockNumberedCumulativeBN());

        this.values.get(wallet).setByBlockNumber(currency, value, blockNumber);
    }

    addByBlockNumber(wallet, currency, value, blockNumber) {
        if (!this.hasAllocation(wallet))
            this.values.set(wallet, new DenominatedBlockNumberedCumulativeBN());

        this.values.get(wallet).addByBlockNumber(currency, value, blockNumber);
    }

    subByBlockNumber(wallet, currency, value, blockNumber) {
        if (!this.hasAllocation(wallet))
            this.values.set(wallet, new DenominatedBlockNumberedCumulativeBN());

        this.values.get(wallet).subByBlockNumber(currency, value, blockNumber);
    }
}

// class AllocatedDenominatedBlockNumberedDiscreteBN {
//     constructor() {
//         this.values = new Map();
//     }
//
//     hasAllocation(wallet) {
//         return this.values.has(wallet);
//     }
//
//     getValueByBlockNumber(wallet, currency, blockNumber) {
//         return this.hasAllocation(wallet) ?
//             this.values.get(wallet).getValueByBlockNumber(currency, blockNumber) :
//             bn0;
//     }
//
//     getCurrentValue(wallet, currency) {
//         return this.hasAllocation(wallet) ?
//             this.values.get(wallet).getCurrentValue(currency) :
//             bn0;
//     }
//
//     addByBlockNumber(wallet, currency, value, prevBlockNumber, currBlockNumber) {
//         if (!this.hasAllocation(wallet))
//             this.values.set(wallet, new DenominatedBlockNumberedDiscreteBN());
//
//         this.values.get(wallet).addByBlockNumber(currency, value, prevBlockNumber, currBlockNumber);
//     }
// }

class CurrenciesSet {
    constructor() {
        this.currencies = [];
    }

    register(currency) {
        if (!this.currencies.find(e => e.ct == currency.ct && e.id == currency.id))
            this.currencies.push(currency);
    }

    entries() {
        return this.currencies;
    }
}

class AllocatedCurrency {
    constructor() {
        this.currenciesByWallet = new Map();
    }

    hasAllocation(wallet) {
        return this.currenciesByWallet.has(wallet);
    }

    register(wallet, currency) {
        if (!this.hasAllocation(wallet))
            this.currenciesByWallet.set(wallet, new CurrenciesSet());

        this.currenciesByWallet.get(wallet).register(currency);
    }

    entries() {
        return Array.from(this.currenciesByWallet.entries());
    }
}

const configuration = new (class Configuration {

    getSettlementChallengeTimeout() {
        return settlementChallengeTimeout
    }
});

const clientFund = new (class ClientFund {

    constructor() {
        this.depositedBalance = new AllocatedDenominatedBlockNumberedCumulativeBN();
        this.settledBalance = new AllocatedDenominatedBlockNumberedCumulativeBN();
        this.stagedBalance = new AllocatedDenominatedBlockNumberedCumulativeBN();
        this.walletCurrency = new AllocatedCurrency();
    }

    getDepositedBalanceAmount(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.depositedBalance.getValueByBlockNumber(wallet, currency, blockNumber) :
            this.depositedBalance.getCurrentValue(wallet, currency);
    }

    getSettledBalanceAmount(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.settledBalance.getValueByBlockNumber(wallet, currency, blockNumber) :
            this.settledBalance.getCurrentValue(wallet, currency);
    }

    getStagedBalanceAmount(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.stagedBalance.getValueByBlockNumber(wallet, currency, blockNumber) :
            this.stagedBalance.getCurrentValue(wallet, currency);
    }

    getActiveBalanceAmount(wallet, currency, blockNumber) {
        return this.getDepositedBalanceAmount(wallet, currency, blockNumber).add(
            this.getSettledBalanceAmount(wallet, currency, blockNumber)
        );
    }

    getDepositedBalance(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.depositedBalance.getRecordByBlockNumber(wallet, currency, blockNumber) :
            this.depositedBalance.getCurrentRecord(wallet, currency);
    }

    getSettledBalance(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.settledBalance.getRecordByBlockNumber(wallet, currency, blockNumber) :
            this.settledBalance.getCurrentRecord(wallet, currency);
    }

    getStagedBalance(wallet, currency, blockNumber) {
        return undefined !== blockNumber ?
            this.stagedBalance.getRecordByBlockNumber(wallet, currency, blockNumber) :
            this.stagedBalance.getCurrentRecord(wallet, currency);
    }

    getActiveBalance(wallet, currency, blockNumber) {
        const [depositedBalanceBlockNumber, depositedBalanceAmount] =
            this.getDepositedBalance(wallet, currency, blockNumber);
        const [settledBalanceBlockNumber, settledBalanceAmount] =
            this.getSettledBalance(wallet, currency, blockNumber);
        return [
            depositedBalanceBlockNumber > settledBalanceBlockNumber ? depositedBalanceBlockNumber : settledBalanceBlockNumber,
            depositedBalanceAmount.add(settledBalanceAmount)
        ];
    }

    receive(wallet, amount, currency, blockNumber) {
        this.depositedBalance.addByBlockNumber(wallet, currency, amount, blockNumber);
        this.walletCurrency.register(wallet, currency);
    }

    withdraw(wallet, amount, currency, blockNumber) {
        this.stagedBalance.subByBlockNumber(wallet, currency, amount, blockNumber);
    }

    updateSettledBalance(wallet, amount, currency, blockNumber) {
        assert(!amount.isNeg(), `Negative update settled balance amount ${amount.toString()} for ${walletCurrencyKey(
            wallet, currency
        )}`);

        this.settledBalance.setByBlockNumber(wallet, currency, amount.sub(
            this.depositedBalance.getValueByBlockNumber(wallet, currency, blockNumber)
        ), blockNumber);

        this.walletCurrency.register(wallet, currency);
    }

    stage(wallet, amount, currency, blockNumber) {
        assert(amount.isPos(), `Non-positive stage amount ${amount.toString()} for ${walletCurrencyKey(
            wallet, currency
        )}`);

        const activeBalanceAmount = this.settledBalance.getValueByBlockNumber(wallet, currency, blockNumber).add(
            this.depositedBalance.getValueByBlockNumber(wallet, currency, blockNumber)
        );

        amount = amount.gt(activeBalanceAmount) ? activeBalanceAmount : amount;

        let _amount = amount;

        const settledBalanceAmount = this.settledBalance.getValueByBlockNumber(wallet, currency, blockNumber);
        if (settledBalanceAmount.gte(_amount)) {
            this.settledBalance.subByBlockNumber(wallet, currency, _amount, blockNumber);
            _amount = bn0;
        } else {
            this.settledBalance.setByBlockNumber(wallet, currency, bn0, blockNumber);
            _amount = _amount.sub(settledBalanceAmount);
        }

        if (_amount.isPos()) {
            const depositedBalanceAmount = this.getDepositedBalanceAmount(wallet, currency, blockNumber);
            if (depositedBalanceAmount.gte(_amount))
                this.depositedBalance.subByBlockNumber(wallet, currency, _amount, blockNumber);
            else
                assert(false);
        }

        this.stagedBalance.addByBlockNumber(wallet, currency, amount, blockNumber);
    }

    async exportState(dir) {
        const data = {};
        (await Promise.all(this.walletCurrency.entries().map(async ([wallet, currencies]) => {
            return [wallet, await Promise.all(currencies.entries().map(async (currency) => ({
                currency,
                balanceAmounts: {
                    deposited: (await this.getDepositedBalanceAmount(wallet, currency)).toString(),
                    settled: (await this.getSettledBalanceAmount(wallet, currency)).toString(),
                    staged: (await this.getStagedBalanceAmount(wallet, currency)).toString()
                }
            })))];
        }))).reduce((s, e) => {
            s[e[0]] = e[1];
            return s;
        }, data);

        await fs.mkdir(dir, {recursive: true});

        await fs.writeFile(
            `${dir}/state.json`,
            JSON.stringify(data, null, 2)
        );
    }
})();

const driipSettlementChallengeState = new (class DriipSettlementChallengeState {

    constructor() {
        this.proposals = [];
        this.proposalIndexByWalletCurrency = new Map();
        this.proposalIndexByWalletNonceCurrency = new Map();
    }

    initiateProposal(wallet, nonce, cumulativeTransferAmount,
                     stageAmount, targetBalanceAmount,
                     currency, referenceBlockNumber, challengedHash,
                     definitionBlockNumber, definitionTimestamp) {
        const walletCurrencyKey = key(wallet, currency);
        const walletNonceCurrencyKey = key(wallet, nonce, currency);

        assert(!stageAmount.isNeg(), `Negative stage amount ${stageAmount.toString()} for ${walletNonceCurrencyKey}`);
        assert(!targetBalanceAmount.isNeg(), `Negative target balance amount ${targetBalanceAmount.toString()} for ${walletNonceCurrencyKey}`);

        const proposal = {
            wallet,
            nonce,
            referenceBlockNumber,
            definitionBlockNumber,
            expirationTime: definitionTimestamp + configuration.getSettlementChallengeTimeout(),
            status: 0,
            amounts: {
                cumulativeTransfer: cumulativeTransferAmount,
                stage: stageAmount,
                targetBalance: targetBalanceAmount
            },
            currency,
            challenged: {
                kind: 'payment',
                hash: challengedHash
            },
            walletInitiated: true,
            terminated: false,
            disqualification: {
                challenger: address0,
                nonce: 0,
                blockNumber: 0,
                candidate: {
                    kind: '',
                    hash: hash0
                }
            }
        };

        let index = this.proposalIndexByWalletCurrency.has(walletCurrencyKey) ?
            this.proposalIndexByWalletCurrency.get(walletCurrencyKey) :
            0;

        if (0 === index) {
            this.proposals.push(proposal);
            index = this.proposals.length;
            this.proposalIndexByWalletCurrency.set(walletCurrencyKey, index);
        } else
            this.proposals[index - 1] = proposal;

        this.proposalIndexByWalletNonceCurrency.set(walletNonceCurrencyKey, index);
    }

    terminateProposal(wallet, currency) {
        const proposal = this.getProposal(wallet, currency);
        assert(proposal, `Missing proposal for ${walletCurrencyKey(wallet, currency)}`);
        proposal.terminated = true;
    }

    hasProposal(wallet, currency) {
        return this.proposalIndexByWalletCurrency.has(key(wallet, currency))
    }

    getProposal(wallet, currency) {
        const k = key(wallet, currency);
        assert(this.proposalIndexByWalletCurrency.has(k));
        return this.proposals[this.proposalIndexByWalletCurrency.get(k) - 1];
    }

    async exportState(dir) {
        await fs.mkdir(dir, {recursive: true});

        const proposals = this.proposals.map(p => {
            p.amounts.cumulativeTransfer = p.amounts.cumulativeTransfer.toString();
            p.amounts.stage = p.amounts.stage.toString();
            p.amounts.targetBalance = p.amounts.targetBalance.toString();
            return p;
        });
        await fs.writeFile(
            `${dir}/proposals.json`,
            JSON.stringify(proposals, null, 2)
        );

        const proposalIndexByWalletCurrency = Array.from(this.proposalIndexByWalletCurrency.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/proposalIndexByWalletCurrency.json`,
            JSON.stringify(proposalIndexByWalletCurrency, null, 2)
        );

        const proposalIndexByWalletNonceCurrency = Array.from(this.proposalIndexByWalletNonceCurrency.entries()).reduce((map, elm) => {
            const [wallet, nonce, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][nonce])
                map[wallet][nonce] = {};

            if (!map[wallet][nonce][currencyCt])
                map[wallet][nonce][currencyCt] = {};

            map[wallet][nonce][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/proposalIndexByWalletNonceCurrency.json`,
            JSON.stringify(proposalIndexByWalletNonceCurrency, null, 2)
        );
    }
});

const nullSettlementChallengeState = new (class NullSettlementChallengeState {

    constructor() {
        this.proposals = [];
        this.proposalIndexByWalletCurrency = new Map();
    }

    initiateProposal(wallet, nonce,
                     stageAmount, targetBalanceAmount,
                     currency, referenceBlockNumber,
                     definitionBlockNumber, definitionTimestamp) {
        const walletCurrencyKey = key(wallet, currency);
        const walletNonceCurrencyKey = key(wallet, nonce, currency);

        assert(!stageAmount.isNeg(), `Negative stage amount ${stageAmount.toString()} for ${walletNonceCurrencyKey}`);
        assert(!targetBalanceAmount.isNeg(), `Negative target balance amount ${targetBalanceAmount.toString()} for ${walletNonceCurrencyKey}`);

        const proposal = {
            wallet,
            nonce,
            referenceBlockNumber,
            definitionBlockNumber,
            expirationTime: definitionTimestamp + configuration.getSettlementChallengeTimeout(),
            status: 0,
            amounts: {
                cumulativeTransfer: bn0,
                stage: stageAmount,
                targetBalance: targetBalanceAmount
            },
            currency,
            challenged: {
                kind: '',
                hash: hash0
            },
            walletInitiated: true,
            terminated: false,
            disqualification: {
                challenger: address0,
                nonce: 0,
                blockNumber: 0,
                candidate: {
                    kind: '',
                    hash: hash0
                }
            }
        };

        let index = this.proposalIndexByWalletCurrency.has(walletCurrencyKey) ?
            this.proposalIndexByWalletCurrency.get(walletCurrencyKey) :
            0;

        if (0 === index) {
            this.proposals.push(proposal);
            index = this.proposals.length;
            this.proposalIndexByWalletCurrency.set(walletCurrencyKey, index);
        } else
            this.proposals[index - 1] = proposal;
    }

    terminateProposal(wallet, currency) {
        const proposal = this.getProposal(wallet, currency);
        assert(proposal, `Missing proposal for ${walletCurrencyKey(wallet, currency)}`);
        proposal.terminated = true;
    }

    hasProposal(wallet, currency) {
        return this.proposalIndexByWalletCurrency.has(key(wallet, currency))
    }

    getProposal(wallet, currency) {
        const k = key(wallet, currency);
        assert(this.proposalIndexByWalletCurrency.has(k));
        return this.proposals[this.proposalIndexByWalletCurrency.get(k) - 1];
    }

    async exportState(dir) {
        await fs.mkdir(dir, {recursive: true});

        const proposals = this.proposals.map(p => {
            p.amounts.stage = p.amounts.stage.toString();
            p.amounts.targetBalance = p.amounts.targetBalance.toString();
            return p;
        });
        await fs.writeFile(
            `${dir}/proposals.json`,
            JSON.stringify(proposals, null, 2)
        );

        const proposalIndexByWalletCurrency = Array.from(this.proposalIndexByWalletCurrency.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/proposalIndexByWalletCurrency.json`,
            JSON.stringify(proposalIndexByWalletCurrency, null, 2)
        );
    }
});

const driipSettlementState = new (class DriipSettlementState {

    constructor() {
        this.settlements = [];
        this.walletSettlementIndices = new Map();
        this.walletNonceSettlementIndex = new Map();
        this.walletCurrencyMaxNonce = new Map();
        this.walletCurrencyBlockNumberSettledAmount = new Map(); // AllocatedDenominatedBlockNumberedDiscreteBN();
        this.walletCurrencySettledBlockNumbers = new Map();
        this.totalFeesMap = new Map();
    }

    initSettlement(settledKind, settledHash, originWallet, originNonce, targetWallet, targetNonce) {
        const originWalletNonceKey = key(originWallet, originNonce);
        const targetWalletNonceKey = key(targetWallet, targetNonce);

        if (
            !this.walletNonceSettlementIndex.has(originWalletNonceKey) &&
            !this.walletNonceSettlementIndex.has(targetWalletNonceKey)
        ) {
            this.settlements.push({
                settledKind,
                settledHash,
                origin: {
                    nonce: originNonce,
                    wallet: originWallet,
                    doneBlockNumber: 0
                },
                target: {
                    nonce: targetNonce,
                    wallet: targetWallet,
                    doneBlockNumber: 0
                }
            });

            if (!this.walletSettlementIndices.has(originWallet))
                this.walletSettlementIndices.set(originWallet, []);
            this.walletSettlementIndices.get(originWallet).push(this.settlements.length);

            if (!this.walletSettlementIndices.has(targetWallet))
                this.walletSettlementIndices.set(targetWallet, []);
            this.walletSettlementIndices.get(targetWallet).push(this.settlements.length);

            this.walletNonceSettlementIndex.set(originWalletNonceKey, this.settlements.length);
            this.walletNonceSettlementIndex.set(targetWalletNonceKey, this.settlements.length);
        }
    }

    completeSettlement(wallet, nonce, /*role,*/ done, doneBlockNumber) {
        const k = key(wallet, nonce);

        assert(this.walletNonceSettlementIndex.has(k), `Non-existent settlement for ${walletNonceKey(wallet, nonce)}`);

        const settlement = this.settlements[this.walletNonceSettlementIndex.get(k) - 1];

        const settlementParty = wallet === settlement.origin.wallet ? settlement.origin : settlement.target;

        settlementParty.doneBlockNumber = done ? doneBlockNumber : 0;
    }

    setMaxNonceByWalletAndCurrency(wallet, currency, nonce) {
        const k = key(wallet, currency);
        this.walletCurrencyMaxNonce.set(k, nonce);
    }

    getSettledAmountAtBlockNumber(wallet, currency, blockNumber) {
        const settledBlockNumber = this.getSettledBlockNumber(wallet, currency, blockNumber);
        const k = key(wallet, currency, settledBlockNumber)
        return this.walletCurrencyBlockNumberSettledAmount.has(k) ? this.walletCurrencyBlockNumberSettledAmount.get(k) : bn0;
    }

    addSettledAmountByBlockNumber(wallet, amount, currency, prevBlockNumber, currBlockNumber) {
        let settledBlockNumber = this.getSettledBlockNumber(wallet, currency, prevBlockNumber);

        const settledKey = key(wallet, currency, settledBlockNumber);

        this.walletCurrencyBlockNumberSettledAmount.set(settledKey, amount.add(
            this.walletCurrencyBlockNumberSettledAmount.has(settledKey) ? this.walletCurrencyBlockNumberSettledAmount.get(settledKey) : bn0)
        );

        const walletCurrencyKey = key(wallet, currency);
        if (!this.walletCurrencySettledBlockNumbers.has(walletCurrencyKey))
            this.walletCurrencySettledBlockNumbers.set(walletCurrencyKey, []);
        this.walletCurrencySettledBlockNumbers.get(walletCurrencyKey).push(currBlockNumber);
    }

    getSettledBlockNumber(wallet, currency, blockNumber) {
        const k = key(wallet, currency);

        if (!this.walletCurrencySettledBlockNumbers.has(k))
            return 0;

        for (let b of Array.from(this.walletCurrencySettledBlockNumbers.get(k)).reverse())
            if (b <= blockNumber)
                return b;
        return 0;
    }

    // TODO Consider whether this should be called
    getTotalFee(wallet, /*beneficiary, destination,*/ currency) {
        return this.totalFeesMap.get(key(wallet, currency));
    }

    setTotalFee(wallet, /*beneficiary, destination,*/ currency, totalFee) {
        this.totalFeesMap.set(key(wallet, currency), totalFee);
    }

    async exportState(dir) {
        await fs.mkdir(dir, {recursive: true});

        await fs.writeFile(
            `${dir}/settlements.json`,
            JSON.stringify(this.settlements, null, 2)
        );

        const walletSettlementIndices = Array.from(this.walletSettlementIndices.entries()).reduce((map, elm) => {
            const wallet = elm[0];
            map[wallet] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletSettlementIndices.json`,
            JSON.stringify(walletSettlementIndices, null, 2)
        );

        const walletNonceSettlementIndex = Array.from(this.walletNonceSettlementIndex.entries()).reduce((map, elm) => {
            const [wallet, nonce] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            map[wallet][nonce] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletNonceSettlementIndex.json`,
            JSON.stringify(walletNonceSettlementIndex, null, 2)
        );

        const walletCurrencyMaxNonce = Array.from(this.walletCurrencyMaxNonce.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletCurrencyMaxNonce.json`,
            JSON.stringify(walletCurrencyMaxNonce, null, 2)
        );

        const walletCurrencyBlockNumberSettledAmount = Array.from(this.walletCurrencyBlockNumberSettledAmount.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId, blockNumber] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            if (!map[wallet][currencyCt][currencyId])
                map[wallet][currencyCt][currencyId] = {};

            map[wallet][currencyCt][currencyId][blockNumber] = elm[1].toString();
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletCurrencyBlockNumberSettledAmount.json`,
            JSON.stringify(walletCurrencyBlockNumberSettledAmount, null, 2)
        );

        const walletCurrencySettledBlockNumbers = Array.from(this.walletCurrencySettledBlockNumbers.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletCurrencySettledBlockNumbers.json`,
            JSON.stringify(walletCurrencySettledBlockNumbers, null, 2)
        );

        const totalFeesMap = Array.from(this.totalFeesMap.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = {
                nonce: elm[1].nonce,
                amount: elm[1].amount.toString()
            };
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/totalFeesMap.json`,
            JSON.stringify(totalFeesMap, null, 2)
        );
    }
})();

const nullSettlementState = new (class NullSettlementState {

    constructor() {
        this.walletCurrencyMaxNonce = new Map();
    }

    setMaxNonceByWalletAndCurrency(wallet, currency, nonce) {
        const k = key(wallet, currency);
        this.walletCurrencyMaxNonce.set(k, nonce);
    }

    async exportState(dir) {
        await fs.mkdir(dir, {recursive: true});

        const walletCurrencyMaxNonce = Array.from(this.walletCurrencyMaxNonce.entries()).reduce((map, elm) => {
            const [wallet, currencyCt, currencyId] = unkey(elm[0]);
            if (!map[wallet])
                map[wallet] = {};

            if (!map[wallet][currencyCt])
                map[wallet][currencyCt] = {};

            map[wallet][currencyCt][currencyId] = elm[1];
            return map;
        }, {});
        await fs.writeFile(
            `${dir}/walletCurrencyMaxNonce.json`,
            JSON.stringify(walletCurrencyMaxNonce, null, 2)
        );
    }
});

const parser = new (class JSONParser {

    async parseScenarios(dir) {
        const files = await fs.readdir(dir);

        let scenarios = new Map();
        for (let file of files) {
            const scenario = JSON.parse(await fs.readFile(`${dir}/${file}`));
            scenarios.set(file.substring(0, file.indexOf('.json')), scenario);
        }

        return scenarios;
    }
});

const driipSettlementChallengeByPayment = new (class DriipSettlementChallengeByPayment {

    startChallengeByPayment(step) {
        const activeBalanceAmountAtPaymentBlock = clientFund.getActiveBalanceAmount(
            step.wallet, step.data.currency, step.ref.blockNumber
        );
        const deltaSettledBalanceAmount = driipSettlementState.getSettledAmountAtBlockNumber(
            step.wallet, step.data.currency, step.ref.blockNumber
        );

        let correctedCumulativeTransferAmount;
        if (validator.isPaymentSender(step.ref, step.wallet))
            correctedCumulativeTransferAmount = step.ref.sender.balances.current
                .sub(activeBalanceAmountAtPaymentBlock)
                .sub(deltaSettledBalanceAmount);
        else
            correctedCumulativeTransferAmount = step.ref.recipient.balances.current
                .sub(activeBalanceAmountAtPaymentBlock)
                .sub(deltaSettledBalanceAmount);

        const currentActiveBalanceAmount = clientFund.getActiveBalanceAmount(
            step.wallet, step.data.currency
        );

        driipSettlementChallengeState.initiateProposal(
            step.wallet, step.data.nonce, correctedCumulativeTransferAmount, step.data.stageAmount,
            currentActiveBalanceAmount.add(correctedCumulativeTransferAmount.sub(step.data.stageAmount)),
            step.data.currency, step.ref.blockNumber, step.ref.seals.operator.hash,
            step.blockNumber, step.blockTimestamp
        )
    }
});

const driipSettlementByPayment = new (class DriipSettlementByPayment {

    settlePayment(step) {
        driipSettlementState.initSettlement(
            'payment', step.data.seals.operator.hash,
            step.data.sender.wallet, step.data.sender.nonce,
            step.data.recipient.wallet, step.data.recipient.nonce
        );

        let [correctedPaymentBalanceAmount, nonce, totalFees] = validator.isPaymentSender(step.data, step.wallet) ?
            [step.data.sender.balances.current, step.data.sender.nonce, step.data.sender.fees.total] :
            [step.data.recipient.balances.current, step.data.recipient.nonce, step.data.recipient.fees.total];

        const deltaActiveBalanceAmount = clientFund.getActiveBalanceAmount(
            step.wallet, step.data.currency
        ).sub(clientFund.getActiveBalanceAmount(
            step.wallet, step.data.currency, step.data.blockNumber
        ));

        const deltaSettledBalanceAmount = driipSettlementState.getSettledAmountAtBlockNumber(
            step.wallet, step.data.currency, step.data.blockNumber
        );

        const settleAmount = correctedPaymentBalanceAmount.sub(
            clientFund.getActiveBalanceAmount(step.wallet, step.data.currency, step.data.blockNumber)
        ).sub(deltaSettledBalanceAmount);

        correctedPaymentBalanceAmount = correctedPaymentBalanceAmount
            .add(deltaActiveBalanceAmount)
            .sub(deltaSettledBalanceAmount);

        driipSettlementState.setMaxNonceByWalletAndCurrency(step.wallet, step.data.currency, nonce);

        clientFund.updateSettledBalance(
            step.wallet, correctedPaymentBalanceAmount, step.data.currency, step.blockNumber
        );

        driipSettlementState.addSettledAmountByBlockNumber(
            step.wallet, settleAmount, step.data.currency, step.data.blockNumber, step.blockNumber
        );

        const proposal = driipSettlementChallengeState.getProposal(step.wallet, step.data.currency);
        clientFund.stage(step.wallet, proposal.amounts.stage, step.data.currency, step.blockNumber);

        for (let totalFee of totalFees)
            driipSettlementState.setTotalFee(step.wallet, step.data.currency, {nonce, amount: totalFee.figure.amount})

        driipSettlementState.completeSettlement(step.wallet, nonce, true, step.blockNumber);

        driipSettlementChallengeState.terminateProposal(step.wallet, step.data.currency);
    }
});

const nullSettlementChallengeByPayment = new (class NullSettlementChallengeByPayment {

    startChallenge(step) {
        const [currentActiveBalanceBlockNumber, currentActiveBalanceAmount] =
            clientFund.getActiveBalance(step.wallet, step.data.currency);

        let dscCumulativeTransferAmount = bn0, dscStageAmount = bn0, nonce = 0;

        if (driipSettlementChallengeState.hasProposal(step.wallet, step.data.currency)) {
            const dscProposal = driipSettlementChallengeState.getProposal(step.wallet, step.data.currency);

            if (!dscProposal.terminated) {
                dscCumulativeTransferAmount = dscProposal.amounts.cumulativeTransfer;
                dscStageAmount = dscProposal.amounts.stage;
            }

            nonce = dscProposal.nonce;
        }

        if (nullSettlementChallengeState.hasProposal(step.wallet, step.data.currency)) {
            const nscProposal = nullSettlementChallengeState.getProposal(step.wallet, step.data.currency);
            nonce = nonce < nscProposal.nonce ? nscProposal.nonce : nonce;
        }

        nullSettlementChallengeState.initiateProposal(
            step.wallet, nonce, step.data.stageAmount,
            currentActiveBalanceAmount.add(
                dscCumulativeTransferAmount.sub(dscStageAmount).sub(step.data.stageAmount)
            ),
            step.data.currency, currentActiveBalanceBlockNumber,
            step.blockNumber, step.blockTimestamp
        )
    }
});

const nullSettlement = new (class NullSettlement {

    settleNull(step) {
        const proposal = nullSettlementChallengeState.getProposal(step.wallet, step.data.currency);

        nullSettlementState.setMaxNonceByWalletAndCurrency(step.wallet, step.data.currency, proposal.nonce);

        clientFund.stage(step.wallet, proposal.amounts.stage, step.data.currency, step.blockNumber);

        nullSettlementChallengeState.terminateProposal(step.wallet, step.data.currency);
    }
});

const validator = new (class Validator {

    isPaymentSender(payment, wallet) {
        if (payment.sender.wallet == wallet)
            return true;
        else if (payment.recipient.wallet == wallet)
            return false;
        else
            assert.fail(`Wallet ${wallet} found as neither sender nor recipient of ${payment}`);
    }
});

const stepExecutor = new (class StepExecutor {

    executeStep(step) {
        switch (step.action) {
            case 'receive':
                clientFund.receive(step.wallet, step.data.value, step.data.currency, step.blockNumber);
                break;
            case 'withdraw':
                clientFund.withdraw(step.wallet, step.data.value, step.data.currency, step.blockNumber);
                break;
            case 'start-payment-challenge':
                driipSettlementChallengeByPayment.startChallengeByPayment(step);
                break;
            case 'settle-payment':
                driipSettlementByPayment.settlePayment(step);
                break;
            case 'start-null-challenge':
                nullSettlementChallengeByPayment.startChallenge(step);
                break;
            case 'settle-null':
                nullSettlement.settleNull(step);
                break;
        }
    }
});

const bnUtil = new (class BNUtil {
    bigNumberifyStep(step) {
        switch (step.action) {
            case 'start-payment-challenge':
                step.data.cumulativeTransferAmount = new BN(step.data.cumulativeTransferAmount);
                step.data.stageAmount = new BN(step.data.stageAmount);
                step.data.targetBalanceAmount = new BN(step.data.targetBalanceAmount);
                step.ref.amount = new BN(step.ref.amount);
                step.ref.sender.balances.current = new BN(step.ref.sender.balances.current);
                step.ref.sender.balances.previous = new BN(step.ref.sender.balances.previous);
                step.ref.recipient.balances.current = new BN(step.ref.recipient.balances.current);
                step.ref.recipient.balances.previous = new BN(step.ref.recipient.balances.previous);
                step.ref.transfers.single = new BN(step.ref.transfers.single);
                step.ref.transfers.total = new BN(step.ref.transfers.total);
                break;
            case 'settle-payment':
                step.data.amount = new BN(step.data.amount);
                step.data.sender.balances.current = new BN(step.data.sender.balances.current);
                step.data.sender.balances.previous = new BN(step.data.sender.balances.previous);
                step.data.sender.fees.single.amount = new BN(step.data.sender.fees.single.amount);
                step.data.sender.fees.total.forEach(t => t.figure.amount = new BN(t.figure.amount));
                step.data.recipient.balances.current = new BN(step.data.recipient.balances.current);
                step.data.recipient.balances.previous = new BN(step.data.recipient.balances.previous);
                step.data.recipient.fees.total.forEach(t => t.figure.amount = new BN(t.figure.amount));
                break;
            case 'start-null-challenge':
                step.data.stageAmount = new BN(step.data.stageAmount);
                step.data.targetBalanceAmount = new BN(step.data.targetBalanceAmount);
                break;
            case 'receive':
            case 'withdraw':
                step.data.value = new BN(step.data.value);
                break;
        }
        return step;
    }
});

const stateLogger = new (class StateLogger {
    logStateBeforeStep(step) {
        debug(chalk.yellow(`${step.wallet}: Action '${step.action}' before block number ${step.blockNumber}`));
        debug(chalk.blue(`> currency:                {ct: ${step.data.currency.ct}, id: ${step.data.currency.id}}`));
        debug(chalk.blue(`> deposited balance (CF):  ${clientFund.getDepositedBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> settled balance (CF):    ${clientFund.getSettledBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> staged balance (CF):     ${clientFund.getStagedBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> settled amount (DSS):    ${driipSettlementState.getSettledAmountAtBlockNumber(step.wallet, step.data.currency, step.blockNumber)}`));
        debug();
    }

    logStateAfterStep(step) {
        debug(chalk.yellow(`${step.wallet}: Action '${step.action}' after block number ${step.blockNumber}`));
        debug(chalk.blue(`> currency:                {ct: ${step.data.currency.ct}, id: ${step.data.currency.id}}`));
        debug(chalk.blue(`> deposited balance (CF):  ${clientFund.getDepositedBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> settled balance (CF):    ${clientFund.getSettledBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> staged balance (CF):     ${clientFund.getStagedBalanceAmount(step.wallet, step.data.currency, step.blockNumber)}`));
        debug(chalk.blue(`> settled amount (DSS):    ${driipSettlementState.getSettledAmountAtBlockNumber(step.wallet, step.data.currency, step.blockNumber)}`));
        debug();
    }
});

(async function () {
    const scenarios = await parser.parseScenarios(`${rootDir}/scenarios`);

    for (const [wallet, steps] of scenarios[Symbol.iterator]())
        // if ('0xa79d2291c8245aaa2a71fe660e321db98fb5322d' == wallet)
        steps.forEach(step => {
            // stateLogger.logStateBeforeStep(step);
            stepExecutor.executeStep(bnUtil.bigNumberifyStep(step));
            stateLogger.logStateAfterStep(step);
        });

    await clientFund.exportState(`${rootDir}/import/ClientFund`);
    await driipSettlementChallengeState.exportState(`${rootDir}/import/DriipSettlementChallengeState`);
    await driipSettlementState.exportState(`${rootDir}/import/DriipSettlementState`);
    await nullSettlementChallengeState.exportState(`${rootDir}/import/NullSettlementChallengeState`);
    await nullSettlementState.exportState(`${rootDir}/import/NullSettlementState`);
})();