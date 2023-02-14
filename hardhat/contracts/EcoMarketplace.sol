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
        uint256 minBid;
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

    struct StackHelper{
        uint256 saleId;
        uint256 tableId;
        string tablePrefix;
        ExtendedSale order;
    }

    struct BidHelper{
        uint256 saleId;
        uint256 tableId;
        uint256 bidNumber;
        uint256 bidValue;
        string tablePrefix;
        address bidder;
        bytes32 bidHash;
        
    }

    

    ITablelandTables private _tableland;
    address internal ngoAddress;
    string internal version;
    uint256 internal fee;
    uint256 internal ngoBalance;
    uint256 internal ownerBalance;
    uint256 private totalSales = 0;
    uint256 private totalBids = 0;

    uint256 private _sAndRTableId;
    uint256 private _bTableId;
    string private salesAndReceiptsTable;
    string private bidsTable;

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
                " (id integer primary key, tokenContract text, seller text, buyer text, price text, nftId integer, amount integer, timestamp integer, receipt integer);"
            )
        );

        salesAndReceiptsTable = string.concat(
            TABLE_PREFIX,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_sAndRTableId)
        );

        _bTableId = _tableland.createTable(
            address(this),
            /*
            *  CREATE TABLE {prefix}_{chainId} (
            *    id integer primary key,
            *    message text
            *  );
            */
            string.concat(
                "CREATE TABLE ",
                "eco_bid",
                "_",
                Strings.toString(block.chainid),
                // biddable, receipt and isBid are boolean values
                // 0 = false, 1 = true
                " (id integer primary key, saleId integer, value integer, hash text);"
            )
        );

        bidsTable = string.concat(
            "eco_bid",
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_bTableId)
        );

        tables[salesAndReceiptsTable] = _sAndRTableId;
        tables[bidsTable] = _bTableId;
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


        totalBids = totalBids.add(1);

        BidHelper memory bidHelper = BidHelper({
            
            bidValue: bidValue,
            tableId: _bTableId,
            tablePrefix: "eco_bid",
            bidder: msg.sender,
            saleId: orderId,
            bidNumber: totalBids,
            bidHash: bidId
        });

        _insertBid(bidHelper);

        emit BidCreated(tokenContract, seller, msg.sender, bidId, orderId);

    }

    function acceptBid(uint256 bidId) external nonReentrant{
        /*
        didn't write anything. Just let copilot do it's thing
        */
        /*
        require(bids[bidId].value > 0, "Bid does not exist");
        require(bids[bidId].seller == msg.sender, "You are not the seller");
        require(sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.amount > 0, "Sale does not exist");

        uint256 feeValue = bids[bidId].value.mul(fee).div(1e18);
        uint256 ngoFee = feeValue.mul(20).div(100);
        ngoBalance = ngoBalance.add(ngoFee);
        ownerBalance = ownerBalance.add(feeValue - ngoFee);

        uint256 bidValue = bids[bidId].value.sub(feeValue);
        */
    }

    // saleType 0 = erc1155, 1 = erc721
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
        ExtendedSale memory sale = ExtendedSale({
            sale: Sale({
                biddable: minBid > 0,
                minBid: minBid,
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
        sales[tokenContract][msg.sender][totalSales] = sale;

        StackHelper memory stackHelper = StackHelper({
            saleId: totalSales,
            tableId: _sAndRTableId,
            tablePrefix: TABLE_PREFIX,
            order: sale
        });
        insertSale(stackHelper);
        //insertSale(tokenContract, msg.sender, saleType, biddable, totalSales, amount, price, minBid, nftId, _sAndRTableId, "");

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

    //function insertSale(address tokenContract, address seller, uint8 saleType, uint8 biddable, uint256 saleId, uint256 amount, uint256 price, uint256 minBid, uint256 nftId, uint256 tableId, string memory tablePrefix ) private {
    function insertSale(StackHelper memory helper ) private {
       

        _tableland.runSQL(
            address(this),
            helper.tableId,
            SQLHelpers.toInsert(
                helper.tablePrefix, // prefix
                helper.tableId, // table id
                "id,tokenContract,seller, price, nftId, amount, timestamp", // column names
                string.concat(
                    Strings.toString(helper.saleId), // Convert to a string
                    ",",
                    SQLHelpers.quote(Strings.toHexString(helper.order.assetContract)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(helper.order.seller)),
                    ",",
                    SQLHelpers.quote(Strings.toString(helper.order.sale.price)),
                    ",",
                    SQLHelpers.quote(Strings.toString(helper.order.sale.nftId)),
                    ",",
                    SQLHelpers.quote(Strings.toString(helper.order.sale.amount)),
                    ",",
                    SQLHelpers.quote(Strings.toString(block.timestamp))
                	)    
                )
            );
    }

    function deleteSale(StackHelper memory helper ) private {
        _tableland.runSQL(
            address(this),
            helper.tableId,
            SQLHelpers.toDelete(
                helper.tablePrefix, // prefix
                helper.tableId, // table id
                string.concat(
                    "id = ",
                    Strings.toString(helper.saleId) 
                	)    
                )
            );
    }

    function _insertBid(BidHelper memory helper) private {
        _tableland.runSQL(
            address(this),
            helper.tableId,
            SQLHelpers.toInsert(
                helper.tablePrefix, // prefix
                helper.tableId, // table id
                "id,saleId, bidder, value, hash", // column names
                string.concat(
                    Strings.toString(helper.bidNumber), // Convert to a string
                    ",",
                    SQLHelpers.quote(Strings.toString(helper.saleId)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(helper.bidder)),
                    ",",
                    SQLHelpers.quote(Strings.toString(helper.bidValue)),
                    ",",
                    SQLHelpers.quote(string(abi.encodePacked(helper.bidHash))))
                	)    
                );
    }

    function deleteBid(BidHelper memory helper) private {
        _tableland.runSQL(
            address(this),
            helper.tableId,
            SQLHelpers.toDelete(
                helper.tablePrefix, // prefix
                helper.tableId, // table id
                string.concat(
                    "id = ",
                    Strings.toString(helper.bidNumber) 
                	)    
                )
            );
    }

    function getSAndRTableId() public view returns(uint256){
        return _sAndRTableId;
    }

    function getSAndRTableName() public view returns(string memory){
        return salesAndReceiptsTable;
    }
    

}    