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
    event BidCanceled(address, address, address, uint256, uint256, bytes32);
    event SaleCreated(address, address, uint256, uint8);
    event SaleCanceled(address, address, uint256);
    event Purchase(address, address, address, uint256, uint256);

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
                " (id integer primary key, saleId integer, bidder text, value integer, hash blob);"
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
        
        require(ngoAddress != address(0), "Ngo address not set");
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

    function getSale(address tokenContract, address seller, uint256 saleId) public view returns(ExtendedSale memory){
        return sales[tokenContract][seller][saleId];
    }

    function getBid(bytes32 bidId) public view returns(Bid memory){
        return bids[bidId];
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
        return owner();
        
    }

    function getOwnerBalance() public view returns(uint256){
        return ownerBalance;
    }

    function getNGOBalance() public view returns(uint256){
        return ngoBalance;
    }

    function buy(address tokenContract, address seller, uint256 orderId) external payable nonReentrant{
        require(sales[tokenContract][seller][orderId].sale.amount > 0, "Sale does not exist");
        require(msg.sender != seller, "Buyer = seller");
        
        uint256 feeValue = msg.value.mul(fee).div(1e18);
        uint256 ngoFee = feeValue.mul(20).div(100);
        ngoBalance = ngoBalance.add(ngoFee);
        ownerBalance = ownerBalance.add(feeValue - ngoFee);

        uint256 paymentValue = (msg.value).sub(feeValue);
        require (paymentValue > sales[tokenContract][seller][orderId].sale.price, "Payment must be greater than sale price");

        
        IERC1155(tokenContract).safeTransferFrom(seller, msg.sender, sales[tokenContract][seller][orderId].sale.nftId, sales[tokenContract][seller][orderId].sale.amount, "");
        

        sales[tokenContract][seller][orderId].sale.amount = 0;
        sales[tokenContract][seller][orderId].sale.price = 0;
        sales[tokenContract][seller][orderId].sale.biddable = false;
        sales[tokenContract][seller][orderId].sale.nftId = 0;

        require(payable(seller).send(paymentValue));
        

        _updateSale(msg.sender, orderId, _sAndRTableId);

        

        emit Purchase(tokenContract, seller, msg.sender, orderId, paymentValue);

        
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


    function acceptBid(bytes32 bidId) public nonReentrant{
        
        require(bids[bidId].value > 0, "Bid does not exist");
        require(bids[bidId].seller == msg.sender, "Not the seller");
        require(sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.amount > 0, "Sale does not exist");
        require(sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.biddable, "Sale is not biddable");

        uint256 bidValue = bids[bidId].value;

        IERC1155(bids[bidId].tokenContract).safeTransferFrom(bids[bidId].seller, bids[bidId].bidder, sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.nftId, sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.amount, "");

        sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.amount = 0;
        sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.price = 0;
        sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.biddable = false;
        sales[bids[bidId].tokenContract][bids[bidId].seller][bids[bidId].saleId].sale.nftId = 0;
        
        address payable _seller = payable(bids[bidId].seller);
        require(_seller.send(bidValue));

        _updateSale(msg.sender, bids[bidId].saleId, _sAndRTableId);

        emit Purchase(bids[bidId].tokenContract, bids[bidId].seller, bids[bidId].bidder, bids[bidId].saleId, bidValue);
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

    function cancelBid(bytes32 bidId) external nonReentrant{
        
        
        // check if msg sender is bidder
        require(bids[bidId].bidder == msg.sender, "Caller not the bidder");
        // check if bid is active
        require(bids[bidId].saleId!= 0, "Bid is not active");

        // change bid status to inactive
        bids[bidId].saleId = 0;
        bids[bidId].value = 0;

        // transfer bid value to bidder
        address payable _bidder = payable(bids[bidId].bidder);
        require(_bidder.send(bids[bidId].value));

        

        deleteBid(bidId);

        // emit event
        emit BidCanceled(bids[bidId].tokenContract, bids[bidId].seller, bids[bidId].bidder, bids[bidId].saleId, bids[bidId].value, bidId);

    }

    function withdrawNgo() external nonReentrant{
        // send all ngo funds to ngo address
        require(msg.sender == owner(), "Caller not the owner");
        require(ngoAddress != address(0), "Ngo address not set");
        uint256 valueToSend = ngoBalance;
        ngoBalance = 0;
        require(payable(ngoAddress).send(valueToSend));
    }

    function withdrawOwner() external nonReentrant{
        // send all owner funds to owner address
        require(msg.sender == owner(), "Caller not the owner");
        uint256 valueToSend = ownerBalance;
        ownerBalance = 0;
        require(payable(owner()).send(valueToSend));
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

    function _updateSale(address buyer , uint256 saleId, uint256 tableId) private {
        
          _tableland.runSQL(
            address(this),
            tableId,
            SQLHelpers.toUpdate(
                TABLE_PREFIX, // prefix
                tableId, // table id
                string.concat(
                    "receipt = ",
                    SQLHelpers.quote(Strings.toString(1)),
                    ", buyer = ",
                    SQLHelpers.quote(Strings.toHexString(buyer)),
                    ", timestamp = ",
                    SQLHelpers.quote(Strings.toString(block.timestamp))
                	),
                string.concat(
                    "id = ",
                    SQLHelpers.quote(Strings.toString(saleId))
                	)    
                )
            );
    }

    function _insertBid(BidHelper memory helper) private {
        
        string memory converted = bytes32ToString(helper.bidHash);

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
                    SQLHelpers.quote(converted))
                	)    
                );
    }

    function deleteBid(bytes32 bidHash) private {
        string memory converted = bytes32ToString(bidHash);
    
        _tableland.runSQL(
            address(this),
            _bTableId,
            SQLHelpers.toDelete(
                "eco_bid", // prefix
                _bTableId, // table id
                string.concat(
                    "hash = ",
                    SQLHelpers.quote(converted)
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

    function getBidsTableName() public view returns(string memory){
        return bidsTable;
    }

   function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
    

}    