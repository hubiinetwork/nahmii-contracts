/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */
var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
