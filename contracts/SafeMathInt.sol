pragma solidity ^0.4.21;

/**
 * @title     SafeMathInt
 * @dev       Math operations with safety checks that throw on error
 * Copyright  (C) 2017-2018 Hubii AS based on Open-Zeppelin's SafeMath library
 */
library SafeMathInt {
    int256 constant INT256_MIN = int256((uint256(1) << 255));
    int256 constant INT256_MAX = int256(~((uint256(1) << 255)));

    function mul(int256 a, int256 b) internal pure returns (int256) {
        int256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(int256 a, int256 b) internal pure returns (int256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        int256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(int256 a, int256 b) internal pure returns (int256) {
        assert(!(a > 0 && b > INT256_MIN - a));  // underflow
        assert(!(a < 0 && b < INT256_MAX - a));  // overflow
        return a - b;
    }

    function add(int256 a, int256 b) internal pure returns (int256) {
        assert(!(a > 0 && b > INT256_MAX - a));  // overflow
        assert(!(a < 0 && b < INT256_MIN - a));  // underflow
        return a + b;
    }
}
