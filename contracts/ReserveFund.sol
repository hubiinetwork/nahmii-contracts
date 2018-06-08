/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import "./Ownable.sol";
import './ERC20.sol';
import "./Beneficiary.sol";
import "./Benefactor.sol";
import "./Servable.sol";
import "./ClientFund.sol";

/**
@title Reserve fund
@notice Fund into which users may make deposits and earn share of revenue relative to their contribution.
 There will likely be 2 instances of this smart contract, one for trade reserves and one for payment reserves.
*/
contract ReserveFund is Ownable, Beneficiary, Benefactor, Servable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public closeAccrualPeriodServiceAction = "close_accrual_period";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositHistory {
        address currency;
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

        // Calculated token balance after each transfer to/from wallet
        mapping(address => int256[]) tokenBalances;

        // Calculated token balance blocks at each transfer to/from wallet
        mapping(address => int256[]) tokenBalanceBlocks;

        // Block numbers at which address a has had its ether balance updated
        mapping(address => uint256[]) tokenBalanceBlockNumbers;

        // Accrual block tracking
        mapping(address => uint256[]) tokenAccrualBlockNumbers;
        uint256[] etherAccrualBlockNumbers;

        mapping(address => uint256[]) tokenClaimAccrualBlockNumbers;
        uint256[] etherClaimAccrualBlockNumbers;
    }

    struct TransferInfo {
        address currency; // 0 for ethers.
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

    address private clientFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address wallet, int256 amount, address token); //token==0 for ethers
    event StageEvent(address wallet, int256 amount, address token); //token==0 for ethers
    event StageToEvent(address from, int256 amount, address token, address beneficiary); //token==0 for ethers
    event WithdrawEvent(address wallet, int256 amount, address token); //token==0 for ethers
    event TwoWayTransferEvent(address wallet, TransferInfo inboundTx, TransferInfo outboundTx);
    event ClaimAccrualEvent(address token); //token==0 for ethers
    event CloseAccrualPeriodEvent();
    event ChangeClientFundEvent(address oldClientFund, address newClientFund);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Beneficiary() Benefactor() Servable() public {
    }

    function changeClientFund(address newClientFund) public onlyOwner  {
        address oldClientFund;

        require(newClientFund != address(0));
        require(newClientFund != address(this));

        if (newClientFund != clientFund) {
            // Set new address
            oldClientFund = clientFund;
            clientFund = newClientFund;

            // Emit event
            emit ChangeClientFundEvent(oldClientFund, newClientFund);
        }
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public payable {
        storeEthers(msg.sender);
    }

    function storeEthers(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        if (wallet == owner) {
            periodAccrualEtherBalance = periodAccrualEtherBalance.add_nn(amount);
            aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.add_nn(amount);
        }
        else {
            uint256 len = walletInfoMap[wallet].etherBalanceBlockNumbers.length;
            uint256 blockSpan = block.number.sub((len > 0) ? walletInfoMap[wallet].etherBalanceBlockNumbers[len - 1] : 0);
            int256 balanceBlock = walletInfoMap[wallet].activeEtherBalance.mul(SafeMathInt.toInt256(blockSpan));

            walletInfoMap[wallet].etherBalanceBlocks.push(balanceBlock);
            walletInfoMap[wallet].etherBalanceBlockNumbers.push(block.number);

            walletInfoMap[wallet].activeEtherBalance = walletInfoMap[wallet].activeEtherBalance.add_nn(amount);
            walletInfoMap[wallet].etherBalances.push(walletInfoMap[wallet].activeEtherBalance);
            aggregatedEtherBalance = aggregatedEtherBalance.add_nn(amount);
        }

        //add to per-wallet active balance
        walletInfoMap[wallet].depositsEther.push(DepositInfo(amount, now, walletInfoMap[wallet].activeEtherBalance, block.number));
        walletInfoMap[wallet].depositsHistory.push(DepositHistory(address(0), walletInfoMap[wallet].depositsEther.length - 1));

        //emit event
        emit DepositEvent(wallet, amount, address(0));
    }

    function depositTokens(address token, int256 amount) public {
        storeTokens(msg.sender, amount, token);
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function storeTokens(address wallet, int256 amount, address token) public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount > 0);
        erc20_token = ERC20(token);

        if (wallet == owner) {
            periodAccrualTokenBalance[token] = periodAccrualTokenBalance[token].add_nn(amount);
            aggregateAccrualTokenBalance[token] = aggregateAccrualTokenBalance[token].add_nn(amount);

            if (isAccruedTokenMap[token] == 0)
            {
                accrualPeriodTokenList.push(token);
                isAccruedTokenMap[token] = 1;
            }
        }
        else {
            uint256 len = walletInfoMap[wallet].tokenBalanceBlockNumbers[token].length;
            uint256 blockSpan = block.number.sub((len > 0) ? walletInfoMap[wallet].tokenBalanceBlockNumbers[token][len - 1] : 0);
            int256 balanceBlock = walletInfoMap[wallet].activeTokenBalance[token].mul(SafeMathInt.toInt256(blockSpan));

            walletInfoMap[wallet].tokenBalanceBlocks[token].push(balanceBlock);
            walletInfoMap[wallet].tokenBalanceBlockNumbers[token].push(block.number);

            walletInfoMap[wallet].activeTokenBalance[token] = walletInfoMap[wallet].activeTokenBalance[token].add_nn(amount);
            walletInfoMap[wallet].tokenBalances[token].push(walletInfoMap[wallet].activeTokenBalance[token]);
            aggregatedTokenBalance[token] = aggregatedTokenBalance[token].add_nn(amount);
        }

        // Amount must be >0 so there's no problem with conversion to unsigned.
        require(erc20_token.transferFrom(wallet, this, uint256 (amount)));
        walletInfoMap[wallet].depositsToken[token].push(DepositInfo(amount, now, walletInfoMap[wallet].activeTokenBalance[token], block.number));
        walletInfoMap[wallet].depositsHistory.push(DepositHistory(token, walletInfoMap[wallet].depositsToken[token].length - 1));

        //emit event
        emit DepositEvent(wallet, amount, token);
    }

    function deposit(address wallet, uint index) public view returns (int256 amount, address token, uint256 blockNumber) {
         require(wallet != address(0));
         require(index < walletInfoMap[wallet].depositsHistory.length);

        DepositHistory storage dh = walletInfoMap[wallet].depositsHistory[index];
        //NOTE: Code duplication in order to keep compiler happy and avoid warnings
        if (dh.currency == address(0)) {
            DepositInfo[] storage di = walletInfoMap[wallet].depositsEther;
            amount = di[dh.listIndex].amount;
            token = address(0);
            blockNumber = di[dh.listIndex].block;
        } else {
            DepositInfo[] storage diT = walletInfoMap[wallet].depositsToken[dh.currency];
            amount = diT[dh.listIndex].amount;
            token = dh.currency;
            blockNumber = diT[dh.listIndex].block;
        }
     }

    function depositCount(address wallet) public view returns (uint256) {
        return walletInfoMap[wallet].depositsHistory.length;
    }

    function periodAccrualBalance(address token) public view returns (int256) {
        return token == address(0) ? periodAccrualEtherBalance : periodAccrualTokenBalance[token];
    }

    function aggregateAccrualBalance(address token) public view returns (int256) {
        return token == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[token];
    }

    function closeAccrualPeriod() public onlyOwnerOrServiceAction(closeAccrualPeriodServiceAction) {

        // Register this block
        accrualBlockNumbers.push(block.number);

        // Clear accruals
        periodAccrualEtherBalance = 0;
        for (uint256 i = 0; i < accrualPeriodTokenList.length; i++) {
            periodAccrualTokenBalance[accrualPeriodTokenList[i]] = 0;
        }

        emit CloseAccrualPeriodEvent();
    }

    function claimAccrual(address token, bool compoundAccrual) public {
        uint256 bn_low;
        uint256 bn_up;
        uint256 lenClaimAccrualBlocks;
        require(token == address(0) ? (aggregatedEtherBalance > 0) : (aggregatedTokenBalance[token] > 0));

        /* lower bound = last accrual block number claimed for currency c by msg.sender OR 0 */

        /* upper bound = last accrual block number */

        require (accrualBlockNumbers.length > 0);
        bn_up = accrualBlockNumbers[accrualBlockNumbers.length - 1];

        if (token == address(0)) {
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
            lenClaimAccrualBlocks = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token].length;
            if (walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token].length == 0) {

                /* no block numbers for claimed accruals yet */
                bn_low = 0;
            }
            else {
                bn_low = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token][lenClaimAccrualBlocks - 1];
            }
        }

        int256 bb = internalBalanceBlocksIn(msg.sender, token, bn_low, bn_up);

        require (bn_low != bn_up); // avoid division by 0

        int256 blockspan = SafeMathInt.toInt256(bn_up.sub(bn_low));
        int256 balance =  token == address(0) ? aggregatedEtherBalance : aggregatedTokenBalance[token];
        int256 fraction = bb.mul_nn(1e18).mul_nn(token == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[token]).div_nn(balance.mul_nn(blockspan).mul_nn(1e18));
        int256 amount =   fraction.mul_nn(token == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[token]).div_nn(1e18);

        /* Move calculated amount a of currency c from aggregate active balance of currency c to msg.sender’s staged balance of currency c */

        if (token == address(0)) {
            aggregatedEtherBalance = aggregatedEtherBalance.sub_nn(amount);

            if (compoundAccrual) {
                walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.add_nn(amount);
            }
            else {
                walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount);
            }
        } else {
            aggregatedTokenBalance[token] = aggregatedTokenBalance[token].sub_nn(amount);

            if (compoundAccrual) {
                walletInfoMap[msg.sender].activeTokenBalance[token] = walletInfoMap[msg.sender].activeTokenBalance[token].add_nn(amount);
            }
            else {
                walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].add_nn(amount);
            }

        }

        /* Store upperbound as the last claimed accrual block number for currency */

        if (token == address(0)) {
            walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.push(bn_up);
        }
        else {
            walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token].push(bn_up);
        }

        emit ClaimAccrualEvent(token);
    }

    function stage(address token, int256 amount) public notOwner {
        require(amount.isPositiveInt256());

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].activeEtherBalance);
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.sub_nn(amount);
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(amount, now, walletInfoMap[msg.sender].activeEtherBalance, block.number));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));
            walletInfoMap[msg.sender].etherBalances.push(walletInfoMap[msg.sender].activeEtherBalance);
        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].activeTokenBalance[token]);
            require(amount > 0);

            walletInfoMap[msg.sender].activeTokenBalance[token] = walletInfoMap[msg.sender].activeTokenBalance[token].sub_nn(amount);
            walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].add_nn(amount);

            walletInfoMap[msg.sender].depositsToken[token].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[token], block.number));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(token, walletInfoMap[msg.sender].depositsToken[token].length - 1));
            walletInfoMap[msg.sender].tokenBalances[token].push(walletInfoMap[msg.sender].activeTokenBalance[token]);
        }

        //emit event
        emit StageEvent(msg.sender, amount, token);
    }

    function stageTo(address token, int256 amount, address beneficiary) public notOwner {
        Beneficiary beneficiary_sc;

        require(amount.isPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        beneficiary_sc = Beneficiary(beneficiary);

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].activeEtherBalance);
            require(amount > 0);

            //move from active balance
            walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.sub_nn(amount);

            //transfer funds to the beneficiary
            beneficiary_sc.storeEthers.value(uint256(amount))(msg.sender);
        } else {
            ERC20 erc20_token;

            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].activeTokenBalance[token]);
            require(amount > 0);

            //move from active balance
            walletInfoMap[msg.sender].activeTokenBalance[token] = walletInfoMap[msg.sender].activeTokenBalance[token].sub_nn(amount);

            //first approve token transfer
            erc20_token = ERC20(token);
            require(erc20_token.approve(beneficiary, uint256(amount)));

            //transfer funds to the beneficiary
            beneficiary_sc.storeTokens(msg.sender, amount, token);
        }

        //emit event
        emit StageToEvent(msg.sender, amount, token, beneficiary);
    }

    function activeBalance(address wallet, address token) public view returns (int256) {
        //if no wallet provided, get the current aggregated balance
        if (wallet == address(0)) {
            if (token == address(0))
                return aggregatedEtherBalance;

            return aggregatedTokenBalance[token];
        }
        else {
            if (token == address(0))
                return walletInfoMap[wallet].activeEtherBalance;

            return walletInfoMap[wallet].activeTokenBalance[token];
        }
    }

    function stagedBalance(address wallet, address token) public view returns (int256) {
        if (token == address(0))
            return walletInfoMap[wallet].stagedEtherBalance;
        return walletInfoMap[wallet].stagedTokenBalance[token];
    }

    function withdrawEther(int256 amount) public {
        require(msg.sender != owner);
        if (amount > walletInfoMap[msg.sender].stagedEtherBalance) {
            amount = walletInfoMap[msg.sender].stagedEtherBalance;
        }
        require(amount > 0);

        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);

        //execute transfer
        msg.sender.transfer(uint256(amount));

        //raise event
        emit WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(address token, int256 amount) public {
        require(msg.sender != owner);
        require(token != address(0));
        if (amount > walletInfoMap[msg.sender].stagedTokenBalance[token]) {
            amount = walletInfoMap[msg.sender].stagedTokenBalance[token];
        }
        require(amount > 0);

        walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub_nn(amount);

        //execute transfer
        ERC20 erc20_token = ERC20(token);
        erc20_token.transfer(msg.sender, uint256(amount));

        //raise event
        emit WithdrawEvent(msg.sender, amount, token);
    }

    function outboundTransferSupported(TransferInfo outboundTx) public view onlyOwner returns (bool) {
        return (outboundTx.currency == address(0) ? outboundTx.amount <= aggregatedEtherBalance : outboundTx.amount <= aggregatedTokenBalance[outboundTx.currency]);
    }

    function twoWayTransfer(address wallet, TransferInfo inboundTx, TransferInfo outboundTx) public onlyOwner {
        ClientFund sc_clientfund;
        ERC20 erc20_token;

        //require (msg.sender == exchangeSmartContract);
        require(clientFund != address(0));
        require(inboundTx.amount.isPositiveInt256());
        require(outboundTx.amount.isPositiveInt256());
        require(wallet != address(0));

        sc_clientfund = ClientFund(clientFund);

        // Perform outbound (SC to W) transfers
        if (outboundTx.currency == address(0)) {
            aggregatedEtherBalance = aggregatedEtherBalance.sub_nn(outboundTx.amount);

            clientFund.transfer(uint256(outboundTx.amount));
            sc_clientfund.reserveFundAddToStaged(wallet, outboundTx.amount, outboundTx.currency);

            walletInfoMap[wallet].stagedEtherBalance = walletInfoMap[wallet].stagedEtherBalance.add_nn(outboundTx.amount);
        } else {
            erc20_token = ERC20(outboundTx.currency);

            erc20_token.transfer(clientFund, uint256(outboundTx.amount));
            sc_clientfund.reserveFundAddToStaged(wallet, outboundTx.amount, outboundTx.currency);

            aggregatedTokenBalance[outboundTx.currency] = aggregatedTokenBalance[outboundTx.currency].sub_nn(outboundTx.amount);
        }

        // Perform inbound (w to SC) transfers
        if (inboundTx.currency == address(0)) {
            sc_clientfund.reserveFundGetFromDeposited(wallet, inboundTx.amount, inboundTx.currency);

            aggregatedEtherBalance = aggregatedEtherBalance.add_nn(inboundTx.amount);
        } else {
            sc_clientfund.reserveFundGetFromDeposited(wallet, inboundTx.amount, inboundTx.currency);

            aggregatedTokenBalance[inboundTx.currency] = aggregatedTokenBalance[inboundTx.currency].add_nn(inboundTx.amount);
        }

        //raise event
        //
        emit TwoWayTransferEvent(wallet, inboundTx, outboundTx);
    }

    //
    // Debugging helper functions
    // -----------------------------------------------------------------------------------------------------------------
    function debugBalanceBlocksIn(address wallet, address token, uint256 startBlock, uint256 endBlock) external view onlyOwner returns (int256) {
        return internalBalanceBlocksIn(wallet, token, startBlock, endBlock);
    }

    //
    // Internal helper functions
    // -----------------------------------------------------------------------------------------------------------------
    function internalBalanceBlocksIn(address wallet, address token, uint256 startBlock, uint256 endBlock) internal view returns (int256) {
        uint256 idx;
        int256 res;
        uint256 h;

        require (startBlock < endBlock);
        require (wallet != address(0));

        int256[] storage _balanceBlocks = (token == address(0)) ? walletInfoMap[wallet].etherBalanceBlocks : walletInfoMap[wallet].tokenBalanceBlocks[token];
        uint256[] storage _balanceBlockNumbers = (token == address(0)) ? walletInfoMap[wallet].etherBalanceBlockNumbers : walletInfoMap[wallet].tokenBalanceBlockNumbers[token];

        if (_balanceBlockNumbers.length == 0 || endBlock < _balanceBlockNumbers[0]) {
            return 0;
        }

        idx = 0;
        while (idx < _balanceBlockNumbers.length && _balanceBlockNumbers[idx] < startBlock) {
            idx++;
        }

        if (idx >= _balanceBlockNumbers.length) {
            res = _balanceBlocks[_balanceBlockNumbers.length - 1].mul_nn( SafeMathInt.toInt256(endBlock.sub(startBlock)) );
        }
        else {
            h = _balanceBlockNumbers[idx];
            if (h > endBlock) {
                h = endBlock;
            }

            h = h.sub(startBlock);
            res = (h == 0) ? 0 : beta(wallet, token, idx).mul_nn( SafeMathInt.toInt256(h) ).div_nn( SafeMathInt.toInt256(_balanceBlockNumbers[idx].sub( (idx == 0) ? startBlock : _balanceBlockNumbers[idx - 1] )) );
            idx++;

            while (idx < _balanceBlockNumbers.length && _balanceBlockNumbers[idx] < endBlock) {
                res = res.add_nn(beta(wallet, token, idx));
                idx++;
            }

            if (idx >= _balanceBlockNumbers.length) {
                res = res.add_nn(_balanceBlocks[_balanceBlockNumbers.length - 1].mul_nn( SafeMathInt.toInt256(endBlock.sub(_balanceBlockNumbers[_balanceBlockNumbers.length - 1])) ));
            } else if (_balanceBlockNumbers[idx - 1] < endBlock) {
                res = res.add_nn(beta(wallet, token, idx).mul_nn( SafeMathInt.toInt256(endBlock.sub(_balanceBlockNumbers[idx - 1])) ).div_nn( SafeMathInt.toInt256(_balanceBlockNumbers[idx].sub(_balanceBlockNumbers[idx - 1])) ));
            }
        }

        return res;
    }

    function beta(address wallet, address token, uint256 idx) private view returns (int256) {
        if (idx == 0)
            return 0;
        if (token == address(0))
            return walletInfoMap[wallet].etherBalanceBlocks[idx - 1].mul_nn( SafeMathInt.toInt256(walletInfoMap[wallet].etherBalanceBlockNumbers[idx].sub(walletInfoMap[wallet].etherBalanceBlockNumbers[idx - 1])) );
        return walletInfoMap[wallet].tokenBalanceBlocks[token][idx - 1].mul_nn( SafeMathInt.toInt256(walletInfoMap[wallet].tokenBalanceBlockNumbers[token][idx].sub(walletInfoMap[wallet].tokenBalanceBlockNumbers[token][idx - 1])) );
    }
}
