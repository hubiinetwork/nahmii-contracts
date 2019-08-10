rs.slaveOk();

const it = db.getCollection('payments').aggregate({
        $match: {
            $and: [
                {'seals.operator': {$exists: true}},
                {
                    $or: [
                        {
                            "sender.wallet": "0x5f2f31d14d9388b07773433a6742885dd0e0c13b",
                            "sender.nonce": 4
                        },
                        {
                            "recipient.wallet": "0x5f2f31d14d9388b07773433a6742885dd0e0c13b",
                            "recipient.nonce": 4
                        },
                        {
                            "sender.wallet": "0x473a47d4ae5b86bc5897a8af1c8bea297a1399dc",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x473a47d4ae5b86bc5897a8af1c8bea297a1399dc",
                            "recipient.nonce": 1
                        },
                        {
                            "sender.wallet": "0x473a47d4ae5b86bc5897a8af1c8bea297a1399dc",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x473a47d4ae5b86bc5897a8af1c8bea297a1399dc",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x7d093b992259ec4eb0d1325a38c2f7a7895eb5c9",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x7d093b992259ec4eb0d1325a38c2f7a7895eb5c9",
                            "recipient.nonce": 1
                        },
                        {
                            "sender.wallet": "0x72f080e99f3dde398aab2c0eb29faac17cc8b8d7",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x72f080e99f3dde398aab2c0eb29faac17cc8b8d7",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x7d093b992259ec4eb0d1325a38c2f7a7895eb5c9",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x7d093b992259ec4eb0d1325a38c2f7a7895eb5c9",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x75122ea46625961a752a52bafe3b146fa04b3f4b",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x75122ea46625961a752a52bafe3b146fa04b3f4b",
                            "recipient.nonce": 1
                        },
                        {
                            "sender.wallet": "0x75122ea46625961a752a52bafe3b146fa04b3f4b",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x75122ea46625961a752a52bafe3b146fa04b3f4b",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x98c97cb8cab0aa37c8c423c827efdff8c52285bd",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x98c97cb8cab0aa37c8c423c827efdff8c52285bd",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x98c97cb8cab0aa37c8c423c827efdff8c52285bd",
                            "sender.nonce": 4
                        },
                        {
                            "recipient.wallet": "0x98c97cb8cab0aa37c8c423c827efdff8c52285bd",
                            "recipient.nonce": 4
                        },
                        {
                            "sender.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "recipient.nonce": 1
                        },
                        {
                            "sender.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "sender.nonce": 5
                        },
                        {
                            "recipient.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "recipient.nonce": 5
                        },
                        {
                            "sender.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "sender.nonce": 8
                        },
                        {
                            "recipient.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "recipient.nonce": 8
                        },
                        {
                            "sender.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "sender.nonce": 5
                        },
                        {
                            "recipient.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "recipient.nonce": 5
                        },
                        {
                            "sender.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "sender.nonce": 8
                        },
                        {
                            "recipient.wallet": "0x5b29714ae94b49ae4f5ad1576c45538d6f5656b5",
                            "recipient.nonce": 8
                        },
                        {
                            "sender.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "sender.nonce": 11
                        },
                        {
                            "recipient.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "recipient.nonce": 11
                        },
                        {
                            "sender.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "sender.nonce": 9
                        },
                        {
                            "recipient.wallet": "0x2156979fd495f5c1650c163f9a568defae52ec9c",
                            "recipient.nonce": 9
                        },
                        {
                            "sender.wallet": "0xcd7620a80f834f994ee5d27d4dcd2df5decfb6fe",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0xcd7620a80f834f994ee5d27d4dcd2df5decfb6fe",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "sender.nonce": 3
                        },
                        {
                            "recipient.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "recipient.nonce": 3
                        },
                        {
                            "sender.wallet": "0xa79d2291c8245aaa2a71fe660e321db98fb5322d",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0xa79d2291c8245aaa2a71fe660e321db98fb5322d",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0xa79d2291c8245aaa2a71fe660e321db98fb5322d",
                            "sender.nonce": 3
                        },
                        {
                            "recipient.wallet": "0xa79d2291c8245aaa2a71fe660e321db98fb5322d",
                            "recipient.nonce": 3
                        },
                        {
                            "sender.wallet": "0xcd7620a80f834f994ee5d27d4dcd2df5decfb6fe",
                            "sender.nonce": 3
                        },
                        {
                            "recipient.wallet": "0xcd7620a80f834f994ee5d27d4dcd2df5decfb6fe",
                            "recipient.nonce": 3
                        },
                        {
                            "sender.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "sender.nonce": 6
                        },
                        {
                            "recipient.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "recipient.nonce": 6
                        },
                        {
                            "sender.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "sender.nonce": 7
                        },
                        {
                            "recipient.wallet": "0x92b54611baa385feb5c667e797ddc8590e569776",
                            "recipient.nonce": 7
                        },
                        {
                            "sender.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "recipient.nonce": 1
                        }
                    ]
                }
            ]
        }
    },
    {
        $unwind: {path: '$sender.fees.total', preserveNullAndEmptyArrays: true}
    },
    {
        $unwind: {path: '$recipient.fees.total', preserveNullAndEmptyArrays: true}
    },
    {
        $addFields: {
            '_id': {$toString: '$_id'},
            'amount': {$toString: '$amount'},
            'currency.id': {$toInt: '$currency.id'},
            'sender.balances.current': {$toString: '$sender.balances.current'},
            'sender.balances.previous': {$toString: '$sender.balances.previous'},
            'sender.fees.total.figure.amount': {$toString: '$sender.fees.total.figure.amount'},
            'recipient.balances.current': {$toString: '$recipient.balances.current'},
            'recipient.balances.previous': {$toString: '$recipient.balances.previous'},
            'recipient.fees.total.figure.amount': {$toString: '$recipient.fees.total.figure.amount'},
            'transfers.single': {$toString: '$transfers.single'},
            'transfers.total': {$toString: '$transfers.total'},
            'blockNumber': {$toInt: '$blockNumber'}
        }
    },
    {
        $project: {
            'amount': true,
            'currency.ct': true,
            'currency.id': true,
            'sender.wallet': true,
            'sender.nonce': true,
            'sender.balances.current': true,
            'sender.balances.previous': true,
            'sender.fees.total': true,
            'recipient.wallet': true,
            'recipient.nonce': true,
            'recipient.balances.current': true,
            'recipient.balances.previous': true,
            'recipient.fees.total': true,
            'transfers': true,
            'blockNumber': true,
            'seals': true
        }
    }
);

printjson(it.toArray());
