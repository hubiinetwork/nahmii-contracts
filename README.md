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
      "SafeMathInt": "0x5525f7f7f1054412db89ed6df17e87628138bd78",
      "SafeMathUint": "0x8300918385254f7dc3f38d34fe3805d751d5edc0",
      "Types": "0xe392a30585dae6bf30b917a2a853ea4dde4ded2f",
      "ClientFund": "0x579b69e2c468a9526e5221251b7a2a25bfec0770",
      "CommunityVote": "0x94cca8c3ab335caa0256e7e300e8f6bdb454bbdb",
      "Configuration": "0x82554af29292863f89891448902795359cfa5d30",
      "Exchange": "0x8ceb6c0003058c6ee0a04902d94c68bfe43c49a4",
      "CancelOrdersChallenge": "0x2722b7559f6630c49eb25fd469bb3349ef45c10d",
      "DriipSettlementChallenge": "0xe358229cad715a2e24fd4cb6bfb04156d4456df9",
      "DriipSettlementChallenger": "0xc3703ee27ad5ae29ea9f4c43849b1f75a63da511",
      "Hasher": "0x848bc08382e460e68622528cb4e27a56226b10a5",
      "Validator": "0xc612b1288483496e3b426118b12cbc242de09a27",
      "FraudChallengeByOrder": "0x9e25b3df7fff57a8d9c81749b25f976b6277c07e",
      "FraudChallengeByTrade": "0x7e1a30522506dc946bcbc36d7cb17fbc08af44e6",
      "FraudChallengeByPayment": "0xaadf806edcbda69d745a0fbaa03c80ea26ab0198",
      "FraudChallengeBySuccessiveTrades": "0x0b6a5f0be3857b6026b4f32179dd40ffae14bfd5",
      "FraudChallengeBySuccessivePayments": "0x8f39617924f67fb4e7f02499c9b84b703d5b2701",
      "FraudChallengeByPaymentSucceedingTrade": "0x0c13ddf93f59799860e140ba34ac2a3fd6a1fe10",
      "FraudChallengeByTradeSucceedingPayment": "0x57796cc45593859cbe9bc668d085f26c0199b9ad",
      "FraudChallengeByTradeOrderResiduals": "0x6473a8a967060469db26e1b5156ffd9273d63635",
      "FraudChallengeByDoubleSpentOrders": "0x299b1f864e19600dd4ea66c62db968f6dd1473cc",
      "FraudChallengeByDuplicateDriipNonceOfTrades": "0x6063916a1f2a27c6b8578ef0207d3c91adec9514",
      "FraudChallengeByDuplicateDriipNonceOfPayments": "0xa3ed6e905c03eb7b2e0ebfcce7781be799d24fbf",
      "FraudChallengeByDuplicateDriipNonceOfTradeAndPayment": "0x44ad0e73e88db3a66631a87849d29ed77f82a433",
      "FraudChallenge": "0xf3e96de4c3ff22230ff113ddd41f7840896b341e",
      "ReserveFund1": "0x93ae06b5b10b8a778651e67a853fea4635ed6d0d",
      "ReserveFund2": "0xf12834163448d64f75f157a2e911b9999b333757",
      "RevenueFund1": "0x8c308762918a331cc7479a2d4638108b8dfd7844",
      "RevenueFund2": "0xde70cf1735737c4aa79272e3d10d93523de4e5ad",
      "SecurityBond": "0x7eeb15a4c902365a8157ccdc4d0aa6f725b641e2",
      "TokenHolderRevenueFund": "0x3d53bdcd6fc5bc851c63c47f6f1199eee09dc8ba"
    }
  },
  "updatedAt": "2018-06-22T13:09:53.484Z"
}
```

## Tests

Developers should be using `truffle develop` followed by `truffle test` to run the included tests of the contracts. (`npm test` is currently unavailable.)

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
