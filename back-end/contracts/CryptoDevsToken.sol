// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevsNFT.sol";

interface ICryptoDevsToken {
    function mint(uint256 amount) external payable;
    function claim() external;
    receive() external payable;
    fallback() external payable;
}

contract CryptoDevsToken is ICryptoDevsToken, ERC20, Ownable {

    ICryptoDevsNFT private cryptoDevsNFT;

    uint256 public constant ERC20_TOKEN_PRICE = 0.001 ether;
    uint256 public constant ERC20_TOKENS_PER_NFT = 10 * 10**18;
    uint256 public constant ERC20_MAX_TOTAL_SUPPLY = 10000 * 10**18;

    mapping(uint256 => bool) public erc721_tokenIds_claimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsContract);
    }

    /**
    * @dev Mints `no_Of_ERC20_tokens_requested` number of CryptoDevTokens
    * Requirements:
    * - `msg.value` should be equal or greater than the ERC20_TOKEN_PRICE * no_Of_ERC20_tokens_requested
    */
    function mint(uint256 no_Of_ERC20_tokens_requested) external payable {
        uint256 requiredAmount = ERC20_TOKEN_PRICE * no_Of_ERC20_tokens_requested;
        require(msg.value >= requiredAmount, "Ether sent is incorrect");

        uint256 requested_ERC20_supply = no_Of_ERC20_tokens_requested * 10**18;
        require(ERC20.totalSupply() + requested_ERC20_supply <= ERC20_MAX_TOTAL_SUPPLY, "Exceeds the max total supply available.");

        ERC20._mint(msg.sender, requested_ERC20_supply);
    }

    /**
    * @dev Mints tokens based on the number of NFT's held by the sender
    * Requirements:
    * balance of Crypto Dev NFT's owned by the sender should be greater than 0
    * Tokens should have not been claimed for all the NFTs owned by the sender
    */
    function claim() external {
        uint256 owners_balanceOf_ERC721_tokens = cryptoDevsNFT.balanceOf(msg.sender);
        require(owners_balanceOf_ERC721_tokens > 0, "You dont own any Crypto Dev NFT's");

        uint256 no_of_unclaimed_ERC721_tokenIds = 0;

        for (uint256 tokenIndex = 0; tokenIndex < owners_balanceOf_ERC721_tokens; tokenIndex++) {
            uint256 owners_ERC721_TokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, tokenIndex);

        if (!erc721_tokenIds_claimed[owners_ERC721_TokenId]) {
                no_of_unclaimed_ERC721_tokenIds += 1;
                erc721_tokenIds_claimed[owners_ERC721_TokenId] = true;
            }
        }

        require(no_of_unclaimed_ERC721_tokenIds > 0, "You have already claimed all the tokens");

        ERC20._mint(msg.sender, no_of_unclaimed_ERC721_tokenIds * ERC20_TOKENS_PER_NFT);
    }

    receive() external payable {}

    fallback() external payable {}
}