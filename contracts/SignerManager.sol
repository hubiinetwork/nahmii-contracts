/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

/**
@title SignerManager
@notice A contract to control who can execute some specific actions
*/
contract SignerManager is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => bool) public signersMap;
    address[] public signers;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterSignerEvent(address signer);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
        registerSigner(deployer);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Registers a signer
    /// @param newSigner The address of the signer to register
    function registerSigner(address newSigner) public onlyDeployer notNullOrThisAddress(newSigner) {
        if (!signersMap[newSigner]) {
            // Set new operator
            signersMap[newSigner] = true;
            signers.push(newSigner);

            // Emit event
            emit RegisterSignerEvent(newSigner);
        }
    }

    /// @notice Gauge whether an address is registered signer
    /// @param _address The concerned address
    /// @return true if address is registered signer, else false
    function isSigner(address _address) public view returns (bool) {
        return signersMap[_address];
    }

    /// @notice Get the count of registered signers
    /// @return The count of registered signers
    function signersCount() public view returns (uint256) {
        return signers.length;
    }

    /// @notice Get a subset of registered signers in the given index range
    /// @param low The lower inclusive index
    /// @param up The upper inclusive index
    /// @return The subset of registered signers
    function signersByIndices(uint256 low, uint256 up) public view returns (address[]) {
        require(low <= up);

        low = low < 0 ? 0 : low;
        up = up > signers.length - 1 ? signers.length - 1 : up;
        address[] memory _signers = new address[](up - low + 1);
        for (uint256 i = low; i <= up; i++)
            _signers[i - low] = signers[i];

        return _signers;
    }
}
