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
import "./DexReserveFunds.sol";

pragma experimental ABIEncoderV2;

contract DexTrade {
    //
    // Enumerations
    // -----------------------------------------------------------------------------------------------------------------
    enum LTC_STAGE { Closed, Dispute }

    enum TPC_STAGE { Closed, Dispute, Voting }

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

    struct Signature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct Trade {
        uint256 buyOrderHash;
        uint256 sellOrderHash;
        uint256 buyerOrderNonce;    // These ones should be obtained from orders map (accessed by hash),
        uint256 sellerOrderNonce;   // but we dont have such information.
        address buyer;
        address seller;
        uint256 tokenAmount;
        uint256 etherAmount;
        address token;
        bool immediateSettlement;
        Signature signature;
    }

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

    struct TpcCandidate {
        uint256 tradeHash;
        address submitter;
        uint votesCount;
    }

    struct Tpc {
        uint256 disputeEndTimestamp;
        uint256 votingEndTimestamp;
        uint tradeVotesCount;
        TpcCandidate[] tradeCandidates;
        mapping (uint256 => uint) tradeCandidatesInverseMap;
        mapping (address => bool) votersMap;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    address private _reserveFundSmartContract;
    address private _tokenHolderRevenueFundSmartContract;
    address private _feesManagerSmartContract;
    address private _periodsManagerSmartContract;

    uint256 private ltcDisputeTimePeriodMs;
    uint256 private ltcDisputeTimeShiftMs;
    uint256 private tpcDisputeTimePeriodMs;
    uint256 private tpcVotingTimePeriodMs;
    uint256 private tpcDisputeTimeShiftMs;
    uint256 private tpcVotingTimeShiftMs;

    mapping (address => PerWalletInfo) private walletInfoMap;
    mapping (uint256 => Trade) private tradeHashMap;
    mapping (address => Ltc) private ltcMap;
    mapping (address => mapping (uint256 => Tpc)) private tpcMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, uint256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address to, uint256 amount, address token);  //token==0 for ethers
    event StartLastTradeChallengeEvent(address wallet, uint256 ordersRoot);
    event ChallengeLastTradeEvent(Trade t);
    event StartTradePropertiesChallengeEvent(address wallet, Trade t);
    event ChallengeTradePropertiesEvent(address wallet, Trade t, Trade candidateT);
    event VoteOnTradePropertiesEvent(address wallet, Trade t, Trade voteT);
    event CloseTradeEvent(address wallet, Trade t);
    event CloseTradePropertiesChallengeEvent(Trade t);
    event CloseLastTradeChallengeEvent(Trade t);

    //
    // Constructor, owner and related contracts address setters
    // -----------------------------------------------------------------------------------------------------------------
    function DexTrade(address _owner) public {
        require(_owner != address(0));

        owner = _owner;

        ltcDisputeTimePeriodMs = 3600;
        ltcDisputeTimeShiftMs = 1800; //30 mins

        tpcDisputeTimePeriodMs = 3600;
        tpcVotingTimePeriodMs = 3600;

        tpcDisputeTimeShiftMs = 1800; //30 mins
        tpcVotingTimeShiftMs = 1800; //30 mins
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

    function reserveFundSmartContract(address addr) public onlyOwner {
        require(addr != address (0));
        _reserveFundSmartContract = addr;
    }

    function tokenHolderRevenueFundSmartContract(address addr) public onlyOwner {
        require(addr != address (0));
        _tokenHolderRevenueFundSmartContract = addr;
    }

    function feesManagerSmartContract(address addr) public onlyOwner {
        require(addr != address (0));
        _feesManagerSmartContract = addr;
    
    }
    function periodsManagerSmartContract(address addr) public onlyOwner {
        require(addr != address (0));
        _periodsManagerSmartContract = addr;
    }


    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public payable {
        require(msg.sender != owner);
        require(msg.value > 0);

        //add to per-wallet active balance
        walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, msg.value);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(msg.value, block.timestamp, address(0)));

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
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, tokenAddress));

        //emit event
        DepositEvent(msg.sender, amount, tokenAddress);
    }

    function deposit(address wallet, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
        require(index < walletInfoMap[wallet].deposits.length);

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
    function startLastTradeChallenge(Trade t, address wallet, uint256 ordersRoot, uint256[] ordersProofMap) public {
        uint256 tradeHash;
        uint i;

        if (msg.sender != owner) {
            wallet = msg.sender;
        }
        require(wallet != address(0));

        require(ordersRoot == 0 || ordersProofMap.length > 0); // to be checked.
        require(getLtcStage(wallet) == LTC_STAGE.Closed);
        require(isTradeValid(t));

        if (t.buyer == wallet) {
            require(t.buyerOrderNonce > ltcMap[wallet].lastDisputeNonce);
        } else if (t.seller == wallet) {
            require(t.sellerOrderNonce > ltcMap[wallet].lastDisputeNonce);
        } else {
            revert();
        }

        return;

        tradeHash = calculateTradeHash(t);
        tradeHashMap[tradeHash] = t;

        ltcMap[wallet].ordersRoot = ordersRoot;
        if (ordersRoot != 0) {
            for (i = 0; i < ordersProofMap.length; i++) {
                ltcMap[wallet].ordersProofMap.push(ordersProofMap[i]);
            }
        }
        ltcMap[wallet].disputeEndTimestamp = SafeMath.add(block.timestamp, ltcDisputeTimePeriodMs);
        ltcMap[wallet].currentLastTradeHash = tradeHash; 

        //raise event
        StartLastTradeChallengeEvent(wallet, ordersRoot);        
    }

    function lastTradeChallengeStage(address wallet) public view returns (uint256, LTC_STAGE) {
        require(wallet != address(0));
        require(wallet != owner);

        if (getLtcStage(wallet) == LTC_STAGE.Dispute) {
            return (ltcMap[wallet].lastDisputeNonce, LTC_STAGE.Dispute);
        } else if (hasLtc(wallet) == false) {
            return (0, LTC_STAGE.Closed);
        } else {
            return (ltcMap[wallet].lastDisputeNonce, LTC_STAGE.Closed);
        }
    }

    function challengeLastTrade(Trade t) public {
        uint i;
        uint256 tradeHash;
        uint256 currentHash;

        require(msg.sender != owner);
        require(isTradeValid(t));

        tradeHash = calculateTradeHash(t);

        if (getLtcStage(t.buyer) == LTC_STAGE.Dispute) {
            require(t.buyerOrderNonce >= tradeHashMap[ltcMap[t.buyer].currentLastTradeHash].buyerOrderNonce);
            
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
        if (getLtcStage(t.seller) == LTC_STAGE.Dispute) {
            require(t.sellerOrderNonce >= tradeHashMap[ltcMap[t.seller].currentLastTradeHash].sellerOrderNonce);

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

        //emit event
        ChallengeLastTradeEvent(t);
    }

    function lastTradeChallengeResult(address wallet) public view returns (Trade) {
        if (msg.sender != owner) {
            wallet = msg.sender;
        }
        require(wallet != address(0));
        require(hasLtc(wallet) != false);
        
        return tradeHashMap[ltcMap[wallet].currentLastTradeHash];
    }

    //
    // Trade Properties Challenge (TPC) functions
    // -----------------------------------------------------------------------------------------------------------------
    function startTradePropertiesChallenge(Trade[] t, address wallet) public {
        uint i;
        uint256 tradeHash;

        if (msg.sender != owner) {
            wallet = msg.sender;
        }
        require(wallet != address(0));

        for (i = 0; i < t.length; i++) {
            require (isTradeValid(t[i]));
            if (t[i].buyer == wallet || t[i].seller == wallet) {
                tradeHash = calculateTradeHash(t[i]);
                tradeHashMap[tradeHash] = t[i];

                require(getTpcStage(wallet, tradeHash) == TPC_STAGE.Closed); //A TPC for a wallet cannot be submitted if one is already active
                
                tpcMap[wallet][tradeHash].disputeEndTimestamp = SafeMath.add(block.timestamp, tpcDisputeTimePeriodMs);
                tpcMap[wallet][tradeHash].votingEndTimestamp = SafeMath.add(block.timestamp, tpcDisputeTimePeriodMs + tpcVotingTimePeriodMs);
                tpcMap[wallet][tradeHash].tradeVotesCount = 0;

                //emit event
        		StartTradePropertiesChallengeEvent(wallet, t[i]);
            }
        }
    }

    function challengeTradeProperties(Trade t, Trade candidateT) public {
        uint256 tradeHash;
        uint256 candidateTradeHash;

        require(isTradeValid(t));
        require(isTradeValid(candidateT));
        tradeHash = calculateTradeHash(t);
        candidateTradeHash = calculateTradeHash(candidateT);

        if (getTpcStage(t.buyer, tradeHash) == TPC_STAGE.Dispute) {
            require(tpcMap[t.buyer][tradeHash].tradeCandidatesInverseMap[candidateTradeHash] == 0); //check if candidate trade already submitted

            tradeHashMap[candidateTradeHash] = candidateT;

            tpcMap[t.buyer][tradeHash].tradeCandidates.push(TpcCandidate(candidateTradeHash, msg.sender, 0));
            tpcMap[t.buyer][tradeHash].tradeCandidatesInverseMap[candidateTradeHash] = tpcMap[t.buyer][tradeHash].tradeCandidates.length;

            tpcMap[t.buyer][tradeHash].disputeEndTimestamp = SafeMath.add(tpcMap[t.buyer][tradeHash].disputeEndTimestamp, tpcDisputeTimeShiftMs);
            tpcMap[t.buyer][tradeHash].votingEndTimestamp = SafeMath.add(tpcMap[t.buyer][tradeHash].votingEndTimestamp, tpcDisputeTimeShiftMs);

            //emit event
        	ChallengeTradePropertiesEvent(t.buyer, t, candidateT);
        }

        if (getTpcStage(t.seller, tradeHash) == TPC_STAGE.Dispute) {
            require(tpcMap[t.seller][tradeHash].tradeCandidatesInverseMap[candidateTradeHash] == 0); //check if candidate trade already submitted

            tradeHashMap[candidateTradeHash] = candidateT;

            tpcMap[t.seller][tradeHash].tradeCandidates.push(TpcCandidate(candidateTradeHash, msg.sender, 0));
            tpcMap[t.seller][tradeHash].tradeCandidatesInverseMap[candidateTradeHash] = tpcMap[t.seller][tradeHash].tradeCandidates.length;

            tpcMap[t.seller][tradeHash].disputeEndTimestamp = SafeMath.add(tpcMap[t.seller][tradeHash].disputeEndTimestamp, tpcDisputeTimeShiftMs);
            tpcMap[t.seller][tradeHash].votingEndTimestamp = SafeMath.add(tpcMap[t.seller][tradeHash].votingEndTimestamp, tpcDisputeTimeShiftMs);

            //emit event
        	ChallengeTradePropertiesEvent(t.seller, t, candidateT);
        }
    }

    function voteOnTradeOrders(Trade t, Trade voteT) public {
        uint256 tradeHash;
        uint256 voteTradeHash;
        uint listIndex;

        require(isTradeValid(t));
        require(isTradeValid(voteT));
        tradeHash = calculateTradeHash(t);
        voteTradeHash = calculateTradeHash(voteT);

        if (getTpcStage(t.buyer, tradeHash) == TPC_STAGE.Voting) {
            require(!tpcMap[t.buyer][tradeHash].votersMap[msg.sender]); //check if already voted

            tpcMap[t.buyer][tradeHash].votersMap[msg.sender] = true;
            if (tradeHash == voteTradeHash) {
                tpcMap[t.buyer][tradeHash].tradeVotesCount++;
            } else {
                listIndex = tpcMap[t.buyer][tradeHash].tradeCandidatesInverseMap[voteTradeHash];
                require(listIndex != 0); //candidate must exist

                tpcMap[t.buyer][tradeHash].tradeCandidates[listIndex - 1].votesCount++;
            }

            //emit event
        	VoteOnTradePropertiesEvent(t.buyer, t, voteT);
        }

        if (getTpcStage(t.seller, tradeHash) == TPC_STAGE.Voting) {
            require(!tpcMap[t.seller][tradeHash].votersMap[msg.sender]); //check if already voted

            tpcMap[t.seller][tradeHash].votersMap[msg.sender] = true;
            if (tradeHash == voteTradeHash) {
                tpcMap[t.seller][tradeHash].tradeVotesCount++;
            } else {
                listIndex = tpcMap[t.buyer][tradeHash].tradeCandidatesInverseMap[voteTradeHash];
                require(listIndex != 0); //candidate must exist

                tpcMap[t.seller][tradeHash].tradeCandidates[listIndex - 1].votesCount++;
            }

            //emit event
        	VoteOnTradePropertiesEvent(t.seller, t, voteT);
        }
    }

    function tradePropertiesChallengeStage(Trade t, address wallet) public view returns (TPC_STAGE) {
        uint256 tradeHash;

        require(isTradeValid(t));
        require(t.buyer == wallet || t.seller == wallet);
        tradeHash = calculateTradeHash(t);

        return getTpcStage(wallet, tradeHash);
    }

    function tradePropertiesChallengeResult(Trade t, address wallet) public view returns (Trade) {
        Trade memory winnerT;
        uint winnerVotes;
        uint256 tradeHash;
        uint listIndex;

        require(isTradeValid(t));
        require(t.buyer == wallet || t.seller == wallet);

        tradeHash = calculateTradeHash(t);
        require(hasTpc(wallet, tradeHash));
        require(getTpcStage(wallet, tradeHash) == TPC_STAGE.Closed);

        winnerT = t;
        winnerVotes = tpcMap[wallet][tradeHash].tradeVotesCount;
        for (listIndex = 0; listIndex < tpcMap[wallet][tradeHash].tradeCandidates.length; listIndex++) {
            if (tpcMap[wallet][tradeHash].tradeCandidates[listIndex].votesCount > winnerVotes) {
                winnerVotes = tpcMap[wallet][tradeHash].tradeCandidates[listIndex].votesCount;
                winnerT = tradeHashMap[tpcMap[wallet][tradeHash].tradeCandidates[listIndex].tradeHash];
            }
        }

        return winnerT;
    }

    function closeTrade(Trade t, address wallet) public {
        require (isTradeValid(t));
        require (_reserveFundSmartContract != address(0));

        if (msg.sender != owner) {
            wallet = msg.sender;
        }
        require(wallet != address(0));
        require(t.buyer == wallet || t.seller == wallet);
        
        uint256 tradeHash = calculateTradeHash(t);
        require(hasTpc(wallet, tradeHash));
        require(getTpcStage(wallet, tradeHash) == TPC_STAGE.Closed);

        if ( true /* tpc in favor of t && 1 /* ltc in favor of t */ ) {
            
            DexReserveFunds.TransferInfo memory inbound;
            DexReserveFunds.TransferInfo memory outbound;
            DexReserveFunds reserveFunds = DexReserveFunds(_reserveFundSmartContract);

            if (msg.sender != owner) {
                wallet = msg.sender;
            }
            if (t.immediateSettlement) {

                // Seller 
                inbound.tokenAddress = t.token;
                inbound.amount = t.tokenAmount;
                outbound.tokenAddress = address(0);
                outbound.amount = t.etherAmount;
                if (!reserveFunds.twoWayTransfer(t.seller, inbound, outbound)) {
                    revert();
                }

                // Buyer
                inbound.tokenAddress = address(0);
                inbound.amount = t.etherAmount;
                outbound.tokenAddress = t.token;
                outbound.amount = t.tokenAmount;
                if (!reserveFunds.twoWayTransfer(t.buyer, inbound, outbound)) {
                    revert();
                }
                
            } else {

                // do not use Reserve Fund

            }

            //emit event
        	CloseTradeEvent(wallet, t);
        }

        if ( true /* exists TPC candidates*/) {
            //emit event
        	CloseTradePropertiesChallengeEvent(t);
        }

        if ( true /* exists LTC candidates*/ ) {
            //emit event
        	CloseLastTradeChallengeEvent(t);
        }

    }

    //
    // Withdraw functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdraw(uint256 amount, address tokenAddress) public {
        require(msg.sender != owner);
        require(amount > 0);
        if (token == address(0x0)) {
            require(amount <= walletInfoMap[msg.sender].stagedEtherBalance);
            msg.sender.transfer(amount);
            walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);
        } else {
            require(amount <= walletInfoMap[msg.sender].stagedTokenBalance[token]);
            ERC20 token = ERC20(tokenAddress);
            token.transfer(msg.sender, amount);
            walletInfoMap[msg.sender].stagedTokenBalance[token] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[token], amount);
        }

        //emit event
        WithdrawEvent(msg.sender, amount, token);
    }

    //
    // Settlement functions
    // -----------------------------------------------------------------------------------------------------------------
    function startSettlementPropertiesChallenge(Settlement settlement) public {

    }

    function challengeSettlementProperties(Settlement settlement, Settlement candidate) {

    }

    function voteOnSettlementProperties(Settlement s, uint256 opt) {
    }

    function closeSettlement(Settlement s, Trade[] trades) {

    }

    // Fraudulent Trade Handling functions
    // -----------------------------------------------------------------------------------------------------------------
    function challengeFradulentTrade(Trade candidate) {

    }



    //
    // Helper internal functions
    // -----------------------------------------------------------------------------------------------------------------
    function isTradeValid(Trade t) private view returns (bool) {
		bytes memory prefix = "\x19Ethereum Signed Message:\n32";

        if (t.buyer == t.seller) {
            return false;
        }
        if (t.buyer == owner || t.seller == owner) {
            return false;
        }

        //check trade signature. the signature is based on some trade fields
        bytes32 tradeHashWithoutSignature = keccak256(t.buyOrderHash, t.sellOrderHash, t.buyerOrderNonce, t.sellerOrderNonce, t.buyer, t.seller, t.tokenAmount, t.etherAmount, t.token, t.immediateSettlement);
        tradeHashWithoutSignature = keccak256(prefix, tradeHashWithoutSignature);

        if (ecrecover(tradeHashWithoutSignature, t.signature.v, t.signature.r, t.signature.s) != owner)
            return false;

        return true;
    }

    function hasLtc(address wallet) private view returns (bool) {
        return (ltcMap[wallet].disputeEndTimestamp != 0) ? true : false;
    }

    function getLtcStage(address wallet) private view returns (LTC_STAGE) {
        return (ltcMap[wallet].disputeEndTimestamp == 0 || block.timestamp >= ltcMap[wallet].disputeEndTimestamp) ? LTC_STAGE.Closed : LTC_STAGE.Dispute;
    }

    function hasTpc(address wallet, uint tradeHash) private view returns (bool) {
        return (tpcMap[wallet][tradeHash].votingEndTimestamp != 0) ? true : false;
    }

    function getTpcStage(address wallet, uint tradeHash) private view returns (TPC_STAGE) {
        if (tpcMap[wallet][tradeHash].votingEndTimestamp == 0 || block.timestamp >= tpcMap[wallet][tradeHash].votingEndTimestamp)
            return TPC_STAGE.Closed;
        return (block.timestamp < tpcMap[wallet][tradeHash].disputeEndTimestamp) ? TPC_STAGE.Dispute : TPC_STAGE.Voting;
    }

    function calculateTradeHash(Trade t) private pure returns (uint256) {
        return uint256(keccak256(t));
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
