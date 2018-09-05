pragma solidity ^0.4.24;

/**
 * Originally from https://github.com/OpenZeppelin/zeppelin-solidity
 * Modified by https://www.coinfabrik.com/
 *
 * This version is being used for Truffle Unit Testing. Please do not remove.
 */

import {ERC20} from "../ERC20.sol";
import {SafeMathUint} from "../SafeMathUint.sol";

/**
 * @title Standard token
 * @notice Basic implementation of the EIP20 standard token (also known as ERC20 token).
 */
contract StandardTokenEx is ERC20 {
    using SafeMathUint for uint;

    uint private total_supply;
    mapping(address => uint) private balances;
    mapping(address => mapping(address => uint)) private allowed;

    /**
     * @dev transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint value) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[to] = balances[to].add(value);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param account The address whose balance is to be queried.
     * @return An uint representing the amount owned by the passed address.
     */
    function balanceOf(address account) public view returns (uint balance) {
        return balances[account];
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint the amout of tokens to be transfered
     */
    function transferFrom(address from, address to, uint value) public returns (bool success) {
        uint allowance = allowed[from][msg.sender];
        require(value >= allowance, "value is < allowance");

        // Check is not needed because sub(allowance, value) will already throw if this condition is not met
        // require(value <= allowance);
        // SafeMath uses assert instead of require though, beware when using an analysis tool

        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        allowed[from][msg.sender] = allowance.sub(value);
        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint value) public returns (bool success) {
        // To change the approve amount you first have to reduce the addresses'
        //  allowance to zero by calling `approve(spender, 0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(value == 0 || allowed[msg.sender][spender] == 0, "previous approve without transferFrom");

        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens than an owner allowed to a spender.
     * @param account address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint specifing the amount of tokens still avaible for the spender.
     */
    function allowance(address account, address spender) public view returns (uint remaining) {
        return allowed[account][spender];
    }

    /**
     * Atomic increment of approved spending
     *
     * Works around https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function addApproval(address spender, uint addedValue) public returns (bool success) {
        uint oldValue = allowed[msg.sender][spender];
        allowed[msg.sender][spender] = oldValue.add(addedValue);
        emit Approval(msg.sender, spender, allowed[msg.sender][spender]);
        return true;
    }

    /**
     * Atomic decrement of approved spending.
     *
     * Works around https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function subApproval(address spender, uint subtractedValue) public returns (bool success) {
        uint oldVal = allowed[msg.sender][spender];
        if (subtractedValue > oldVal) {
            allowed[msg.sender][spender] = 0;
        } else {
            allowed[msg.sender][spender] = oldVal.sub(subtractedValue);
        }
        emit Approval(msg.sender, spender, allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Provides an internal function for destroying tokens. Useful for upgrades.
     */
    function burnTokens(address account, uint value) internal {
        balances[account] = balances[account].sub(value);
        total_supply = total_supply.sub(value);
        emit Transfer(account, 0, value);
    }

    /**
     * @dev Provides an internal minting function.
     */
    function mintInternal(address receiver, uint amount) internal {
        total_supply = total_supply.add(amount);
        balances[receiver] = balances[receiver].add(amount);

        // Beware: Address zero may be used for special transactions in a future fork.
        // This will make the mint transaction appear in EtherScan.io
        // We can remove this after there is a standardized minting event
        emit Transfer(0, receiver, amount);
    }

    /* Testing purposes only */
    function testMint(address receiver, uint amount) public {
        mintInternal(receiver, amount);
    }
}