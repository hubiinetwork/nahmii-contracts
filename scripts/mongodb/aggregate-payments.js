rs.slaveOk();

const it = db.getCollection('payments').aggregate({
        $match: {
            $and: [
                {'seals.operator': {$exists: true}},
                {
                    $or: [
                        {
                            "sender.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "sender.nonce": 1
                        },
                        {
                            "recipient.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "recipient.nonce": 1
                        },
                        {
                            "sender.wallet": "0x77354ee440e930b7a256c8a15afb5b575e490aef",
                            "sender.nonce": 5
                        },
                        {
                            "recipient.wallet": "0x77354ee440e930b7a256c8a15afb5b575e490aef",
                            "recipient.nonce": 5
                        },
                        {
                            "sender.wallet": "0x9713fe8824c70c2987cd7c649a319f6cf8977165",
                            "sender.nonce": 4
                        },
                        {
                            "recipient.wallet": "0x9713fe8824c70c2987cd7c649a319f6cf8977165",
                            "recipient.nonce": 4
                        },
                        {
                            "sender.wallet": "0x16e7a2d13a967f4467de8dc2f574a2003d3f6a2b",
                            "sender.nonce": 3
                        },
                        {
                            "recipient.wallet": "0x16e7a2d13a967f4467de8dc2f574a2003d3f6a2b",
                            "recipient.nonce": 3
                        },
                        {
                            "sender.wallet": "0xe1dddbd012f6a9f3f0a346a2b418aecd03b058e7",
                            "sender.nonce": 8
                        },
                        {
                            "recipient.wallet": "0xe1dddbd012f6a9f3f0a346a2b418aecd03b058e7",
                            "recipient.nonce": 8
                        },
                        {
                            "sender.wallet": "0x79cdb8174e097db3a391d29aefc988581456cf00",
                            "sender.nonce": 5
                        },
                        {
                            "recipient.wallet": "0x79cdb8174e097db3a391d29aefc988581456cf00",
                            "recipient.nonce": 5
                        },
                        {
                            "sender.wallet": "0x86348f6d11893768fc8cbad8084d021c33895cec",
                            "sender.nonce": 13
                        },
                        {
                            "recipient.wallet": "0x86348f6d11893768fc8cbad8084d021c33895cec",
                            "recipient.nonce": 13
                        },
                        {
                            "sender.wallet": "0x2c940d0889f8261e0f6b4d23f253a4c6cb862780",
                            "sender.nonce": 8
                        },
                        {
                            "recipient.wallet": "0x2c940d0889f8261e0f6b4d23f253a4c6cb862780",
                            "recipient.nonce": 8
                        },
                        {
                            "sender.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "sender.nonce": 2
                        },
                        {
                            "recipient.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "recipient.nonce": 2
                        },
                        {
                            "sender.wallet": "0x7344328668927e8b25ee00751a072f751cbf4993",
                            "sender.nonce": 10
                        },
                        {
                            "recipient.wallet": "0x7344328668927e8b25ee00751a072f751cbf4993",
                            "recipient.nonce": 10
                        },
                        {
                            "sender.wallet": "0xf7ca4ffecfd4e33ff5fbf612d9e3f09763ed2563",
                            "sender.nonce": 7
                        },
                        {
                            "recipient.wallet": "0xf7ca4ffecfd4e33ff5fbf612d9e3f09763ed2563",
                            "recipient.nonce": 7
                        },
                        {
                            "sender.wallet": "0x7344328668927e8b25ee00751a072f751cbf4993",
                            "sender.nonce": 12
                        },
                        {
                            "recipient.wallet": "0x7344328668927e8b25ee00751a072f751cbf4993",
                            "recipient.nonce": 12
                        },
                        {
                            "sender.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "sender.nonce": 3
                        },
                        {
                            "recipient.wallet": "0x105a18d55732fe5ed7c0a62036e624d4ba1c17b5",
                            "recipient.nonce": 3
                        },
                        {
                            "sender.wallet": "0x86348f6d11893768fc8cbad8084d021c33895cec",
                            "sender.nonce": 14
                        },
                        {
                            "recipient.wallet": "0x86348f6d11893768fc8cbad8084d021c33895cec",
                            "recipient.nonce": 14
                        },
                        {
                            "sender.wallet": "0x0d117250cc44896b5dfb1a46f6b012d672459ae3",
                            "sender.nonce": 12
                        },
                        {
                            "recipient.wallet": "0x0d117250cc44896b5dfb1a46f6b012d672459ae3",
                            "recipient.nonce": 12
                        },
                        {
                            "sender.wallet": "0x9713fe8824c70c2987cd7c649a319f6cf8977165",
                            "sender.nonce": 7
                        },
                        {
                            "recipient.wallet": "0x9713fe8824c70c2987cd7c649a319f6cf8977165",
                            "recipient.nonce": 7
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
