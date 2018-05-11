pragma solidity ^0.4.23;

/**
 * Originally from https://github.com/OpenZeppelin/zeppelin-solidity
 * Modified by https://www.coinfabrik.com/
 *
 * This version is being used for Truffle Unit Testing. Please do not remove.
 */

import './ERC20.sol';
import './SafeMathUint.sol';

/**
 * @title Standard token
 * @dev Basic implementation of the EIP20 standard token (also known as ERC20 token).
 */
contract RevenueToken is ERC20 {
    using SafeMathUint for uint;

    uint private total_supply;
    address owner;
    address[] public holders;
    mapping(address => uint) balances;
    mapping(address => mapping(uint => uint)) balanceBlocks;
    mapping(address => uint[]) balanceBlockNumbers;
    mapping(address => mapping(address => uint)) private allowed;

    constructor() public {
        owner = msg.sender;
        balanceBlocks[msg.sender][block.number] = 0;
        balanceBlockNumbers[msg.sender].push(block.number);
        balances[msg.sender] = total_supply;
    }

    /**
     * @dev transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint value) public returns (bool success) {
        balanceBlocks[msg.sender][block.number] = balances[msg.sender].mul(block.number.sub(balanceBlockNumbers[msg.sender].length > 0 ? balanceBlockNumbers[msg.sender][balanceBlockNumbers[msg.sender].length - 1] : 0));
        balanceBlockNumbers[msg.sender].push(block.number);
        balances[msg.sender] = balances[msg.sender].sub(value);
        balanceBlocks[to][block.number] = balances[to].mul(block.number.sub(balanceBlockNumbers[to].length > 0 ? balanceBlockNumbers[to][balanceBlockNumbers[to].length - 1] : 0));
        balanceBlockNumbers[to].push(block.number);
        balances[to] = balances[to].sub(value);
        holders.push(to);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    //IMPORTANT: access should be pubblic or only owner+token_holder_revenue_funds?
    function balanceBlocksIn(address a, uint from, uint to) public constant returns (uint) {
        // Def:
        //  * balance block = balance * block span
        // 
        // Variables with example contents:
        //  * Function arguments
        //    - Start block number: from = 5312000
        //    - End block number: to = 5323000
        //
        //  * Historical evolution of balance of address a
        //    - Balance: b[] = [1000000000000000, 2000000000000000, 3000000000000000, 4000000000000000]
        //
        //  * Block numbers at which address a has had its balance updated
        //    - Balance block numbers: bbn[] = [5310000, 5316000, 5318000, 5324000]
        //
        //  * Calculated balance blocks at each transfer to/from address a
        //    - Balance blocks: bb{} = {5310000: 0, 5316000: 6000000000000000000, 5318000: 4000000000000000000, 5324000: 18000000000000000000}
        //
        // ---
        // 
        // if ( bbn.length == 0 || 0 == to - from )
        //     return 0
        //
        // i = 0
        // while ( i < bbn.length
        //   && bbn[ i ] <= from )
        //     i++
        //
        // low = i == 0 ? from : bbn[ i - 1 ]
        //
        // res = bb[ i ]
        //   * ( bbn[ i ] - from )
        //   / ( bbn[ i ] - low )
        // i++
        //
        // while ( i < bbn.length
        //   && bbn[ i ] <= to )
        //     res += bb[ i ]
        //     i++
        //
        // if ( i >= bbn.length )
        //     res += b[b.length - 1] * ( to - bbn[ i - 1 ] )
        // else if ( bbn[ i - 1 ] < to )
        //     res += bb[ i ]
        //       * ( to - bbn[ i - 1 ] )
        //       / ( bbn[ i ] - bbn[ i - 1 ] )
        //
        // return res

        if (0 == balanceBlockNumbers[a].length || 0 == to.sub(from)) {
            return 0;
        }

        uint i = 0;
        while (i < balanceBlockNumbers[a].length
        && balanceBlockNumbers[a][i] <= from) {
            i++;
        }

        uint low = 0 == i ? from : balanceBlockNumbers[a][i - 1];

        uint res = balanceBlocks[a][i].mul(balanceBlockNumbers[a][i].sub(from)).div(balanceBlockNumbers[a][i].sub(low));
        i++;

        while (i < balanceBlockNumbers[a].length
        && balanceBlockNumbers[a][i] <= to) {
            res = res.add(balanceBlocks[a][i++]);
        }

        if (i >= balanceBlockNumbers[a].length) {
            res = res.add(balances[a].mul(to.sub(balanceBlockNumbers[a][i - 1])));
        } else if (balanceBlockNumbers[a][i - 1] < to) {
            res = res.add(balanceBlocks[a][i].mul(to.sub(balanceBlockNumbers[a][i - 1])).div(balanceBlockNumbers[a][i].sub(balanceBlockNumbers[a][i - 1])));
        }

        return res;
    }

    /*
    MAURO-EDIT: I would replace activeHoldersAsBytes with a function that returns a fixed-size array
                of a struct with holder address and a boolean if balance != 0. The function also
                needs a starting index to begin scan.

                Although more calls required and we should check if blocknumber changed between two
                calls, the goal is to avoid an out of memory (must check VM limitations) if active
                holders with a non-zero balance becomes too large.
    */
    // ------------------------------------------------------------------------
    // https://medium.com/@tmyjoe/dapps-how-to-get-elements-of-array-in-a-contract-c61b16b6c438
    // ------------------------------------------------------------------------
    function activeHoldersAsBytes() public constant returns (bytes activeHoldersBytes) {
        uint counter = 0;
        uint i;
        uint k;

        for (i = 0; i < holders.length; i++) {
            if (balances[holders[i]] > 0) {
                counter++;
            }
        }

        activeHoldersBytes = new bytes(20 * counter);
        counter = 0;
        for (i = 0; i < holders.length; i++) {
            if (balances[holders[i]] > 0) {
                bytes memory elem = toBytes(holders[i]);
                for (k = 0; k < 20; k++) {
                    activeHoldersBytes[counter++] = elem[k];
                }
            }
        }
    }

    function toBytes(address a) private pure returns (bytes b){
        assembly {
            let m := mload(0x40)
            mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
            mstore(0x40, add(m, 52))
            b := m
        }
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
        require(value == 0 || allowed[msg.sender][spender] == 0);

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
     *
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