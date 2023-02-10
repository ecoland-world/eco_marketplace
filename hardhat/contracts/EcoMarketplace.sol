// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";


contract EcoMarketPlace is Ownable, ReentrancyGuard, ERC721Holder {
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

    ITablelandTables private _tableland;
    address internal ngoAddress;
    string internal version;
    uint256 internal fee;
    uint256 internal ngoBalance;
    uint256 internal ownerBalance;
    uint256 private totalSales = 0;

    uint256 private _sAndRTableId;
    string private salesAndReceiptsTable;

    string private constant TABLE_PREFIX = "eco_mkt";

    mapping(address => mapping(address => mapping(uint256 => ExtendedSale))) public sales;
    mapping(bytes32 => Bid) public bids;
    mapping(address => bool) public admin;
    mapping(string => uint256) public tables;

    event BidCreated(address, address, address, bytes32, uint256);
    event SaleCreated(address, address, uint256, uint8);
    event SaleCanceled(address, address, uint256);

    constructor(address ngoAddress_, uint256 fee_, string memory version_, address registry){
        
        ngoAddress = ngoAddress_;
        admin[msg.sender] = true;
        version = version_;
        fee = fee_;
        _tableland = ITablelandTables(registry);

        _sAndRTableId = _tableland.createTable(
            address(this),
            /*
            *  CREATE TABLE {prefix}_{chainId} (
            *    id integer primary key,
            *    message text
            *  );
            */
            string.concat(
                "CREATE TABLE ",
                TABLE_PREFIX,
                "_",
                Strings.toString(block.chainid),
                // biddable, receipt and isBid are boolean values
                // 0 = false, 1 = true
                " (id integer primary key, tokenContract text, seller text, buyer text, price text, nftId integer, amount integer, timestamp integer, biddable integer, receipt integer, isBid integer);"
            )
        );

        salesAndReceiptsTable = string.concat(
            TABLE_PREFIX,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_sAndRTableId)
        );

        tables[salesAndReceiptsTable] = _sAndRTableId;
        
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
        /*
        require(tokenContract != address(0), "Address is non-existent");
        require(amount > 0, "Amount must be greater than 0");
        require(_exist(nftId), "NFT doesnt exist");
        require(msg.value >= price, "Cant proceed due to lack of funds");
        */
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
    // this function is too big. need to refactor it
    // to stop stack too deep error
    function createSale(address tokenContract, uint256 amount, uint256 nftId, uint256 price, uint256 minBid, uint8 saleType ) external{
        require(amount > 0, "Amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        uint8 biddable = 0;
        if (minBid > 0){
            require(minBid < price, "Min bid must be less than price");
            biddable = 1;
        }
        if (saleType == 0){
            require(IERC1155(tokenContract).balanceOf(msg.sender, nftId) >= amount, "You do not have enough NFTs");
            bool isApproved = IERC1155(tokenContract).isApprovedForAll(msg.sender, address(this));
            require(isApproved, "You must approve this contract to transfer your NFTs");
        }
        totalSales = totalSales.add(1);
        /*else if (saleType == 1){
            require(IERC721(tokenContract).ownerOf(nftId) == msg.sender, "You are not the owner of this NFT");
            IERC721(tokenContract).approve(address(this), nftId);
        }*/

        sales[tokenContract][msg.sender][totalSales] = ExtendedSale({
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

        _tableland.runSQL(
            address(this),
            _sAndRTableId,
            SQLHelpers.toInsert(
                TABLE_PREFIX, // prefix
                _sAndRTableId, // table id
                "id,tokenContract,seller, buyer, price, nftId, amount, timestamp, biddable, receipt, isBid", // column names
                string.concat(
                    Strings.toString(totalSales), // Convert to a string
                    ",",
                    SQLHelpers.quote(Strings.toHexString(tokenContract)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(msg.sender)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(address(0))),
                    ",",
                    SQLHelpers.quote(Strings.toString(price)),
                    ",",
                    SQLHelpers.quote(Strings.toString(nftId)),
                    ",",
                    SQLHelpers.quote(Strings.toString(amount)),
                    ",",
                    SQLHelpers.quote(Strings.toString(block.timestamp)),
                    ",",
                    SQLHelpers.quote(Strings.toString(biddable)),
                    ",",
                    SQLHelpers.quote(Strings.toString(0)),
                    ",",
                    SQLHelpers.quote(Strings.toString(0))
                	)    
                )
            );

        emit SaleCreated(tokenContract, msg.sender, block.timestamp, saleType);

    }

    function getOneSale(address tokenContract, address seller, uint256 saleId) public view returns(ExtendedSale memory){
        return sales[tokenContract][seller][saleId];


    }

    function cancelSale(address tokenContract, address seller, uint256 saleId ) external {
        require(sales[tokenContract][seller][saleId].sale.amount > 0, "Sale does not exist");
        require(sales[tokenContract][seller][saleId].seller == msg.sender, "Caller not the seller");

        sales[tokenContract][seller][saleId].sale.amount = 0;

        _tableland.runSQL(
            address(this),
            _sAndRTableId,
            SQLHelpers.toDelete(
                TABLE_PREFIX, // prefix
                _sAndRTableId, // table id
                string.concat(
                    "id = ",
                    Strings.toString(saleId) 
                	)    
                )
            );


        emit SaleCanceled(tokenContract, seller, saleId);
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