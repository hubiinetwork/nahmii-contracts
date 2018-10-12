/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccessorManager} from "./AccessorManager.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title AccessorManageable
@notice A contract to interface ACL
*/
contract AccessorManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    AccessorManager public accessorManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeAccessorManagerEvent(address oldAccessor, address newAccessor);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address manager) public {
        require(manager != address(0));
        accessorManager = AccessorManager(manager);
    }


    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the accessor manager of this contract
    /// @param newAccessor The address of the new accessor
    function changeAccessorManager(address newAccessor)
    public
    onlyDeployer
    notNullOrThisAddress(newAccessor)
    {
        if (newAccessor != address(accessorManager)) {
            //set new accessor
            address oldAccessor = address(accessorManager);
            accessorManager = AccessorManager(newAccessor);

            // Emit event
            emit ChangeAccessorManagerEvent(oldAccessor, newAccessor);
        }
    }

    /// @notice Prefix input hash and do ecrecover on prefixed hash
    /// @param hash The hash message that was signed
    /// @param v The v property of the ECDSA signature
    /// @param r The r property of the ECDSA signature
    /// @param s The s property of the ECDSA signature
    /// @return The address recovered
    function ethrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s)
    public
    pure
    returns (address)
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return ecrecover(prefixedHash, v, r, s);
    }

    /// @notice Gauge whether a signature of a hash has been signed by a registered signer
    /// @param hash The hash message that was signed
    /// @param v The v property of the ECDSA signature
    /// @param r The r property of the ECDSA signature
    /// @param s The s property of the ECDSA signature
    /// @return true if the recovered signer is one of the registered signers, else false
    function isSignedByRegisteredSigner(bytes32 hash, uint8 v, bytes32 r, bytes32 s)
    public
    view
    returns (bool)
    {
        require(accessorManager != address(0));
        return accessorManager.isSigner(ethrecover(hash, v, r, s));
    }

    /// @notice Gauge whether a signature of a hash has been signed by the claimed signer
    /// @param hash The hash message that was signed
    /// @param v The v property of the ECDSA signature
    /// @param r The r property of the ECDSA signature
    /// @param s The s property of the ECDSA signature
    /// @param signer The claimed signer
    /// @return true if the recovered signer equals the input signer, else false
    function isSignedBy(bytes32 hash, uint8 v, bytes32 r, bytes32 s, address signer)
    public
    pure
    returns (bool)
    {
        return signer == ethrecover(hash, v, r, s);
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier accessorManagerInitialized() {
        require(accessorManager != address(0));
        _;
    }
}
