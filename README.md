# Striim Contracts

This is the home of code for Hubii's Striim smart contracts.

## Whitepaper

Please see the release page (https://github.com/hubiinetwork/striim-contracts/releases) to download the whitepaper.

## Deployments

The contracts are currently deployed to the **Ropsten** test network under the following addresses:

```javascript
{
  "networks": {
    "3": {
      "MonetaryTypes": "0x9f61ed0a41ddc36aeef1273e3d95cd04cdb44bf3",
      "SafeMathInt": "0x3401cd2cedd4e1ca4dd9d33e0884faf0bdcaae58",
      "SafeMathUint": "0x6b44ae0be05eee69d7923367a5c129ce5b1acff8",
      "StriimTypes": "0xaa6c9d5eec5142ec8a0ee672704cb4ca4a6bc8a7",
      "BalanceLib": "0x4a4e69ee1179d9354675e7ee92fb9ac3afca8311",
      "InUseCurrencyLib": "0xcfc1d6e710f4b74fbb3740af4302f96bd9917ed2",
      "TxHistoryLib": "0x49b8219d52fa4f13328f2f7c81d27f4b7466aabe",
      "DriipSettlementTypes": "0xa1ba9193129f45023ece1b5beaa0528b177d9210",
      "ERC20TransferController": "0x6d5a28c6574044c8ba1ff60158649aa872044848",
      "ERC721TransferController": "0x12ca7bab76f87dd61be500bee7c6d0ddd7036884",
      "TransferControllerManager": "0x38149b3a491e3abd6ea639ee6f7fc5ea6180384f",
      "Hasher": "0xd64fc8c5d35d13120aa7ed07361fc53cacedd851",
      "Validator": "0xfc9ccffe13a0202d32cce4d6be4ba327301c17fb",
      "ClientFund": "0x1fe59c223fa4e9781237f0f49a15ca598069cc30",
      "CommunityVote": "0x09372f0f0d107dfe14583850147b2de291facb66",
      "Configuration": "0x53b9157a1dee3654a3204d03af0e5cc78a8fb392",
      "Exchange": "0x9662cfa18e13ded518fa65e25e2d0e0c12d94293",
      "CancelOrdersChallenge": "0x73465d2248286fd460a24745c5f922a4e2300846",
      "DriipSettlementChallenge": "0x2be31fef66da0bdb1baada163a458305a4dac255",
      "DriipSettlementDispute": "0x4fc329a5f2371c47bf8a6b512823b17813b06fdd",
      "FraudChallengeByOrder": "0x22260c6c2988ebfd14d065360173ecc1a118c825",
      "FraudChallengeByTrade": "0x5ccbc863751ad8a8b1db9d78a104ea8127cdef73",
      "FraudChallengeByPayment": "0xe4ece8b1414ec9139197b916ef9adb8b82cdc2a6",
      "FraudChallengeBySuccessiveTrades": "0xfcfbf8055fb092ad152fddfca8612653e1deeb84",
      "FraudChallengeBySuccessivePayments": "0x9b394c93a2fac400b49e3eb1011527c3c754c8eb",
      "FraudChallengeByPaymentSucceedingTrade": "0x19bfa98cb7e0efa251d778e8656a4c59eebfe793",
      "FraudChallengeByTradeSucceedingPayment": "0x6572d251e565e9a65aa79db3a3628255c04291e2",
      "FraudChallengeByTradeOrderResiduals": "0x179a4476ff9a6c0beea191ab3bb4756067fc5719",
      "FraudChallengeByDoubleSpentOrders": "0x0d6266f7efd29207d4e55f1e1975636337ac8e89",
      "FraudChallengeByDuplicateDriipNonceOfTrades": "0x6a19626a1f42a3206b7c39282206eaf7ce506aa2",
      "FraudChallengeByDuplicateDriipNonceOfPayments": "0x0a77d71272001b164236a6c27253b611f082c509",
      "FraudChallengeByDuplicateDriipNonceOfTradeAndPayment": "0xdba714580f594f6f08e1046263f6001c61e340cc",
      "FraudChallenge": "0xa85352ba7312c8a299a2efc21e42bf149a7c3729",
      "TradesRevenueFund": "0x4bb9ecc5e36e1567639d463f3db8e2a513f6dbfc",
      "PaymentsRevenueFund": "0x13eed2a35c6f49189e6e4622faeb7ee0c5c49e41",
      "SecurityBond": "0xf8c9c5b8cdd5997ed7a9c245f7be63a48960ce9c",
      "TokenHolderRevenueFund": "0xb4125eadccd3e699b4d0a9508f3409e67a79b551",
      "PartnerFund": "0x35c634a0b6eb7ddff3b5b9f63b9af6064686ec42"
    }
  },
  "updatedAt": "2018-09-06T23:02:36.070Z"
}
```

## Tests

In order to run the included tests there are a couple of alternatives readily available.

[Truffle Develop](https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console) may be spawned by `truffle develop`. Running command `test` in its REPL will initiate a run of all tests.

Alternatively the standard `npm test` may be run. This command spawns an instance of [ganache-cli](https://github.com/trufflesuite/ganache-cli) on which smart contracts are deployed and tests executed against.

## Bytecode Verification

Etherscan code verification is currently not possible, even with the updated version 2 of their verification form. (https://ropsten.etherscan.io/verifyContract2). A support ticket has been filed and a tech blog post will provide more details about this later on.

## Contributing

### Bug reports

Please open issues in the issue tracker and label them as bugs.

### Development

All development is happening on the develop branch by using pull requests. Master branch is reserved for later usage.

### Practices
#### Gitflow

Please obey by established Gitflow principles. Details can be obtained in [post by Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/) or in [Atlassian's Gitflow Workflow tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). Driessen's [git-flow](https://github.com/nvie/gitflow) git extension is indispensable.
