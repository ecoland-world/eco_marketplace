// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract EcoMarketPlace is Ownable, ReentrancyGuard{
    using SafeMath for uint256;

    struct Bid{
        uint256 value;
        address tokenContract;
        address seller;
        uint256 saleId;
        address bidder;
    }
     struct Sale{
        bool biddable;
        uint256 price;
        uint256 nftId;
        uint256 amount;
     }

    struct ExtendedSale{
        Sale sale;
        HighestBid highestBid;
        address assetContract;
        address seller;
    }

    struct HighestBid{
        uint256 value;
        bytes32 bidId;
    }

    address internal ngoAddress;
    string internal version;
    uint256 internal fee;
    uint256 internal ngoBalance;
    uint256 internal ownerBalance;

    mapping(address => mapping(address => mapping(uint256 => ExtendedSale))) public sales;
    mapping(bytes32 => Bid) public bids;
    mapping(address => bool) public admin;

    event BidCreated(address, address, address, bytes32, uint256);
    event SaleCreated(address, address, uint256, uint8);
    event NewSale(address tokenContract, uint256 amount, uint256 price, uint256 nftId);

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

    function getBid(bytes32 bidId) public view returns(Bid memory){
        return bids[bidId];
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

    function buy(address tokenContract, uint256 amount, uint256 nftId, uint256 price) external payable nonReentrant{
        require(tokenContract != address(0), "Address is non-existent");
        require(amount > 0, "Amount must be greater than 0");
        require(_exist(nftId), "NFT doesnt exist");
        require(msg.value >= price, "Cant proceed due to lack of funds");

        address seller = ownerOf(nftId);
        _transfer(seller, msg.sender, nftId);

        // sql operations
        // contract state update
        emit NewSale(msg.sender, msg.value , nftId, price);
        

    }

    function bid(address tokenContract, address seller, uint256 orderId) external payable nonReentrant{
        require (msg.value > 0, "Bid must be greater than 0");
        require(sales[tokenContract][seller][orderId].sale.biddable, "Sale is not biddable");
        require(sales[tokenContract][seller][orderId].sale.amount > 0, "Sale does not exist");
        require(msg.value < sales[tokenContract][seller][orderId].sale.price, "Bid must be less than sale price");
        
        uint256 feeValue = msg.value.mul(fee).div(1e18);
        uint256 ngoFee = feeValue.mul(20).div(100);
        ngoBalance = ngoBalance.add(ngoFee);
        ownerBalance = ownerBalance.add(feeValue - ngoFee);

        uint256 bidValue = msg.value.sub(feeValue);

        bytes32 bidId = keccak256(abi.encodePacked(block.timestamp, msg.sender, orderId));


        bids[bidId] = Bid({
            value: bidValue,
            tokenContract: tokenContract,
            seller: seller,
            saleId: orderId,
            bidder: msg.sender
        }); 

        if (bidValue > sales[tokenContract][seller][orderId].highestBid.value){
            sales[tokenContract][seller][orderId].highestBid.value = bidValue;
            sales[tokenContract][seller][orderId].highestBid.bidId = bidId;
        }

        emit BidCreated(tokenContract, seller, msg.sender, bidId, orderId);

    }

    function acceptBid() external nonReentrant{
        //TODO
    }

    // saleType 0 = erc1155, 1 = erc721
    function createSale(address tokenContract, uint256 amount, uint256 nftId, uint256 price, uint256 minBid, uint8 saleType ) external{
        require(amount > 0, "Amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        if (minBid > 0){
            require(minBid < price, "Min bid must be less than price");
        }
        if (saleType == 0){
            require(IERC1155(tokenContract).balanceOf(msg.sender, nftId) >= amount, "You do not have enough NFTs");
            bool isApproved = IERC1155(tokenContract).isApprovedForAll(msg.sender, address(this));
            require(isApproved, "You must approve this contract to transfer your NFTs");
        }
        /*else if (saleType == 1){
            require(IERC721(tokenContract).ownerOf(nftId) == msg.sender, "You are not the owner of this NFT");
            IERC721(tokenContract).approve(address(this), nftId);
        }*/
        sales[tokenContract][msg.sender][block.timestamp] = ExtendedSale({
            sale: Sale({
                biddable: minBid > 0,
                price: price,
                nftId: nftId,
                amount: amount
            }),
            highestBid: HighestBid({
                value: 0,
                bidId: 0
            }),
            assetContract: tokenContract,
            seller: msg.sender
        });

        emit SaleCreated(tokenContract, msg.sender, block.timestamp, saleType);

    }

    function getOneSale(address tokenContract, address seller, uint256 saleId) public view returns(ExtendedSale memory){
        return sales[tokenContract][seller][saleId];


    }

    function cancelSale(address tokenContract, address seller, uint256 saleId) external {
        require(sales[tokenContract][seller][saleId].sale.amount > 0, "Sale does not exist");
        require(sales[tokenContract][seller][saleId].seller == msg.sender, "Caller not the seller");

        sales[tokenContract][seller][saleId].sale.amount = 0;
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