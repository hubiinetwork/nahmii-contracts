/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Compliant to Omphalos 0.11 Specification.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.19;

import './ERC20.sol';
import './SafeMath.sol';

pragma experimental ABIEncoderV2;

contract DexAssetsManager {

	uint256 private ltcDisputeTimePeriodMs;
	uint256 private ltcDisputeTimeShiftMs;
	uint256 private tpcDisputeTimePeriodMs;
	uint256 private tpcVotingTimePeriodMs;
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
		uint256 buyerOrderNonce;	// These ones should be obtained from orders map (accessed by hash),
		uint256 sellerOrderNonce;   // but we dont have such information.
		address buyer;
		address seller;
		uint256 tokenAmount;
		uint256 etherAmount;
		address token;
		uint8[65] signature;
	}
	
	//uint256 tpcDisputeStartTimestamp;
	//uint256 tpcVoteStartTimestamp;

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
		uint256 currentLastTradeHash;
		uint256 lastDisputeNonce;
		uint256[] ordersProofMap;
	}

	enum LtcStage { 
		Dispute, Closed
	}

	struct Tpc {
		uint256 tradeHash;
		uint256 disputeEndTimestamp;
		uint256 votingEndTimestamp;
	}

	mapping (uint256 => Trade) private tradeHashMap;
	mapping (address => Ltc) private ltcMap;
	mapping (address => Tpc[]) private tpcMap;

	// 
	// Events
	// -----------------------------------------------------------------------------------------------------------------
	event OwnerChanged(address oldOwner, address newOwner);
	event Deposit(address from, uint256 amount, address token); //token==0 for ethers
	event Withdraw(address to, uint256 amount, address token);  //token==0 for ethers
	event TradeCommitted(uint256 nonce, address wallet);
	event StartLastTradeChallengeEvent(address wallet, uint256 ordersRoot);
	event ChallengeLastTradeEvent(Trade t);
	event StartTradePropertiesChallengeEvent(address wallet, Trade t);
	// 
	// Constructor and owner change
	// -----------------------------------------------------------------------------------------------------------------
	function DexAssetsManager(address _owner) public {
		require(_owner != address(0));
		owner = _owner;

		ltcDisputeTimePeriodMs = 3600;
		ltcDisputeTimeShiftMs = 1800; //30 mins

		tpcDisputeTimePeriodMs = 3600;
		tpcVotingTimePeriodMs = 3600;
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

	function deposit(address wallet, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
 		require (index < walletInfoMap[wallet].deposits.length);

 		amount = walletInfoMap[wallet].deposits[index].amount;
 		timestamp = walletInfoMap[wallet].deposits[index].timestamp;
 		token = walletInfoMap[wallet].deposits[index].token;
 	}

	 function depositCount(address wallet) public view onlyOwner returns (uint256) {
 		return walletInfoMap[wallet].deposits.length;
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
	function startLastTradeChallenge(Trade t, address wallet, uint256 ordersRoot, uint256[] ordersProofMap ) public onlyOwner {
		if (msg.sender != owner) {
			wallet = msg.sender;
		}

		require(ordersRoot == 0 || ordersProofMap.length > 0); // to be checked.
		require(!isLtcActive(wallet));
		require(isTradeValid(t));

		if (t.buyer == wallet) {
			require (t.buyerOrderNonce > ltcMap[wallet].lastDisputeNonce);
		} else if (t.seller == wallet) {
			require (t.sellerOrderNonce > ltcMap[wallet].lastDisputeNonce);
		} else {
			revert();
		}
		
		uint256 tradeHash = uint256(keccak256(t));
		tradeHashMap[tradeHash] = t;

		ltcMap[wallet].ordersRoot = ordersRoot;
		if (ordersRoot != 0) {
			for (uint i = 0; i < ordersProofMap.length; i++) {
				ltcMap[wallet].ordersProofMap.push(ordersProofMap[i]);
			}
		}
		ltcMap[wallet].disputeEndTimestamp = SafeMath.add(now, ltcDisputeTimePeriodMs);
		ltcMap[wallet].currentLastTradeHash = tradeHash; 

		StartLastTradeChallengeEvent(wallet, ordersRoot);		
	}

	function lastTradeChallengeStage(address wallet) public view returns (uint256, LtcStage) {
		if (isLtcActive(wallet)) {
			return (ltcMap[wallet].lastDisputeNonce, LtcStage.Dispute);
		} else if (hasLtc(wallet) == false) {
			return (0, LtcStage.Closed);
		} else {
			return (ltcMap[wallet].lastDisputeNonce, LtcStage.Closed);
		}
	}

	function challengeLastTrade(Trade t) public {
		uint i;
		uint256 currentHash;

		require(msg.sender != owner);

		uint256 tradeHash = uint256(keccak256(t));

		if (isLtcActive(t.buyer)) {
			require (t.buyerOrderNonce >= tradeHashMap[ltcMap[t.buyer].currentLastTradeHash].buyerOrderNonce);
			
			if (ltcMap[t.buyer].ordersRoot != 0) {
				currentHash = t.buyOrderHash;
				for (i = ltcMap[t.buyer].ordersProofMap.length; i > 0; i--) {
					currentHash = uint256(keccak256(currentHash, ltcMap[t.buyer].ordersProofMap[i-1]));
				}

				require(ltcMap[t.buyer].ordersRoot == currentHash);
			}

			tradeHashMap[tradeHash] = t;
			ltcMap[t.buyer].currentLastTradeHash = tradeHash;
			ltcMap[t.buyer].disputeEndTimestamp = SafeMath.add(ltcMap[t.buyer].disputeEndTimestamp, ltcDisputeTimeShiftMs);
		} 
		if (isLtcActive(t.seller)) {
			require (t.sellerOrderNonce >= tradeHashMap[ltcMap[t.seller].currentLastTradeHash].sellerOrderNonce);

			if (ltcMap[t.seller].ordersRoot != 0) {
				currentHash = t.sellOrderHash;
				for (i = ltcMap[t.seller].ordersProofMap.length; i > 0; i--) {
					currentHash = uint256(keccak256(currentHash, ltcMap[t.seller].ordersProofMap[i-1]));
				}

				require(ltcMap[t.seller].ordersRoot == currentHash);
			}

			tradeHashMap[tradeHash] = t;
			ltcMap[t.seller].currentLastTradeHash = tradeHash;
			ltcMap[t.seller].disputeEndTimestamp = SafeMath.add(ltcMap[t.seller].disputeEndTimestamp, ltcDisputeTimeShiftMs);
		} 

		ChallengeLastTradeEvent(t);
	}

	function lastTradeChallengeResult(address wallet) public view returns (Trade) {
		if (msg.sender != owner) {
			wallet = msg.sender;
		}
		require (hasLtc(wallet) != false);
		return tradeHashMap[ltcMap[wallet].currentLastTradeHash];
	}

	// 
	// Trade Properties Challenge (TPC) functions
	// -----------------------------------------------------------------------------------------------------------------
	function startTradePropertiesChallenge(Trade[] t, address wallet) public {
		uint i;
		uint256 tradeHash;
		Tpc memory tpc;

		if (msg.sender != owner) {
			wallet = msg.sender;
		}
		for (i = 0; i < t.length; i++) {
			if (t[i].buyer == wallet || t[i].seller == wallet) {
				tradeHash = uint256(keccak256(t));
				tradeHashMap[tradeHash] = t[i];

				tpc = Tpc(tradeHash, SafeMath.add(now, tpcDisputeTimePeriodMs), SafeMath.add(now, tpcDisputeTimePeriodMs + tpcVotingTimePeriodMs));
				tpcMap[wallet].push(tpc);

				StartTradePropertiesChallengeEvent(wallet, t[i]);
			}
		}
	}

	/*
	function challengeTradeProperties(Trade trade, Trade candidateTrade) public {

	}

	function closeTrade(Trade t, address wallet ) public {

	}

	function settleTrades(Settlement s, Trade t, address wallet ) public {

	}

	function tradeOrdersChallengeStage(Trade t) public returns (uint256) {
		return 0;
	}


	function voteOnTradeOrders(Trade t, uint256 option) public {

	}
	*/

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

	//
	// Helper internal functions
	// -----------------------------------------------------------------------------------------------------------------

	function isTradeValid(Trade t) private view returns (bool) {
		if (t.buyer == t.seller) {
			return false;
		}
		if (t.buyer == owner || t.seller == owner) {
			return false;
		}

		bytes32 tradeHash = keccak256(t.buyOrderHash, t.sellOrderHash, t.buyerOrderNonce, t.sellerOrderNonce, t.buyer, t.seller, t.tokenAmount, t.etherAmount, t.token);
		uint8[65] memory signature = t.signature;
		bytes32 s;
		bytes32 r;
		uint8 v;

		assembly {
			r := mload(signature)
			s := mload(add(signature, 32))
			v := and(255, mload(add(signature, 64)))
		}

		if (ecrecover(tradeHash, v, r, s) != owner)
			return false;

		return true;
	}

	function hasLtc(address wallet) private view returns (bool) {
		return (ltcMap[wallet].disputeEndTimestamp != 0) ? true : false;
	}

	function isLtcActive(address wallet) private view returns (bool) {
		return (ltcMap[wallet].disputeEndTimestamp == 0 || now >= ltcMap[wallet].disputeEndTimestamp) ? false : true;
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
