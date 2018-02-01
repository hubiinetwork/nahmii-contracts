/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Compliant to Omphalos 0.7 Specification.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.19;

import './ERC20.sol';
import './SafeMath.sol';

pragma experimental ABIEncoderV2;

contract DexAssetsManager {

	uint256 constant private LTC_DISPUTE_TIMER_SHIFT_SECS = 1800; // 30 mins

	uint256 private ltcDisputeTimePeriodSecs; 
	address private owner;

	// 
	// Structures
	// -----------------------------------------------------------------------------------------------------------------
	struct DepositInfo {
 		uint256 amount;
 		uint256 timestamp;
 		address token;      //0 for ethers
 	}

	struct PerWalletInfo {
		uint256 tradeNonce;

		DepositInfo[] deposits;

		// Active balance of ethers and tokens.
		uint256 activeEtherBalance;
		mapping (address => uint256) activeTokenBalance;

		// Staged balance of ethers and tokens.
		uint256 stagedEtherBalance;
		mapping (address => uint256) stagedTokenBalance;
	}

	mapping (address => PerWalletInfo) private walletInfoMap;

	struct Trade {
		uint256 buyOrderHash;
		uint256 sellOrderHash;
		address buyer;
		address seller;
		uint256 tokenAmount;
		uint256 etherAmount;
		address token;
	}
	
	//uint256 tpcDisputeStartTimestamp;
	//uint256 tpcVoteStartTimestamp;
	//struct Tpc {
	//	uin
	//}

	struct Settlement {
		// uint256[] tradeNonces;
		// uint256[] tradeHashes;
		// // Balances here
		// uint256[] signature;
	}

	struct LtcCandidate {
		uint256 tradeHash;
		address submitter;
	}

	// Last-Trade-Change
	struct Ltc {
		uint256 ordersRoot;
		uint256 disputeEndTimestamp;
		LtcCandidate[] candidates;
		mapping (uint256 => uint256) candidateListIndexMap; // Index starts from 1
	}

	enum LtcStage { 
		Open, Closed
	}

	mapping (uint256 => Trade) private tradeHashMap;
	mapping (address => Ltc) private ltcMap;

	// 
	// Events
	// -----------------------------------------------------------------------------------------------------------------
	event OwnerChanged(address oldOwner, address newOwner);
	event Deposit(address from, uint256 amount, address token); //token==0 for ethers
	event Withdraw(address to, uint256 amount, address token);  //token==0 for ethers
	event TradeCommitted(uint256 nonce, address wallet);
	event StartLastTradeChallengeEvent(address wallet, uint256 ordersRoot);

	// 
	// Constructor and owner change
	// -----------------------------------------------------------------------------------------------------------------
	function DexAssetsManager(address _owner) public {
		require(_owner != address(0));
		owner = _owner;
		ltcDisputeTimePeriodSecs = 3600;
	}
	
	function changeOwner(address newOwner) public onlyOwner {
		require(newOwner != address(0));
		address oldOwner = owner;
		owner = newOwner;
		OwnerChanged(oldOwner, newOwner);
	}

	// 
	// Deposit functions
	// -----------------------------------------------------------------------------------------------------------------

	function () public payable {
		require(msg.sender != owner);
		require(msg.value > 0);
		walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, msg.value);
		walletInfoMap[msg.sender].deposits.push(DepositInfo(msg.value, now, address(0)));
		Deposit(msg.sender, msg.value, 0);
	}

	function depositTokens(address tokenAddress, uint256 amount) public {
		require(tokenAddress != address(0));
		require(amount > 0);

		ERC20 token = ERC20(tokenAddress);
		require(token.balanceOf(msg.sender) >= amount);

		walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
		walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, now, tokenAddress));
		Deposit(msg.sender, amount, tokenAddress);
	}

	function deposits(address user, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
 		require (index < walletInfoMap[user].deposits.length);
 		amount = walletInfoMap[user].deposits[index].amount;
 		timestamp = walletInfoMap[user].deposits[index].timestamp;
 		token = walletInfoMap[user].deposits[index].token;
 	}

	 function depositsCount(address user) public view onlyOwner returns (uint256) {
 		return walletInfoMap[user].deposits.length;
 	}

	//
	// Balance functions
	// -----------------------------------------------------------------------------------------------------------------

	function activeBalance(address wallet, address token) public view onlyOwner returns (uint256) {
		require(wallet != address(0));
		return token == address(0x0) ? walletInfoMap[wallet].activeEtherBalance : walletInfoMap[wallet].activeTokenBalance[token];
	}

	function stagedBalance(address wallet, address token) public view onlyOwner returns (uint256) {
		require(wallet != address(0));
		return token == address(0x0) ? walletInfoMap[wallet].stagedEtherBalance : walletInfoMap[wallet].stagedTokenBalance[token];
	}

	function unstage(uint256 amount, address tokenAddress) public {
		require(amount > 0);
		require(msg.sender != owner);
		
		if (tokenAddress == address(0x0)) {
			require(walletInfoMap[msg.sender].stagedEtherBalance >= amount);
			walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);
			walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, amount);
		} else {
			require(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] >= amount);
			walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);
			walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
		}
	}
	
	// 
	// Last-Trade-Challenge (LTC) functions
	// -----------------------------------------------------------------------------------------------------------------
	function startLastTradeChallenge(uint256 _ordersRoot) public {
		require(msg.sender != owner);
		require(ltcMap[msg.sender].ordersRoot != 0);
		require(ltcMap[msg.sender].disputeEndTimestamp != 0);

		ltcMap[msg.sender] = Ltc({ 
			ordersRoot: _ordersRoot, 
			disputeEndTimestamp: now + ltcDisputeTimePeriodSecs, 
			candidates: new LtcCandidate[](0)
			});
		
		StartLastTradeChallengeEvent(msg.sender, _ordersRoot);		
	}

	function lastTradeChallengeStage(Trade t) public returns (LtcStage) {
		if (ltcMap[t.buyer].ordersRoot != 0) {
			if (ltcMap[t.buyer].disputeEndTimestamp > now) {
				return LtcStage.Closed;
			}
		} else if (ltcMap[t.seller].ordersRoot != 0) {
			if (ltcMap[t.seller].disputeEndTimestamp > now) {
				return LtcStage.Closed;
			}
		} else {
			return LtcStage.Closed;
		}

		return LtcStage.Open;
	}

	function internalChallengeTradeOrder (Trade t, address wallet) private {
		if (now >= ltcMap[wallet].disputeEndTimestamp) {
			revert();
		}
		
		uint256 tradeHash = uint256(keccak256(t));

		// TODO: Check what to do when the same Trade is submitted.
		if (ltcMap[wallet].candidateListIndexMap[tradeHash] != 0) {
			revert();
		}

		tradeHashMap[tradeHash] = t;

		ltcMap[wallet].candidates.push(LtcCandidate(tradeHash, msg.sender));
		ltcMap[wallet].candidateListIndexMap[tradeHash] = ltcMap[wallet].candidates.length;

		ltcMap[wallet].disputeEndTimestamp = SafeMath.add(ltcMap[wallet].disputeEndTimestamp, LTC_DISPUTE_TIMER_SHIFT_SECS);
	}

	function challengeTradeOrder(Trade t) public {
		require(msg.sender != owner);
		if (ltcMap[t.buyer].ordersRoot != 0) {
			internalChallengeTradeOrder(t, t.buyer);
		} else if (ltcMap[t.seller].ordersRoot != 0) {
			internalChallengeTradeOrder(t, t.seller);
		} else {
			revert();
		}
	}

	// 
	// Trade Properties Challenge (TPC) functions
	// -----------------------------------------------------------------------------------------------------------------
	function startTradePropertiesChallenge(uint256 startNonce, uint256 endNonce) {
		
	}


	function challengeTradeProperties(Trade trade, Trade candidateTrade) {

	}

	function closeTrade(Trade t, address wallet ) {

	}

	function settleTrades(Settlement s, Trade t, address wallet ) {

	}

	function tradeOrdersChallengeStage(Trade t) returns (uint256) {
		return 0;
	}


	function VoteOnTradeOrders(Trade t, uint256 option) {

	}

	//
	// Withdraw functions
	// -----------------------------------------------------------------------------------------------------------------

	function withdraw(uint256 amount, address tokenAddress) public {
		require (msg.sender != owner);
		require (amount > 0);
		if (token == address(0x0)) {
			require (amount <= walletInfoMap[msg.sender].activeEtherBalance);
			msg.sender.transfer(amount);
			walletInfoMap[msg.sender].activeEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].activeEtherBalance, amount);
		} else {
			require (amount <= walletInfoMap[msg.sender].activeTokenBalance[msg.sender]);
			ERC20 token = ERC20(tokenAddress);
			token.transfer(msg.sender, amount);
			walletInfoMap[msg.sender].activeTokenBalance[token] = SafeMath.sub(walletInfoMap[msg.sender].activeTokenBalance[token], amount);
		}

		//raise event
		Withdraw(msg.sender, amount, token);
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
