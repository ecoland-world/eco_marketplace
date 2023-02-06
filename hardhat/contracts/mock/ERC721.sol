// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract ERC721Mock is ERC721{
    constructor() ERC721("ERC721Mock", "ERC721Mock"){
        
    }

    function mint(address account, uint256 id) public{
        _mint(account, id);
    }
}