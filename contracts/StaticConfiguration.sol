/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title StaticConfiguration
@notice An oracle for static configuration values
*/
contract StaticConfiguration {

    struct Item {
        bytes32 value;
        uint index;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;
    mapping(string => Item) private items;
    string[] public names;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event SetEvent(string name, bytes32 value);
    event UnsetEvent(string name);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function StaticConfiguration(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        if (newOwner != owner) {
            // Set new owner
            address oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    function has(string name) public view returns (bool) {
        return 0 != items[name].index;
    }

    function set(string name, bytes32 value) public onlyOwner {
        // Set item
        uint index = 0;
        Item storage item = items[name];
        if (has(name)) {
            index = item.index;
        } else {
            names.push(name);
            index = names.length;
        }
        items[name] = Item({value : value, index : index});

        // Emit event
        emit SetEvent(name, value);
    }

    function unset(string name) public onlyOwner {
        // Unset
        Item storage item = items[name];
        removeName(item.index);
        item.index = 0;

        // Emit event
        emit UnsetEvent(name);
    }

    function removeName(uint index) internal {
        if (index > names.length) {
            return;
        }
        for (uint i = index - 1; i < names.length - 1; i++) {
            names[i] = names[i + 1];
        }
        delete names[names.length - 1];
        names.length--;
    }

    function get(string name) public view returns (bytes32) {
        Item storage item = items[name];
        require(0 != item.index);
        return item.value;
    }

    function getAsString(string name) public view returns (string) {
        bytes32 value = get(name);
        bytes memory valueBytes = new bytes(32);
        for (uint256 i; i < 32; i++) {
            valueBytes[i] = value[i];
        }
        return string(valueBytes);
    }

    function getAsUint(string name) public view returns (uint) {
        return uint(get(name));
    }

    function getAsBool(string name) public view returns (bool) {
        return bool(get(name) != bytes32(0));
    }

    function getCount() public view returns (uint) {
        return names.length;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}