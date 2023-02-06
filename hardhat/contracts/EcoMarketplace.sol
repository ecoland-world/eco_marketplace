// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EcoMarketPlace is Ownable, ReentrancyGuard{

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

    address internal ngoAddress;
    string internal version;
    uint256 internal fee;
    uint256 internal ngoBalance;
    uint256 internal ownerBalance;

    mapping(address => mapping(address => mapping(uint256 => ExtendedSale))) public sales;
    mapping(uint256 => Bid) public bids;
    mapping(address => bool) public admin;

    constructor(address ngoAddress_, uint256 fee_, string memory version_){
        
        ngoAddress = ngoAddress_;
        admin[msg.sender] = true;
        version = version_;
        fee = fee_;
    }

    modifier onlyAdmin(){
        require(admin[msg.sender], "Admin only");
        _;
    }

    function setFee(uint256 _fee) external onlyAdmin{
        fee = _fee;
    }

    function setNgoAddress(address newNgo) external onlyAdmin{
        ngoAddress = newNgo;
    }

    function addAdmin(address newAdmin) external onlyOwner{
        admin[newAdmin] = true;
    }

    function removeAdmin(address oldAdmin) external onlyOwner{
        admin[oldAdmin] = false;
    }

    function setVersion(string calldata _version) external onlyAdmin{
        version = _version;
    }

    function getSale() public view returns(ExtendedSale memory){
        //TODO
    }

    function getBid() public view returns(Bid memory){
        //TODO
    }

    function getHighestBid() public view returns(HighestBid memory){
        //TODO
    }

    function getFee() public view returns(uint256){
        return fee;
    }

    function getNgoAddress() public view returns(address){
        return ngoAddress;
    }

    function isAdmin(address adminAddress) public view returns(bool){
        return admin[adminAddress];
    }

    function getVersion() public view returns(string memory){
        return version;
    }

    function getOwner() public view returns(address){
        //TODO
    }

    function getOwnerBalance() public view returns(uint256){
        //TODO
    }

    function getNGOBalance() public view returns(uint256){
        //TODO
    }

    function buy() external payable nonReentrant{
        //TODO
    }

    function bid() external payable nonReentrant{
        //TODO
    }

    function acceptBid() external nonReentrant{
        //TODO
    }

    function createSale() external{
        //TODO
    }

    function cancelSale() external {
        //TODO
    }

    function cancelBid() external nonReentrant{
        //TODO
    }

    function withdraw() external nonReentrant{
        //TODO
    }

    function withdrawNgo() external nonReentrant{
        //TODO
    }

    function withdrawOwner() external nonReentrant{
        //TODO
    }

}    