// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC1155Mock is ERC1155{
    constructor() ERC1155("https://example.com/api/item/{id}.json"){

    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public{
        _mint(account, id, amount, data);
    }
}