// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Invoice1155 is ERC1155URIStorage, Ownable {
    uint256 public currentTokenId;

    constructor() ERC1155("") Ownable(msg.sender) {}

   function mint(address to, uint256 amount, string memory tokenURI) public onlyOwner returns (uint256) {
    uint256 newTokenId = currentTokenId;
    _mint(to, newTokenId, amount, "");
    _setURI(newTokenId, tokenURI);
    currentTokenId += 1;
    return newTokenId;
    }
}
