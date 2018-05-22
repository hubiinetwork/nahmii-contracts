/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

/**
@title Reserve fund
@notice Fund into which users may make deposits and earn share of revenue relative to their contribution.
 There will likely be 2 instances of this smart contract, one for trade reserves and one for payment reserves.

*/

import './SafeMathInt.sol';
import './SafeMathUInt.sol';
import "./Ownable.sol";
import './ERC20.sol';

contract ReserveFund is Ownable {

    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositHistory {
         address tokenAddress;
         uint listIndex;
     }

    struct DepositInfo {
         int256 amount;
         uint256 timestamp;
        int256 balance;
        uint256 block;
     }

    struct PerWalletInfo {

        DepositInfo[] depositsEther;
        mapping (address => DepositInfo[]) depositsToken;

        // Active balance of ethers and tokens.
        int256 activeEtherBalance;
        mapping (address => int256) activeTokenBalance;

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping (address => int256) stagedTokenBalance;

        DepositHistory[] depositsHistory;

        // Calculated ether balances after each transfer to/from wallet
        int256[] etherBalances;

        // Calculated ether balance blocks at each transfer to/from wallet
        int256[] etherBalanceBlocks;

        // Block numbers at which address a has had its ether balance updated
        uint256[] etherBalanceBlockNumbers;
        uint256 lastEtherBalanceBlockNumber;

        // Calculated token balance after each transfer to/from wallet
        mapping(address => int256[]) tokenBalances;

        // Calculated token balance blocks at each transfer to/from wallet
        mapping(address => int256[]) tokenBalanceBlocks;

        // Block numbers at which address a has had its ether balance updated
        mapping(address => uint256[]) tokenBalanceBlockNumbers;
        mapping(address => uint256) lastTokenBalanceBlockNumber;

        // Accrual block tracking
        mapping(address => uint256[]) tokenAccrualBlockNumbers;
        uint256[] etherAccrualBlockNumbers;

        mapping(address => uint256[]) tokenClaimAccrualBlockNumbers;
        uint256[] etherClaimAccrualBlockNumbers;
    }

    struct TransferInfo {
        address tokenAddress; // 0 for ethers.
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    int256 aggregatedEtherBalance;
    mapping (address => int256) aggregatedTokenBalance;

    int256 aggregateAccrualEtherBalance;
    int256 periodAccrualEtherBalance;
    mapping (address => int256) aggregateAccrualTokenBalance;
    mapping (address => int256) periodAccrualTokenBalance;

    address[] accrualPeriodTokenList;
    mapping (address => int) isAccruedTokenMap;
    mapping (address => PerWalletInfo) private walletInfoMap;

    uint256[] accrualBlockNumbers;

    mapping (address => bool) registeredServices;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address wallet, int256 amount, address tokenAddress);
    event StageEvent(address wallet, int256 amount, address tokenAddress);
    event WithdrawEvent(address wallet, int256 amount, address tokenAddress);
    event TwoWayTransferEvent(address wallet, TransferInfo inboundTx, TransferInfo outboundTx);
    event ClaimAccrualEvent(address tokenAddress);
    event CloseAccrualPeriodEvent();
    event RegisterServiceEvent(address serviceAddress);
    event DeregisterServiceEvent(address serviceAddress);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public payable {
        require(msg.value > 0);
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        if (msg.sender == owner) {
            periodAccrualEtherBalance = periodAccrualEtherBalance.add_nn(amount);
            aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.add_nn(amount);
        }
        else {
            uint256 blockSpan = block.number.sub(walletInfoMap[msg.sender].lastEtherBalanceBlockNumber);
            int256 balanceBlock = walletInfoMap[msg.sender].activeEtherBalance.mul_nn(SafeMathInt.toInt256(blockSpan));

            walletInfoMap[msg.sender].etherBalanceBlocks.push(balanceBlock);
            walletInfoMap[msg.sender].etherBalanceBlockNumbers.push(block.number);
            walletInfoMap[msg.sender].lastEtherBalanceBlockNumber = block.number;

            walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.add_nn(amount);
            walletInfoMap[msg.sender].etherBalances.push(walletInfoMap[msg.sender].activeEtherBalance);
            aggregatedEtherBalance = aggregatedEtherBalance.add_nn(amount);
        }

        //add to per-wallet active balance
        walletInfoMap[msg.sender].depositsEther.push(DepositInfo(amount, now, walletInfoMap[msg.sender].activeEtherBalance, block.number));
        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));

        //emit event
        emit DepositEvent(msg.sender, amount, address(0));
    }

    function depositTokens(address tokenAddress, int256 amount) public {
        require(tokenAddress != address(0));
        require(amount > 0);
        ERC20 token = ERC20(tokenAddress);

        if (msg.sender == owner) {
            periodAccrualTokenBalance[tokenAddress] = periodAccrualTokenBalance[tokenAddress].add_nn(amount);
            aggregateAccrualTokenBalance[tokenAddress] = aggregateAccrualTokenBalance[tokenAddress].add_nn(amount);

            if (isAccruedTokenMap[tokenAddress] == 0)
            {
                accrualPeriodTokenList.push(tokenAddress);
                isAccruedTokenMap[tokenAddress] = 1;
            }
        }
        else {
            uint256 blockSpan = block.number.sub(walletInfoMap[msg.sender].lastTokenBalanceBlockNumber[tokenAddress]);
            int256 balanceBlock = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].mul(SafeMathInt.toInt256(blockSpan));

            walletInfoMap[msg.sender].tokenBalanceBlocks[tokenAddress].push(balanceBlock);
            walletInfoMap[msg.sender].tokenBalanceBlockNumbers[tokenAddress].push(block.number);
            walletInfoMap[msg.sender].lastTokenBalanceBlockNumber[tokenAddress] = block.number;

            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].add_nn(amount);
            walletInfoMap[msg.sender].tokenBalances[tokenAddress].push(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]);
            aggregatedTokenBalance[tokenAddress] = aggregatedTokenBalance[tokenAddress].add_nn(amount);
        }

        // Amount must be >0 so there's no problem with conversion to unsigned.
        require(token.transferFrom(msg.sender, this, uint256 (amount)));
        walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(amount, now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], block.number));
        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));

        //emit event
        emit DepositEvent(msg.sender, amount, tokenAddress);
    }

    function deposit(address wallet, uint index) public view returns (int256 amount, address token, uint256 blockNumber) {
         require(wallet != address(0));
         require(index < walletInfoMap[wallet].depositsHistory.length);

        DepositHistory storage dh = walletInfoMap[wallet].depositsHistory[index];
        //NOTE: Code duplication in order to keep compiler happy and avoid warnings
        if (dh.tokenAddress == address(0)) {
            DepositInfo[] storage di = walletInfoMap[wallet].depositsEther;
            amount = di[dh.listIndex].amount;
            token = address(0);
            blockNumber = di[dh.listIndex].block;
        } else {
            DepositInfo[] storage diT = walletInfoMap[wallet].depositsToken[dh.tokenAddress];
            amount = diT[dh.listIndex].amount;
            token = dh.tokenAddress;
            blockNumber = diT[dh.listIndex].block;
        }
     }

    function depositCount(address wallet) public view returns (uint256) {
        return walletInfoMap[wallet].depositsHistory.length;
    }

    function periodAccrualBalance(address tokenAddress) public view returns (int256) {
        return tokenAddress == address(0) ? periodAccrualEtherBalance : periodAccrualTokenBalance[tokenAddress];
    }

    function aggregateAccrualBalance(address tokenAddress) public view returns (int256) {
        return tokenAddress == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[tokenAddress];
    }

    function closeAccrualPeriod() public onlyOwnerOrService {

        // Register this block
        accrualBlockNumbers.push(block.number);
        
        // Clear accruals
        periodAccrualEtherBalance = 0;
        for (uint256 i = 0; i < accrualPeriodTokenList.length; i++) {
            periodAccrualTokenBalance[accrualPeriodTokenList[i]] = 0;
        }

        emit CloseAccrualPeriodEvent();
    }

    function claimAccrual(address tokenAddress, bool compoundAccrual) public {
        uint256 bn_low;
        uint256 bn_up;
        uint256 lenClaimAccrualBlocks;
        require(tokenAddress == address(0) ? (aggregatedEtherBalance > 0) : (aggregatedTokenBalance[tokenAddress] > 0));

        /* lower bound = last accrual block number claimed for currency c by msg.sender OR 0 */

        /* upper bound = last accrual block number */

        require (accrualBlockNumbers.length > 0);
        bn_up = accrualBlockNumbers[accrualBlockNumbers.length - 1];

        if (tokenAddress == address(0)) {
            lenClaimAccrualBlocks = walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.length;
            if (walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.length == 0) {

                /* no block numbers for claimed accruals yet  */
                bn_low = 0;
            }
            else {
                bn_low = walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers[lenClaimAccrualBlocks - 1];
            }
        }
        else {
            lenClaimAccrualBlocks = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[tokenAddress].length;
            if (walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[tokenAddress].length == 0) {

                /* no block numbers for claimed accruals yet */
                bn_low = 0;
            }
            else {
                bn_low = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[tokenAddress][lenClaimAccrualBlocks - 1];
            }
        }

        int256 bb = internalBalanceBlocksIn(msg.sender, tokenAddress, bn_low, bn_up);

        require (bn_low != bn_up); // avoid division by 0

        int256 blockspan = SafeMathInt.toInt256(bn_up.sub(bn_low));
        int256 balance =  tokenAddress == address(0) ? aggregatedEtherBalance : aggregatedTokenBalance[tokenAddress];
        int256 fraction = bb.mul_nn(1e18).mul_nn(tokenAddress == 0 ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[tokenAddress]).div_nn(balance.mul_nn(blockspan).mul_nn(1e18));
        int256 amount =   fraction.mul_nn(tokenAddress == 0 ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[tokenAddress]).div_nn(1e18);
        
        /* Move calculated amount a of currency c from aggregate active balance of currency c to msg.sender’s staged balance of currency c */

        if (tokenAddress == address(0)) {
            aggregatedEtherBalance = aggregatedEtherBalance.sub_nn(amount);

            if (compoundAccrual) {
                walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.add_nn(amount);
            }
            else {
                walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount);
            }
        } else {
            aggregatedTokenBalance[tokenAddress] = aggregatedTokenBalance[tokenAddress].sub_nn(amount);
            
            if (compoundAccrual) {
                walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].add_nn(amount);
            }
            else {
                walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress].add_nn(amount);		
            }
        
        }

        /* Store upperbound as the last claimed accrual block number for currency */

        if (tokenAddress == address(0)) {
            walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.push(bn_up);
        }
        else {
            walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[tokenAddress].push(bn_up);
        }

        emit ClaimAccrualEvent(tokenAddress);
    }

    function stage(address tokenAddress, int256 amount) public {
        require(msg.sender != owner);

        if (tokenAddress == address(0)) {
            if (amount > walletInfoMap[msg.sender].activeEtherBalance)
                amount = walletInfoMap[msg.sender].activeEtherBalance;
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.sub_nn(amount);
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(amount, now, walletInfoMap[msg.sender].activeEtherBalance, block.number));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));
            walletInfoMap[msg.sender].etherBalances.push(walletInfoMap[msg.sender].activeEtherBalance);
        } else {
            if (amount > walletInfoMap[msg.sender].activeTokenBalance[tokenAddress])
                amount = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress];
            require(amount > 0);

            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].sub_nn(amount);
            walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress].add_nn(amount);

            walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], block.number));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));
            walletInfoMap[msg.sender].tokenBalances[tokenAddress].push(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]);
        }

        //emit event
        emit StageEvent(msg.sender, amount, tokenAddress);
    }

    function activeBalance(address wallet, address tokenAddress) public view returns (int256) {
        //if no wallet provided, get the current aggregated balance
        if (wallet == address(0)) {
            if (tokenAddress == address(0))
                return aggregatedEtherBalance;

            return aggregatedTokenBalance[tokenAddress];
        }
        else {
            if (tokenAddress == address(0))
                return walletInfoMap[wallet].activeEtherBalance;

            return walletInfoMap[wallet].activeTokenBalance[tokenAddress];
        }
    }

    function stagedBalance(address wallet, address tokenAddress) public view returns (int256) {
        if (tokenAddress == address(0))
            return walletInfoMap[wallet].stagedEtherBalance;
        return walletInfoMap[wallet].stagedTokenBalance[tokenAddress];
    }

    function withdrawEther(int256 amount) public {
        require(msg.sender != owner);
        if (amount > walletInfoMap[msg.sender].stagedEtherBalance) {
            amount = walletInfoMap[msg.sender].stagedEtherBalance;
        }
        require(amount > 0);

        msg.sender.transfer(uint256(amount));
        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);

        //raise event
        emit WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(address tokenAddress, int256 amount) public {
        require(msg.sender != owner);
        require(tokenAddress != address(0));
        if (amount > walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress]) {
            amount = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress];
        }
        require(amount > 0);

        ERC20 token = ERC20(tokenAddress);
        token.transfer(msg.sender, uint256(amount));
        walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress].sub_nn(amount);

        //raise event
        emit WithdrawEvent(msg.sender, amount, tokenAddress);
    }

    function outboundTransferSupported(TransferInfo outboundTx) public view onlyOwner returns (bool) {
        return (outboundTx.tokenAddress == 0 ?
            outboundTx.amount <= aggregatedEtherBalance :
            outboundTx.amount <= aggregatedTokenBalance[outboundTx.tokenAddress]);
    }

    function twoWayTransfer(address wallet, TransferInfo inboundTx, TransferInfo outboundTx) public onlyOwner {
        //require (msg.sender == exchangeSmartContract);
        require (inboundTx.amount > 0);
        require (outboundTx.amount > 0);
        require (wallet != address(0));

        // Perform outbound (SC to W) transfers

        if (outboundTx.tokenAddress == address(0)) {
            require (outboundTx.amount <= aggregatedEtherBalance);
            walletInfoMap[wallet].stagedEtherBalance = walletInfoMap[wallet].stagedEtherBalance.add_nn(outboundTx.amount);
            aggregatedEtherBalance = aggregatedEtherBalance.sub_nn(outboundTx.amount);

        } else {
            require (outboundTx.amount <= aggregatedTokenBalance[outboundTx.tokenAddress]);
            walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress] = walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress].add_nn(outboundTx.amount);
            aggregatedTokenBalance[outboundTx.tokenAddress] = aggregatedTokenBalance[outboundTx.tokenAddress].sub_nn(outboundTx.amount);
        }

        // Perform inbound (w to SC) transfers

        if (inboundTx.tokenAddress == address(0)) {
            require(walletInfoMap[wallet].stagedEtherBalance >= inboundTx.amount);
            walletInfoMap[wallet].stagedEtherBalance = walletInfoMap[wallet].stagedEtherBalance.sub_nn(inboundTx.amount);
            aggregatedEtherBalance = aggregatedEtherBalance.add_nn(inboundTx.amount);

        } else {
            require(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] >= inboundTx.amount);
            walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] = walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress].sub_nn(inboundTx.amount);
            aggregatedTokenBalance[inboundTx.tokenAddress] = aggregatedTokenBalance[inboundTx.tokenAddress].add_nn(inboundTx.amount);
        }

        //raise event
        //
        emit TwoWayTransferEvent(wallet, inboundTx, outboundTx);
    }

    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    function registerService(address serviceAddress) public onlyOwner {
        require(registeredServices[serviceAddress] == false);
        registeredServices[serviceAddress] = true;

        emit RegisterServiceEvent(serviceAddress);
    }

    function deregisterService(address serviceAddress) public onlyOwner {
        require(registeredServices[serviceAddress] == true);
        registeredServices[serviceAddress] = false;

        emit DeregisterServiceEvent(serviceAddress);
    }

    //
    // Debugging helper functions
    // -----------------------------------------------------------------------------------------------------------------
    function debugBalanceBlocksIn(address wallet, address tokenAddress, uint256 startBlock, uint256 endBlock) external view onlyOwner returns (int256) {
        return internalBalanceBlocksIn(wallet, tokenAddress, startBlock, endBlock);
    }

    //
    // Internal helper functions
    // -----------------------------------------------------------------------------------------------------------------

    function internalBalanceBlocksIn(address wallet, address tokenAddress, uint256 startBlock, uint256 endBlock) internal view returns (int256) {
        require (startBlock < endBlock);
        require (wallet != address(0));

        int256[] storage balances = tokenAddress == 0 ? walletInfoMap[wallet].etherBalances : walletInfoMap[wallet].tokenBalances[tokenAddress];
        int256[] storage balanceBlocks = tokenAddress == 0 ? walletInfoMap[wallet].etherBalanceBlocks : walletInfoMap[wallet].tokenBalanceBlocks[tokenAddress];
        uint256[] storage balanceBlockNumbers = tokenAddress == 0 ? walletInfoMap[wallet].etherBalanceBlockNumbers : walletInfoMap[wallet].tokenBalanceBlockNumbers[tokenAddress];

        if (balanceBlockNumbers.length == 0 || endBlock.sub(startBlock) == 0) {
            return 0;
        }

        uint i = 0;
        while (i < balanceBlockNumbers.length && balanceBlockNumbers[i] <= startBlock) {
            i++;
        }

        uint low = 0 == i ? startBlock : balanceBlockNumbers[i - 1];
        int256 res = balanceBlocks[i].mul_nn(SafeMathInt.toInt256(balanceBlockNumbers[i].sub(startBlock))).div_nn(SafeMathInt.toInt256(balanceBlockNumbers[i].sub(low)));
        i++;

        while (i < balanceBlockNumbers.length && balanceBlockNumbers[i] <= endBlock) {
            res = res.add_nn(balanceBlocks[i++]);
        }

        if (i >= balanceBlockNumbers.length) {
            res = res.add_nn(balances[i - 1].mul_nn(SafeMathInt.toInt256(endBlock.sub(balanceBlockNumbers[i - 1]))));
        } else if (balanceBlockNumbers[i - 1] < endBlock) {
            res = res.add_nn(balanceBlocks[i].mul_nn(SafeMathInt.toInt256(endBlock.sub(balanceBlockNumbers[i - 1]))).div_nn(SafeMathInt.toInt256(balanceBlockNumbers[i].sub(balanceBlockNumbers[i - 1]))));
        }

        return res;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwnerOrService {
        require(msg.sender == owner || registeredServices[msg.sender] == true);
        _;
    }
}