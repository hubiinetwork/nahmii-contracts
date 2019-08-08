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
