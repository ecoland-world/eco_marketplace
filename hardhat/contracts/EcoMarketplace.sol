pragma solidity 0.8.17;


contract EcoMarketPlace{

    struct Bid{
        uint256 value;
        address contact;
        address seller;
        uint256 saleid;
        address bidder;
    }
     struct Sale{
        bool biddable;
        uint256 price;
        uint256 nftid;
        uint256 amount;
     }

    struct ExtendedSale{
        Sale sale;
        uint256 HighestBid;
        address contact;
        address seller;
    }

    struct HighestBid{
        uint256 value;
        uint256 bidid;
    }

    mapping(address => mapping(address => mapping(uint256 => ExtendedSale))) sales;
    mapping(uint256 => Bid) bids;
    mapping(address => bool) admin;

}