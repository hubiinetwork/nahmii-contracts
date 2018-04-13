/*!
 * Hubii - Omphalos
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
const Migrations = artifacts.require("./Migrations.sol");

// -----------------------------------------------------------------------------------------------------------------

module.exports = function(deployer) {
    deployer.deploy(Migrations);
};
