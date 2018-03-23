/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Compliant to Omphalos 0.11 Specification.
 *
 * Copyright (C) 2017-2018 Hubii
 */
/* solium-disable */
pragma solidity ^0.4.19;

import "./ERC20.sol";
import "./SafeMath.sol";

pragma experimental ABIEncoderV2;

contract DexReserveFunds {
    //
    // Enumerations
    // -----------------------------------------------------------------------------------------------------------------
    enum ACCRUAL_TARGET { StagedBalance, ActiveBalance }

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositInfo {
        int256 amount;
        uint256 timestamp;
        uint256 balance;
    }

    struct DepositHistory {
        address tokenAddress;
        uint listIndex;
    }

    struct PerWalletInfo {
        uint256 tradeNonce;

        DepositInfo[] depositsEther;
        mapping (address => DepositInfo[]) depositsToken;

        // Active balance of ethers and tokens.
        uint256 activeEtherBalance;
        mapping (address => uint256) activeTokenBalance;

        // Staged balance of ethers and tokens.
        uint256 stagedEtherBalance;
        mapping (address => uint256) stagedTokenBalance;

        DepositHistory[] depositsHistory;

        ACCRUAL_TARGET accrualTarget;
    }

    struct Accrual {
        uint256 amount;
        address benefactorAddress;
        address    tokenAddress;
        uint256 timestamp;
        uint256 hash;
        uint8[65] signature;
    }

    struct TransferInfo {
        address tokenAddress; // 0 for ethers.
        uint256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;

    mapping (address => PerWalletInfo) private walletInfoMap;

    uint256 aggregatedEtherBalance;
    mapping (address => uint256) aggregatedTokenBalance;

    uint256 revenueEtherBalance;
    mapping (address => uint256) revenueTokenBalance;

    mapping (address => bool) benefactorsMap;

    mapping (uint256 => bool) claimedAccrualsMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, uint256 amount, address token); //token==0 for ethers
    event AddRevenueEvent(uint256 amount, address token); //token==0 for ethers
    event StageEvent(address from, uint256 amount, address token); //token==0 for ethers
    event UnstageEvent(address from, uint256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address to, uint256 amount, address token); //token==0 for ethers
    event AccrualTargetEvent(address wallet, ACCRUAL_TARGET accrualTarget);
    event ClaimAccrualEvent(address wallet, ACCRUAL_TARGET accrualTarget, Accrual accrual);
    event RegisterBenefactorEvent(address benefactorAddress);
    event TwoWayTransferEvent(address wallet, TransferInfo inboundTx, TransferInfo outboundTx);

    //
    // Constructor and owner change
    // -----------------------------------------------------------------------------------------------------------------
    function DexReserveFunds(address _owner) public {
        require(_owner != address(0));

        owner = _owner;

        aggregatedEtherBalance = 0;
        revenueEtherBalance = 0;
    }
    
    function changeOwner(address newOwner) public onlyOwner {
        address oldOwner;

        require(newOwner != address(0));

        if (newOwner != owner) {
            //set new owner
            oldOwner = owner;
            owner = newOwner;

            //emit event
            OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public payable {
        require(msg.sender != owner);
        require(msg.value > 0);

        //add to per-wallet active balance
        walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, msg.value);
        walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(msg.value), block.timestamp, walletInfoMap[msg.sender].activeEtherBalance));

        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));

        //add to aggregated balance
        aggregatedEtherBalance = SafeMath.add(aggregatedEtherBalance, msg.value);

        //emit event
        DepositEvent(msg.sender, msg.value, address(0));
    }

    function depositTokens(address tokenAddress, uint256 amount) public {
        ERC20 token;

        require(msg.sender != owner);
        require(tokenAddress != address(0));
        require(amount > 0);

        //try to execute token transfer
        token = ERC20(tokenAddress);
        require(token.transferFrom(msg.sender, this, amount));

        //add to per-wallet active balance
        walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
        walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), block.timestamp, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));

        //add to aggregated balance
        aggregatedTokenBalance[tokenAddress] = SafeMath.add(aggregatedTokenBalance[tokenAddress], amount);

        //emit event
        DepositEvent(msg.sender, amount, tokenAddress);
    }

    function deposit(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token) {
        require(index < walletInfoMap[wallet].depositsHistory.length);

        DepositHistory storage dh = walletInfoMap[wallet].depositsHistory[index];
        //NOTE: Code duplication in order to keep compiler happy and avoid warnings
        if (dh.tokenAddress == address(0)) {
            DepositInfo[] storage di = walletInfoMap[wallet].depositsEther;

            amount = di[dh.listIndex].amount;
            timestamp = di[dh.listIndex].timestamp;
            token = address(0);
        } else {
            DepositInfo[] storage diT = walletInfoMap[wallet].depositsToken[dh.tokenAddress];
            amount = diT[dh.listIndex].amount;
            timestamp = diT[dh.listIndex].timestamp;
            token = dh.tokenAddress;
        }
    }

    function depositCount(address wallet) public view onlyOwner returns (uint256) {
        return walletInfoMap[wallet].depositsHistory.length;
    }

    //
    // Reneuve functions
    // -----------------------------------------------------------------------------------------------------------------
    function addRevenue(address tokenAddress, uint256 amount) public onlyOwner {
        require(amount > 0);

        if (tokenAddress == address(0)) {
            revenueEtherBalance = SafeMath.add(revenueEtherBalance, amount);
        } else {
            revenueTokenBalance[tokenAddress] = SafeMath.add(revenueTokenBalance[tokenAddress], amount);
        }

        //emit event
        AddRevenueEvent(amount, tokenAddress);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(address tokenAddress, uint256 amount) public {
        require(msg.sender != owner);

        if (tokenAddress == address(0)) {
            if (amount > walletInfoMap[msg.sender].activeEtherBalance)
                amount = walletInfoMap[msg.sender].activeEtherBalance;
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].activeEtherBalance, amount);
            walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.add(walletInfoMap[msg.sender].stagedEtherBalance, amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), block.timestamp, walletInfoMap[msg.sender].activeEtherBalance));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));
        } else {
            if (amount > walletInfoMap[msg.sender].activeTokenBalance[tokenAddress])
                amount = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress];
            require(amount > 0);

            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
            walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);

            walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), block.timestamp, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));
        }

        //emit event
        StageEvent(msg.sender, amount, tokenAddress);
    }

    function unstage(address tokenAddress, uint256 amount) public {
        require(msg.sender != owner);
    
        if (tokenAddress == address(0)) {
            if (amount > walletInfoMap[msg.sender].stagedEtherBalance)
                amount = walletInfoMap[msg.sender].stagedEtherBalance;
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, amount);
            walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), block.timestamp, walletInfoMap[msg.sender].activeEtherBalance));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));
        } else {
            if (amount > walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress])
                amount = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress];
            require(amount > 0);

            walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);
            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);

            walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), block.timestamp, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));
        }

        //emit event
        UnstageEvent(msg.sender, amount, tokenAddress);
    }

    //
    // Balance retrieval
    // -----------------------------------------------------------------------------------------------------------------
    function activeBalance(address wallet, address tokenAddress, uint256 timestamp) public view returns (uint256) {
        //if no wallet provided, get the current aggregated balance
        if (wallet == address(0)) {
            if (tokenAddress == address(0))
                return aggregatedEtherBalance;
            return aggregatedTokenBalance[tokenAddress];
        }

        //if no timestamp, get the current balance
        if (timestamp == 0) {
            if (tokenAddress == address(0))
                return walletInfoMap[wallet].activeEtherBalance;
            return walletInfoMap[wallet].activeTokenBalance[tokenAddress];
        }

        if (tokenAddress == address(0))
            return activeBalanceLookup(timestamp, walletInfoMap[wallet].depositsEther);
        return activeBalanceLookup(timestamp, walletInfoMap[wallet].depositsToken[tokenAddress]);
    }

    function stagedBalance(address wallet, address tokenAddress) public view returns (uint256) {
        if (tokenAddress == address(0))
            return walletInfoMap[wallet].stagedEtherBalance;
        return walletInfoMap[wallet].stagedTokenBalance[tokenAddress];
    }

    function revenueBalance(address tokenAddress) public view onlyOwner returns (uint256) {
        if (tokenAddress == address(0))
             return revenueEtherBalance;
        return revenueTokenBalance[tokenAddress];
    }

    //
    // Withdraw functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEther(uint256 amount) public {
        require(msg.sender != owner);
        if (amount > walletInfoMap[msg.sender].stagedEtherBalance) {
            amount = walletInfoMap[msg.sender].stagedEtherBalance;
        }
        require(amount > 0);

        msg.sender.transfer(amount);
        walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);
    
        //raise event
        WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(address tokenAddress, uint256 amount) public {
        require(msg.sender != owner);
        require(tokenAddress != address(0));
        if (amount > walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress]) {
            amount = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress];
        }
        require(amount > 0);

        ERC20 token = ERC20(tokenAddress);
        token.transfer(msg.sender, amount);
        walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);
    
        //raise event
        WithdrawEvent(msg.sender, amount, tokenAddress);
    }

    //
    // Accrual functions
    // -----------------------------------------------------------------------------------------------------------------
    function accrualTarget(ACCRUAL_TARGET at) public {
        require(msg.sender != owner);

        walletInfoMap[msg.sender].accrualTarget = at;

        //raise event
        AccrualTargetEvent(msg.sender, at);
    }

    function claimAccrual(Accrual accrual) public {
        require(isValidAccrual(accrual));
        require(!claimedAccrualsMap[accrual.hash]);
        require(benefactorsMap[accrual.benefactorAddress]);

        if (walletInfoMap[msg.sender].accrualTarget == ACCRUAL_TARGET.ActiveBalance) {
            if (accrual.tokenAddress == address(0)) {
                revenueEtherBalance = SafeMath.sub(revenueEtherBalance, accrual.amount);
                walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, accrual.amount);
                
                walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(accrual.amount), block.timestamp, walletInfoMap[msg.sender].activeEtherBalance));
                walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));

            } else {
                revenueTokenBalance[accrual.tokenAddress] = SafeMath.sub(revenueTokenBalance[accrual.tokenAddress], accrual.amount);
                walletInfoMap[msg.sender].activeTokenBalance[accrual.tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[accrual.tokenAddress], accrual.amount);                

                walletInfoMap[msg.sender].depositsToken[accrual.tokenAddress].push(DepositInfo(int256(accrual.amount), block.timestamp, walletInfoMap[msg.sender].activeTokenBalance[accrual.tokenAddress]));
                walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(accrual.tokenAddress, walletInfoMap[msg.sender].depositsToken[accrual.tokenAddress].length));
            }
        } else if (walletInfoMap[msg.sender].accrualTarget == ACCRUAL_TARGET.StagedBalance) {
            if (accrual.tokenAddress == address(0)) {
                revenueEtherBalance = SafeMath.sub(revenueEtherBalance, accrual.amount);
                walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.add(walletInfoMap[msg.sender].stagedEtherBalance, accrual.amount);
            } else {
                revenueTokenBalance[accrual.tokenAddress] = SafeMath.sub(revenueTokenBalance[accrual.tokenAddress], accrual.amount);
                walletInfoMap[msg.sender].stagedTokenBalance[accrual.tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].stagedTokenBalance[accrual.tokenAddress], accrual.amount);                
            }
        } else {
            revert();
        }


        claimedAccrualsMap[accrual.hash] = true;

        // raise event
        ClaimAccrualEvent(msg.sender, walletInfoMap[msg.sender].accrualTarget, accrual);
    }

    function registerBenefactor(address benefactorAddress) public onlyOwner {
        require (benefactorAddress != owner);
        require (benefactorAddress != address(0));
        require (benefactorsMap[benefactorAddress] == false);

        benefactorsMap[benefactorAddress] = true;

        //raise event
        RegisterBenefactorEvent(benefactorAddress);
    }

    //
    // Fund Transfer functions
    // -----------------------------------------------------------------------------------------------------------------
    
    function twoWayTransfer(address wallet, TransferInfo inboundTx, TransferInfo outboundTx) public onlyOwner returns (bool) {
        require (inboundTx.amount > 0);
        require (outboundTx.amount > 0);
        require (wallet != address(0));

        // Perform outbound (SC to W) transfers
            
        if (outboundTx.tokenAddress == address(0)) {
            if (outboundTx.amount >= aggregatedEtherBalance) {
                return false;
            }

            walletInfoMap[wallet].stagedEtherBalance = SafeMath.add(walletInfoMap[wallet].stagedEtherBalance, outboundTx.amount);
            aggregatedEtherBalance = SafeMath.sub(aggregatedEtherBalance, outboundTx.amount);

        } else {
            if (outboundTx.amount >= aggregatedTokenBalance[outboundTx.tokenAddress]) {
                return false;
            }

            walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress] = SafeMath.add(walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress], outboundTx.amount);
            aggregatedTokenBalance[outboundTx.tokenAddress] = SafeMath.sub(aggregatedTokenBalance[outboundTx.tokenAddress], outboundTx.amount);
        }

        // Perform inbound (w to SC) transfers

        if (inboundTx.tokenAddress == address(0)) {
            require(walletInfoMap[wallet].stagedEtherBalance >= inboundTx.amount);
            walletInfoMap[wallet].stagedEtherBalance = SafeMath.sub(walletInfoMap[wallet].stagedEtherBalance, inboundTx.amount);
            aggregatedEtherBalance = SafeMath.add(aggregatedEtherBalance, inboundTx.amount);

        } else {
            require(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] >= inboundTx.amount);
            walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] = SafeMath.sub(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress], inboundTx.amount);
            aggregatedTokenBalance[inboundTx.tokenAddress] = SafeMath.add(aggregatedTokenBalance[inboundTx.tokenAddress], inboundTx.amount);
        }

        //raise event
        TwoWayTransferEvent(wallet, inboundTx, outboundTx);

        return true;
    }

    //
    // Helper internal functions
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function activeBalanceLookup(uint256 timestamp, DepositInfo[] storage deposits) internal view returns (uint256) {
        uint lo;
        uint hi;
        uint mid;

        hi = deposits.length;
        if (hi == 0)
            return 0; //no deposits

        //lookup for balance at the given timestamp (NOTE: mid has an offset of one)
        lo = 1;
        while (lo <= hi) {
            mid = lo + (hi - lo) / 2;
            if (timestamp == deposits[mid - 1].timestamp) {
                while (mid < deposits.length && timestamp == deposits[mid - 1].timestamp) {
                    mid++;
                }
                break;
            }
            if (timestamp < deposits[mid - 1].timestamp)
                hi = mid;
            else
                lo = mid + 1;
        }
        if (lo > hi)
            mid = deposits.length; //if not found, get the latest

        return deposits[mid - 1].balance;
    }

    function isValidAccrual(Accrual a) private view returns (bool) {
        require(a.benefactorAddress != address(0));
        require(a.amount > 0);

        //check accrual signature. the signature is based on accrual fields
        bytes32 hashWithoutSignature = keccak256(a.amount, a.benefactorAddress, a.tokenAddress, a.timestamp);
        uint8[65] memory signature = a.signature;
        bytes32 s;
        bytes32 r;
        uint8 v;

        assembly {
            r := mload(signature)
            s := mload(add(signature, 32))
            v := and(255, mload(add(signature, 64)))
        }

        if (ecrecover(hashWithoutSignature, v, r, s) != owner)
            return false;

        return true;
    }
}
