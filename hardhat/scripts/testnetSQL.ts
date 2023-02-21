/* This script is used to deploy the contracts to the testnet and then
 write the contract address to the tableland database.

This script is used on Mumbai testnet.
It deploys two contracts: EcoMarketPlace and an ERC1155 contract.
The EcoMarketPlace contract is deployed with the address of the NGO
and the fee that the NGO will receive for each transaction.

We will query tableland to see if the tables were created.

The ERC1155 contract is deployed with free minting. Anybody can mint assets with it.

Then we should mint some assets with the ERC1155 contract and then
create some listings at the EcoMarketPlace contract.

After that we can query tableLand and see the new table rows.

We will then use the Ecomarketplace contract to bid on the listings.

We will then query tableland to see the new table rows.

We will then use the Ecomarketplace contract to buy a listing.

We will then query tableland to see the new table rows.

*/

import { ethers } from "hardhat";
import hre from "hardhat";
import { ContractFactory } from "ethers";
import { Contract } from "ethers";
import { Signer } from "ethers";
import { Database } from "@tableland/sdk";

import dotetv from "dotenv";

dotetv.config();

const tableLandMumbaiDeploymentAddress = '0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68';
const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet

async function main() {

    // connect to the Mumbai testnet
    
    // account 0 is the account that has a lot of testnet matic
    // account 1 is the NGO
    // account 2 is the buyer
    // account 3 is the seller
    // account 4 is the bidder
    // account 5 is the market place owner
    // console log account 0 balance
    
    // connect to alchemy mumbai api
    const provider = new ethers.providers.AlchemyProvider("maticmum", process.env.MUMBAI_ALCHEMY_KEY);
    console.log("Connected to Alchemy Mumbai API");
    // get the latest block number

    const latestBlockNumber = await provider.getBlockNumber();
    console.log({latestBlockNumber});

    // get account 0 from hre
    const accounts = await hre.ethers.getSigners();
    console.log("Account 0:", accounts[0].address);

    // get account 0 balance
    const account0Balance = await provider.getBalance(accounts[0].address);
    console.log("Account 0 balance:", account0Balance.toString());

    // uncomment to distribute some testnet matic to the other 5 accounts

    /*
    for (let i = 1; i < 6; i++) {
        console.log(`Sending .1 MATIC to account ${i}:`, accounts[i].address)
        const tx = await accounts[0].sendTransaction({
            to: accounts[i].address,
            value: ethers.utils.parseEther("0.1")
        });
        await tx.wait();

    }
    */
   
    console.log(`Succesfully sent .1 MATIC to accounts 1-5`);

    // get the other 5 accounts balance
    for (let i = 1; i < 6; i++) {
        const accountBalance = await provider.getBalance(accounts[i].address);
        console.log(`Account ${i} balance:`, accountBalance.toString());
    }

    
    
    const ngo: Signer = accounts[1];
    const buyer: Signer = accounts[2];
    const seller: Signer = accounts[3];
    const bidder: Signer = accounts[4];
    const marketPlaceOwner: Signer = accounts[5];

    const ngoAddress = await ngo.getAddress();
    const buyerAddress = await buyer.getAddress();
    const sellerAddress = await seller.getAddress();
    const bidderAddress = await bidder.getAddress();
    const marketPlaceOwnerAddress = await marketPlaceOwner.getAddress();
   

    
    // deploy the ERC1155 contract using the marketPlaceOwner account
    const factoryERC1155: ContractFactory = await ethers.getContractFactory("ERC1155Mock");
    // deploy it with account 4
    const erc1155Contract: Contract = await factoryERC1155.connect(accounts[5]).deploy();
    await erc1155Contract.deployed();

    console.log("ERC1155 contract deployed to:", erc1155Contract.address);

    // mint some assets with the ERC1155 contract to the seller
    const tx = await erc1155Contract.connect(accounts[5]).mint(sellerAddress, 1, 1, "0x");
    await tx.wait();
    console.log("Minted 1 asset to seller");


    // deploy the EcoMarketPlace contract
    const factory: ContractFactory = await ethers.getContractFactory("EcoMarketPlace");
    const ecomarketplaceContract: Contract = await factory.connect(accounts[5]).deploy(ngoAddress, ethers.utils.parseEther("0.05"), "1.0.0", tableLandMumbaiDeploymentAddress);
    await ecomarketplaceContract.deployed();
    console.log("EcoMarketPlace contract deployed to:", ecomarketplaceContract.address);

    // get the contract owner
    const contractOwner2 = await ecomarketplaceContract.owner();
    console.log("EcoMarketPlace contract owner:", contractOwner2);

    // write a tableland query to get the new table
    // and then write a new tableland query to get the new table's address
    const tableId = await ecomarketplaceContract.getSAndRTableId();
    console.log({tableId});
    const sAndRTableName = await ecomarketplaceContract.getSAndRTableName();
    console.log({sAndRTableName});  
    /*
    let results = await db.prepare(`SELECT * FROM ${sAndRTableName};`).all();
    console.log(results);
*/
    // approve the EcoMarketPlace contract to transfer the seller's assets
    const approve = await erc1155Contract.connect(seller).setApprovalForAll(ecomarketplaceContract.address, true);
    await approve.wait();
    console.log("Seller approved EcoMarketPlace contract to transfer assets");
    // create a listing
    const listing = await ecomarketplaceContract.connect(seller).createSale(
        erc1155Contract.address,
        1,
        1,
        ethers.utils.parseEther("0.01"),
        ethers.utils.parseEther("0.008"),
        0
    );
    await listing.wait();
    console.log("Listing created");
    setTimeout(function(){
        console.log(`Waiting 30 seconds.`)
    }, 30000)

    let salesAndReceiptsTable = await db.prepare(`SELECT * FROM ${sAndRTableName};`).all();
    console.log({salesAndReceiptsTable});
    
    
    // create a bid
    const bid = await ecomarketplaceContract.connect(bidder).bid(
        erc1155Contract.address,
        sellerAddress,
        1,
        {value: ethers.utils.parseEther("0.009"), gasLimit: 1000000}
    );

    await bid.wait();
    console.log("Bid created");
    setTimeout(function(){
        console.log(`Waiting 10 seconds.`)
    }, 10000)

    const bidTablesName = await ecomarketplaceContract.getBidsTableName();
    console.log({bidTablesName});
    
    let bidsTable = await db.prepare(`SELECT * FROM ${bidTablesName};`).all();
    console.log({bidsTable});

    // buy a listing
    const buy = await ecomarketplaceContract.connect(buyer).buy(
        erc1155Contract.address,
        sellerAddress,
        1,
        {value: ethers.utils.parseEther("0.011"), gasLimit: 3000000}
    );
    await buy.wait();
    console.log("Listing bought");
    setTimeout(function(){
        console.log(`Waiting 10 seconds.`)
    }, 10000)

    salesAndReceiptsTable = await db.prepare(`SELECT * FROM ${sAndRTableName};`).all();
    console.log({salesAndReceiptsTable});
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});






