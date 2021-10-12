// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract Dummy {
    uint256 storedData;

    function set(uint256 x) public {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        returns (bool)
    {
        return interfaceId == 0x5b5e139f;
    }
}
