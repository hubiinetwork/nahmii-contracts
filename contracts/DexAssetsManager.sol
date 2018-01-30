/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Compliant to Omphalos 0.6 Specification.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.15;

import './ERC20.sol';
import './SafeMath.sol';

//TO-DO: Get transactions history
//       Remove zeppelin dependency
//       Check security

contract DexAssetsManager {

	uint256 constant private WITHDRAW_RELEASE_TIME_WIN_MINUTES = 1; 

	address private owner;

	struct DepositInfo {
 		uint256 amount;
 		uint256 timestamp;
 		address token;      //0 for ethers
 	}

	struct PerUserInfo {
		uint256 tradeNonce;

		DepositInfo[] deposits;

		// Active balance of ethers and tokens.
		uint256 activeEtherBalance;
		mapping (address => uint256) activeTokenBalance;

		// Staged balance of ethers and tokens.
		uint256 stagedEtherBalance;
		mapping (address => uint256) stagedTokenBalance;
	}

	mapping (address => PerUserInfo) private userInfoMap;

	struct Trade {}

	struct Settlement {
		// uint256[] tradeNonces;
		// uint256[] tradeHashes;
		// // Balances here
		// uint256[] signature;
	}

	//events
	event OwnerChanged(address oldOwner, address newOwner);
	event Deposit(address from, uint256 amount, address token); //token==0 for ethers
	event Withdraw(address to, uint256 amount, address token);  //token==0 for ethers
	event TradeCommitted(uint256 nonce, address wallet);

	function DexAssetsManager(address _owner) public {
		require(_owner != address(0));
		owner = _owner;
	}
	
	function changeOwner(address newOwner) public onlyOwner {
		require(newOwner != address(0));
		address oldOwner = owner;
		owner = newOwner;
		OwnerChanged(oldOwner, newOwner);
	}

	// 
	// Deposit functions
	// -------------------------------------------------------------------------------------------------------------------------

	function () public payable {
		require(msg.sender != owner);
		require(msg.value > 0);
		userInfoMap[msg.sender].activeEtherBalance = SafeMath.add(userInfoMap[msg.sender].activeEtherBalance, msg.value);
		userInfoMap[msg.sender].deposits.push(DepositInfo(msg.value, now, address(0)));
		Deposit(msg.sender, msg.value, 0);
	}

	function depositTokens(address tokenAddress, uint256 amount) public {
		require(tokenAddress != address(0));
		require(amount > 0);

		ERC20 token = ERC20(tokenAddress);
		require(token.balanceOf(msg.sender) >= amount);

		userInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(userInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
		userInfoMap[msg.sender].deposits.push(DepositInfo(amount, now, tokenAddress));
		Deposit(msg.sender, amount, tokenAddress);
	}

	function deposits(address user, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
 		require (index < userInfoMap[user].deposits.length);
 		amount = userInfoMap[user].deposits[index].amount;
 		timestamp = userInfoMap[user].deposits[index].timestamp;
 		token = userInfoMap[user].deposits[index].token;
 	}

	 function depositsCount(address user) public view onlyOwner returns (uint256) {
 		return userInfoMap[user].deposits.length;
 	}

	//
	// Balance functions
	// -------------------------------------------------------------------------------------------------------------------------

	function activeBalance(address wallet, address token) public view onlyOwner returns (uint256) {
		require(wallet != address(0));
		return token == address(0x0) ? userInfoMap[wallet].activeEtherBalance : userInfoMap[wallet].activeTokenBalance[token];
	}

	function stagedBalance(address wallet, address token) public view onlyOwner returns (uint256) {
		require(wallet != address(0));
		return token == address(0x0) ? userInfoMap[wallet].stagedEtherBalance : userInfoMap[wallet].stagedTokenBalance[token];
	}

	function unstage(uint256 amount, address tokenAddress) {
		require(amount > 0);
		require(msg.sender != owner);
	}
	
	//
	// Trade Challenge/Settlement Functions
	// -------------------------------------------------------------------------------------------------------------------------
	function startTradePropertiesChallenge(uint256[] startNonces, uint256[] endNonces, uint256 tradeCount) {

	}

	function startLastTradeChallenge(/* orders root */) {

	}

	function challengeTradeOrder(Trade t) {

	}

	function challengeLastTrade(Trade t) {

	}

	function closeTrade(Trade t, address wallet ) {

	}

	function settleTrades(Settlement s, Trade t, address wallet ) {

	}

	function tradeOrdersChallengeStage(Trade t) returns (uint256) {
		return 0;
	}

	function lastTradeChallengeStage(Trade t) returns (uint256) {
		return 0;
	}

	function VoteOnTradeOrders(Trade t, uint256 option) {

	}

	//
	// Withdraw functions
	// -------------------------------------------------------------------------------------------------------------------------

	function withdraw(uint256 amount, address tokenAddress) public {
		require (msg.sender != owner);
		require (amount > 0);
		if (token == address(0x0)) {
			require (amount <= userInfoMap[msg.sender].activeEtherBalance);
			msg.sender.transfer(amount);
			userInfoMap[msg.sender].activeEtherBalance = SafeMath.sub(userInfoMap[msg.sender].activeEtherBalance, amount);
		} else {
			require (amount <= userInfoMap[msg.sender].activeTokenBalance[msg.sender]);
			ERC20 token = ERC20(tokenAddress);
			token.transfer(msg.sender, amount);
			userInfoMap[msg.sender].activeTokenBalance[token] = SafeMath.sub(userInfoMap[msg.sender].activeTokenBalance[token], amount);
		}

		//raise event
		Withdraw(msg.sender, amount, token);
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
