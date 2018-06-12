/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Types} from "./Types.sol";

interface Hasher {
    function hashOrderAsWallet(Types.Order order) external pure returns (bytes32);

    function hashPaymentAsWallet(Types.Payment payment) external pure returns (bytes32);
}

contract Hashable is Ownable, Modifiable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Hasher public hasher;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeHasherEvent(Hasher oldHasher, Hasher newHasher);

    /// @notice Change the hasher contract
    /// @param newHasher The (address of) Hasher contract instance
    function changeHasher(Hasher newHasher)
    public
    onlyOwner
    notNullAddress(newHasher)
    notEqualAddresses(newHasher, hasher)
    {
        Hasher oldHasher = hasher;
        hasher = newHasher;
        emit ChangeHasherEvent(oldHasher, hasher);
    }
}
