pragma solidity ^0.4.24;

import "../SafeMathUint.sol";
import "../SafeMathInt.sol";

/**
 * @title     SafeMathUIntInt
 * @dev       Math operations with safety checks that throw on error
 * Copyright  (C) 2017-2018 Hubii AS based on Open-Zeppelin's SafeMath library
 */
library SafeMathUintInt {
    int256 constant INT256_MIN = int256((uint256(1) << 255));
    int256 constant INT256_MAX = int256(~((uint256(1) << 255)));
    uint256 constant UINT256_MAX = ~uint256(0);
    uint256 constant UINT256_HALF_MAX = uint256(1) << 255;

    function u_add(uint256 a, int256 b) internal pure returns (uint256) {
        if (b >= 0) {
            return SafeMathUint.add(a, uint256(b));
        }
        uint256 b1 = ~uint256(b) + 1;
        return SafeMathUint.sub(a, b1);
    }

    function u_sub(uint256 a, int256 b) internal pure returns (uint256) {
        if (b >= 0) {
            return SafeMathUint.sub(a, uint256(b));
        }
        uint256 b1 = ~uint256(b) + 1;
        return SafeMathUint.add(a, b1);
    }

    function s_add(int256 a, uint256 b) internal pure returns (int256) {
        if (b < UINT256_HALF_MAX) {
            return SafeMathInt.add(a, int256(b));
        }
        assert(a < 0);
        uint256 a1 = ~uint256(a) + 1;
        assert(b <= 127 + a1);
        return int256(a1 + b);
    }

    function s_sub(int256 a, uint256 b) internal pure returns (int256) {
        if (b < UINT256_HALF_MAX) {
            return SafeMathInt.sub(a, int256(b));
        }
        assert(a >= 0);
        assert(b <= UINT256_HALF_MAX + uint256(a));
        return a - int256(b);
    }
}
