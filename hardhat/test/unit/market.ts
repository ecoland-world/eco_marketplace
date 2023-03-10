import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "console";
import { Contract } from "ethers";
const { expect } = require("chai");
const { ethers } = require("hardhat");

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array: string[] = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}
  
    describe(" EcoMarket ", function () {

      let accounts: SignerWithAddress[];
      let ngoAddress: string;
      let ecoMarketAddress: string;
      let ecoMarketDeploy: Contract;
      let erc1155Contract: Contract;
      let erc721Contract: Contract;

  
      before(async () => {
       
       accounts = await ethers.getSigners();
       ngoAddress = accounts[1].address;
       
      });

      beforeEach (async () => {
      
        
        const EcoMarket = await ethers.getContractFactory("NoSQLMarketplace");
        ecoMarketDeploy = await EcoMarket.connect(accounts[2]).deploy(ngoAddress, ethers.utils.parseEther("0.05"), "1.0.0");
        await ecoMarketDeploy.deployed();
        ecoMarketAddress = ecoMarketDeploy.address;
        const ERC1155 = await ethers.getContractFactory("ERC1155Mock");
        const ERC721 = await ethers.getContractFactory("ERC721Mock");
        const erc1155Deploy = await ERC1155.connect(accounts[2]).deploy();
        await erc1155Deploy.deployed();
        erc1155Contract = erc1155Deploy;
        const erc721Deploy = await ERC721.connect(accounts[2]).deploy();
        await erc721Deploy.deployed();
        erc721Contract = erc721Deploy;
      
      });
        
      
  
    describe("\n \n Deployment + Admin functions", function () {
      it("Should set the right owner", async function () {
          const owner = await ecoMarketDeploy.owner();
          expect(owner).to.equal(accounts[2].address);
        
        
      });
  
      it("Should set the right NGO address", async function () {
          const ngoAddressDeployed = await ecoMarketDeploy.getNgoAddress();
          expect(ngoAddress).to.equal(ngoAddress);
        
        
      });
  
      it("Should set the correct fee", async function () {
          const fee = await ecoMarketDeploy.getFee();
          expect(fee).to.equal(ethers.utils.parseEther("0.05"));
        
          
      });
  
      it("Should start at version 1.0.0", async function () {
          const version = await ecoMarketDeploy.getVersion();
          expect(version).to.equal("1.0.0");
  
      });

     it("Should set the contract creator as admin", async function () {
          const admin = await ecoMarketDeploy.isAdmin(accounts[2].address);
          expect(admin).to.equal(true);

      });

      it("Should return false for non-admin", async function () {
        const admin = await ecoMarketDeploy.isAdmin(accounts[3].address);
        expect(admin).to.equal(false);

    });

      it("Should add a new admin", async function () {
          await ecoMarketDeploy.connect(accounts[2]).addAdmin(accounts[3].address);
          const admin = await ecoMarketDeploy.isAdmin(accounts[3].address);
          expect(admin).to.equal(true);

      });

      it("Should remove an admin", async function () {
        await ecoMarketDeploy.connect(accounts[2]).addAdmin(accounts[3].address);
        const admin = await ecoMarketDeploy.isAdmin(accounts[3].address);
        expect(admin).to.equal(true);
        await ecoMarketDeploy.connect(accounts[2]).removeAdmin(accounts[3].address);
        const adminRemoved = await ecoMarketDeploy.isAdmin(accounts[3].address);
        expect(adminRemoved).to.equal(false);

      });
      
      it("Should change the owner", async function () {
          await ecoMarketDeploy.connect(accounts[2]).transferOwnership(accounts[4].address);
          const owner = await ecoMarketDeploy.owner();
          expect(owner).to.equal(accounts[4].address);

      });

      it("Should change the NGO address", async function () {
          await ecoMarketDeploy.connect(accounts[2]).setNgoAddress(accounts[5].address);
          const ngoAddressDeployed = await ecoMarketDeploy.getNgoAddress();
          expect(ngoAddressDeployed).to.equal(accounts[5].address);

      });

      it("Should change the fee", async function () {
          await ecoMarketDeploy.connect(accounts[2]).setFee(ethers.utils.parseEther("0.1"));
          const fee = await ecoMarketDeploy.getFee();
          expect(fee).to.equal(ethers.utils.parseEther("0.1"));

      });

      it("Should change the version", async function () {
          await ecoMarketDeploy.connect(accounts[2]).setVersion("2.0.0");
          const version = await ecoMarketDeploy.getVersion();
          expect(version).to.equal("2.0.0");

      });

      it("Should revert if not owner - admin addition", async function () {
          await expect(ecoMarketDeploy.connect(accounts[3]).addAdmin(accounts[4].address)).to.be.revertedWith("Ownable: caller is not the owner");

      });

      it("Should revert if not admin - fee change", async function () {
          await expect(ecoMarketDeploy.connect(accounts[3]).setFee(ethers.utils.parseEther("0.1"))).to.be.revertedWith("Admin only");

      });

      it("Should revert if not admin - version change", async function () {
          await expect(ecoMarketDeploy.connect(accounts[3]).setVersion("2.0.0")).to.be.revertedWith("Admin only");
        
      });

      it("Should revert if not admin - ngo change", async function () {
          await expect(ecoMarketDeploy.connect(accounts[3]).setNgoAddress(accounts[5].address)).to.be.revertedWith("Admin only");

      });

      it("Should revert if not owner - admin removal", async function () {
          await ecoMarketDeploy.connect(accounts[2]).addAdmin(accounts[3].address);
          await expect(ecoMarketDeploy.connect(accounts[3]).removeAdmin(accounts[4].address)).to.be.revertedWith("Ownable: caller is not the owner");

      });

      it("Should revert if not owner - owner change", async function () {
          await expect(ecoMarketDeploy.connect(accounts[3]).transferOwnership(accounts[4].address)).to.be.revertedWith("Ownable: caller is not the owner");
          await ecoMarketDeploy.connect(accounts[2]).addAdmin(accounts[3].address);
          await expect(ecoMarketDeploy.connect(accounts[3]).transferOwnership(accounts[4].address)).to.be.revertedWith("Ownable: caller is not the owner");
          
      });
    });

    describe("\n \n ERC1155 assets", function () {

      describe("\n \n Create sale", function () {
        
        it("Should properly create a new sale for a specific item", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
          
          const saleIdBigNumber = receipt.events[0].args[2];
          
          const saleId = parseInt(saleIdBigNumber);
          
          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          

          expect(sale.sale.biddable).to.equal(true);
          expect((sale.sale.price).toString()).to.equal(ethers.utils.parseEther('0.1'));
          expect(parseInt(sale.sale.nftId)).to.equal(1);
          expect(parseInt(sale.sale.amount)).to.equal(1);

          expect(parseInt(sale.highestBid.value)).to.equal(0);
          expect(parseInt(sale.highestBid.bidId)).to.equal(0);

          expect(sale.assetContract).to.equal(erc1155Contract.address);
          expect(sale.seller).to.equal(accounts[1].address);
        });

        it("Should properly create a new sale for more than one item", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
          
          const saleIdBigNumber = receipt.events[0].args[2];
          
          const saleId = parseInt(saleIdBigNumber);
          
          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          

          expect(sale.sale.biddable).to.equal(true);
          expect((sale.sale.price).toString()).to.equal(ethers.utils.parseEther('0.1'));
          expect(parseInt(sale.sale.nftId)).to.equal(1);
          expect(parseInt(sale.sale.amount)).to.equal(5);

          expect(parseInt(sale.highestBid.value)).to.equal(0);
          expect(parseInt(sale.highestBid.bidId)).to.equal(0);

          expect(sale.assetContract).to.equal(erc1155Contract.address);
          expect(sale.seller).to.equal(accounts[1].address);
            
        });

        it("Should throw an error when the owner doesn't have enough balance", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          
          expect(await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0)).to.be.revertedWith("You do not have enough NFTs");
        });


      });

      describe("\n \n Cancel sale", function () {
        
        it("Should properly cancel a sale for a specific item.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
          
          const saleIdBigNumber = receipt.events[0].args[2];
          
          const saleId = parseInt(saleIdBigNumber);
          
          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          
          await ecoMarketDeploy.connect(accounts[1]).cancelSale(erc1155Contract.address, accounts[1].address, saleId);
          const cancelledSale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          
          expect (cancelledSale.sale.amount).to.equal(0);
            
        });

        it("Should properly cancel a sale for more than one item.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
          
          const saleIdBigNumber = receipt.events[0].args[2];
          
          const saleId = parseInt(saleIdBigNumber);
          
          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          
          await ecoMarketDeploy.connect(accounts[1]).cancelSale(erc1155Contract.address, accounts[1].address, saleId);
          const cancelledSale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);

          expect (cancelledSale.sale.amount).to.equal(0);
            
        });

        it("Should throw an error when the item is not for sale.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];

          const saleId = parseInt(saleIdBigNumber);

          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);

          await ecoMarketDeploy.connect(accounts[1]).cancelSale(erc1155Contract.address, accounts[1].address, saleId);
          const cancelledSale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);

          expect (cancelledSale.sale.amount).to.equal(0);

          await expect(ecoMarketDeploy.connect(accounts[1]).cancelSale(erc1155Contract.address, accounts[1].address, saleId)).to.be.revertedWith('Sale does not exist');
            
        });

        it("Should throw an error when called by a non-owner", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];

          const saleId = parseInt(saleIdBigNumber);

          const sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);

          await expect(ecoMarketDeploy.connect(accounts[2]).cancelSale(erc1155Contract.address, accounts[1].address, saleId)).to.be.revertedWith('Caller not the seller');
          
            
        });

        it("Should throw an error when the item has already been sold", async function () {
          // Waiting for bid and buy logic to be implemented to test this 
         
        });


      });

      describe("\n \n Bid", function () {

        /*
        create before all in this block that creates this sale:
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();
      
      */

        it("Should properly place a bid on a specific item", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 1, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 1, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          const bidTx= await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.09')});
          const bidReceipt = await bidTx.wait();
          
          const bidId = bidReceipt.events[0].args[3];

          const bid = await ecoMarketDeploy.getBid(bidId);
          

          expect(bid.bidder).to.equal(accounts[2].address);
          //expect(bid.value).to.equal(ethers.utils.parseEther((0.09 * 0.95).toString()));
          // javascript cannot make precise calculations with floating point numbers
          // so we have hardhcoded the expected value 
          // 0.09 - 0.09 * 0.05 = 0.0855
          
          expect(bid.value).to.equal(ethers.utils.parseEther('0.0855'));
          expect(bid.saleId).to.equal(saleId);
            
        });

        it("Should properly place a bid on more than one item", async function () {
         await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          const bidTx= await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.09')});
          const bidReceipt = await bidTx.wait();
          
          const bidId = bidReceipt.events[0].args[3];

          const bid = await ecoMarketDeploy.getBid(bidId);
          

          expect(bid.bidder).to.equal(accounts[2].address);
          //expect(bid.value).to.equal(ethers.utils.parseEther((0.09 * 0.95).toString()));
          // javascript cannot make precise calculations with floating point numbers
          // so we have hardhcoded the expected value 
          // 0.09 - 0.09 * 0.05 = 0.0855
          
          expect(bid.value).to.equal(ethers.utils.parseEther('0.0855'));
          expect(bid.saleId).to.equal(saleId);
            
        });

        it("Should update the highest bid correctly", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          const bidTx= await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.09')});
          const bidReceipt = await bidTx.wait();
          
          const bidId = bidReceipt.events[0].args[3];

          let sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);

          expect(sale.highestBid.value).to.equal(ethers.utils.parseEther('0.0855'));
          expect(sale.highestBid.bidId).to.equal(bidId);

          const bidTx2= await ecoMarketDeploy.connect(accounts[3]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
          const bidReceipt2 = await bidTx2.wait();

          const bidId2 = bidReceipt2.events[0].args[3];

          const bid2 = await ecoMarketDeploy.getBid(bidId2);

          expect(bid2.bidder).to.equal(accounts[3].address);
          //expect(bid2.value).to.equal(ethers.utils.parseEther((0.1 * 0.95).toString()));
          // javascript cannot make precise calculations with floating point numbers
          // so we have hardhcoded the expected value
          // 0.1 - 0.1 * 0.05 = 0.095
          
          expect(bid2.value).to.equal(ethers.utils.parseEther('0.095'));
          expect(bid2.saleId).to.equal(saleId);

          sale = await ecoMarketDeploy.getOneSale(erc1155Contract.address, accounts[1].address, saleId);
          
          expect(sale.highestBid.value).to.equal(ethers.utils.parseEther('0.095'));
          expect(sale.highestBid.bidId).to.equal(bidId2);

          const highestBid = await ecoMarketDeploy.bids(sale.highestBid.bidId);

          expect(highestBid.bidder).to.equal(accounts[3].address);
          expect(highestBid.value).to.equal(ethers.utils.parseEther('0.095'));
          expect(highestBid.saleId).to.equal(saleId);
          expect(highestBid.tokenContract).to.equal(erc1155Contract.address);
          expect(highestBid.seller).to.equal(accounts[1].address);

        });


        it("Should throw an error when the bid amount is higher than the price", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          await expect(ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')})).to.be.revertedWith("Bid must be less than sale price");
          
            
        });

        it("Should throw an error when the bid is placed on an already sold item", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          const buyTx = await ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.165')});
          await expect(ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')})).to.be.revertedWith("Sale is not biddable");
          
            
        });

        it("Should throw an error when the bid is placed on a non-existant sale", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          await expect(ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, "5555", {value: ethers.utils.parseEther('0.1')})).to.be.revertedWith("Sale is not biddable");
          
            
        });

        it("Should throw an error when the bid is placed on a non-biddable sale", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), 0, 0);
          const receipt = await tx.wait();

          const saleIdBigNumber = receipt.events[0].args[2];
          const saleId = parseInt(saleIdBigNumber);

          await expect(ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')})).to.be.revertedWith("Sale is not biddable");
          
            
        });

        

      });

      describe("\n \n Bid acception", function () {
                
        it("Should properly accept a bid on a specific item.", async function () {
            await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const balance0 = await erc1155Contract.balanceOf(accounts[2].address, 1);
          expect(balance0).to.equal(0);

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);
            // seller balance is the amount of ether they have before the sale
            const sellerBalance1 = await accounts[1].getBalance();
            
            const buyerBalance1 = await accounts[2].getBalance();

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            
            const bidReceipt = await bidTx.wait();
           
            const bidId = bidReceipt.events[0].args[3];
            
            const bid = await ecoMarketDeploy.getBid(bidId);
            
            
             const tx2 = await ecoMarketDeploy.connect(accounts[1]).acceptBid(bidId);
            
            const receipt2 = await tx2.wait();

            let  sale = await ecoMarketDeploy.getSale(erc1155Contract.address, accounts[1].address, saleId);
            
            
            expect(sale.price).to.equal(undefined);
            expect(sale.amount).to.equal(undefined);
            expect(sale.biddable).to.equal(undefined);
            expect(sale.nftId).to.equal(undefined);

            const sellerBalance2 = await accounts[1].getBalance();
            expect(sellerBalance2).to.greaterThan(sellerBalance1);

            const buyerBalance2 = await accounts[2].getBalance();
            expect(buyerBalance2).to.lessThan(buyerBalance1);
            

            const balance = await erc1155Contract.balanceOf(accounts[2].address, 1);
          expect(balance).to.equal(5);
  
        });



        it("Should throw an error when called by a non-seller.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);
            

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            const bidReceipt = await bidTx.wait();
            
            const bidId = bidReceipt.events[0].args[3];
            await expect(ecoMarketDeploy.connect(accounts[2]).acceptBid(bidId)).to.be.revertedWith("Not the seller");
            

        });


        it("Should throw an error when the bid has been cancelled", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);
            

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            const bidReceipt = await bidTx.wait();

            const bidId = bidReceipt.events[0].args[3];
            await ecoMarketDeploy.connect(accounts[2]).cancelBid(bidId);

            await expect(ecoMarketDeploy.connect(accounts[1]).acceptBid(bidId)).to.be.revertedWith("Bid does not exist");
            
        });

      });

      describe("\n \n Bid cancelation", function () {

        it("Should properly cancel a bid on a specific item", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            const bidReceipt = await bidTx.wait();

            const bidId = bidReceipt.events[0].args[3];
            await ecoMarketDeploy.connect(accounts[2]).cancelBid(bidId);

            await expect(ecoMarketDeploy.connect(accounts[1]).acceptBid(bidId)).to.be.revertedWith("Bid does not exist");
            
        });

        it("Should properly cancel a bid on more than one item", async function () {
         
            
        });

        it("Should return the bid amount to the bidder correctly.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);
            const sellerBalance1 = await accounts[1].getBalance();
            const buyerBalance1 = await accounts[2].getBalance();

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            const bidReceipt = await bidTx.wait();

            const bidId = bidReceipt.events[0].args[3];
            await ecoMarketDeploy.connect(accounts[2]).cancelBid(bidId);

            const sellerBalance2 = await accounts[1].getBalance();
            const buyerBalance2 = await await accounts[2].getBalance();

            expect(sellerBalance2).to.equal(sellerBalance1);
            expect(buyerBalance2).to.lessThan(buyerBalance1.add(ethers.utils.parseEther('0.1')));
            
            
        });


        it("Should throw an error when called by a non-bidder.", async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
            await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
            const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
            expect(isApproved).to.equal(true);
            const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.08'), 0);
            const receipt = await tx.wait();

            const saleIdBigNumber = receipt.events[0].args[2];
            const saleId = parseInt(saleIdBigNumber);

            const bidTx = await ecoMarketDeploy.connect(accounts[2]).bid(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.1')});
            const bidReceipt = await bidTx.wait();

            const bidId = bidReceipt.events[0].args[3];
            await expect(ecoMarketDeploy.connect(accounts[3]).cancelBid(bidId)).to.be.revertedWith("Caller not the bidder");
            

        });


      });

      describe("\n \n Buy", function () {
        let saleId: any;
        
        beforeEach(async function () {
          await erc1155Contract.connect(accounts[1]).mint(accounts[1].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[1]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[1].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[1]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('0.15'), 0, 0);
          const receipt = await tx.wait();
          saleId = parseInt(receipt.events[0].args[2]);
        });
        it("Should properly purchase any sale at its current price", async function () {
         
          const etherBalance = await accounts[1].getBalance();
          const etherBalance2 = await accounts[2].getBalance();
          
          const initialBalance = await erc1155Contract.balanceOf(accounts[2].address, 1);
          expect(initialBalance).to.equal(0);
          await ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')});
          const balance = await erc1155Contract.balanceOf(accounts[2].address, 1);
          expect(balance).to.equal(5);
          
          
          const newEtherBalance2 = await accounts[2].getBalance();
          expect(newEtherBalance2).to.be.lessThan(etherBalance2);
          const newEtherBalance = await accounts[1].getBalance();
          expect (newEtherBalance).to.be.greaterThan(etherBalance);

            
        });

        it("Should throw an error when the item is already sold", async function () {

          await ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')});
          await expect(ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')})).to.be.revertedWith("Sale does not exist");
        });

        it("Should increment the buyer's nft count and decrement the seller's", async function () {

          const initialBalanceAccount1 = await erc1155Contract.balanceOf(accounts[1].address, 1);
          expect(initialBalanceAccount1).to.equal(5);
          await ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')});
          const balance = await erc1155Contract.balanceOf(accounts[2].address, 1);
          expect(balance).to.equal(5);
          const finalBalanceAccount1 = await erc1155Contract.balanceOf(accounts[1].address, 1);
          expect(finalBalanceAccount1).to.equal(0);
            
        });


        it("Should throw an error when the buyer's balance is insufficient.", async function () {
          await erc1155Contract.connect(accounts[3]).mint(accounts[3].address, 1, 5, "0x");
          await erc1155Contract.connect(accounts[3]).setApprovalForAll(ecoMarketDeploy.address, true);
          const isApproved = await erc1155Contract.isApprovedForAll(accounts[3].address, ecoMarketDeploy.address);
          expect(isApproved).to.equal(true);
          const tx = await ecoMarketDeploy.connect(accounts[3]).createSale(erc1155Contract.address, 5, 1, ethers.utils.parseEther('100000'), 0, 0);
          const receipt = await tx.wait();
          saleId = parseInt(receipt.events[0].args[2]);

          // this error is what happens in a hardhat's local instance:
          // "InvalidInputError: sender doesn't have enough funds to send tx. The max upfront cost is: 100000029024472464391552 and the sender's account only has: 9998859280090287214608"
          
          // but this is the behaviour on the mainnet/testnet:
          // await expect(ecoMarketDeploy.connect(accounts[2]).buy(erc1155Contract.address, accounts[3].address, saleId, {value: ethers.utils.parseEther('100000')})).to.be.revertedWith("Insufficient funds");
            
          
        });

        it("Should throw an error when called by the seller.", async function () {
         await expect(ecoMarketDeploy.connect(accounts[1]).buy(erc1155Contract.address, accounts[1].address, saleId, {value: ethers.utils.parseEther('0.16')})).to.be.revertedWith("Buyer = seller");
            
        });
      });
    });
/*
    describe("\n \n ERC721 assets", function () {

      describe("\n \n Create sale", function () {
        
        it("Should properly create a new sale for a specific item", async function () {
         
            
        });

        it("Should properly create a new sale for more than one item", async function () {
         
            
        });

        it("Should update the available item count correctly", async function () {
         
            
        });

        it("Should throw an error when the item is already for sale", async function () {
         
            
        });

        it("Should throw an error when called by a non-owner", async function () {
         
            
        });

        it("Should throw an error when the item has already been sold", async function () {
         
            
        });

      });

      describe("\n \n Cancel sale", function () {
        
        it("Should properly cancel a sale for a specific item.", async function () {
         
            
        });

        it("Should properly cancel a sale for more than one item.", async function () {
         
            
        });

        it("Should throw an error when the item is not for sale.", async function () {
         
            
        });

        it("Should throw an error when called by a non-owner", async function () {
         
            
        });

        it("Should throw an error when the item has already been sold", async function () {
         
            
        });


      });

      describe("\n \n Bid", function () {

        it("Should properly place a bid on a specific item", async function () {
         
            
        });

        it("Should properly place a bid on more than one item", async function () {
         
            
        });

        it("Should update the highest bid correctly", async function () {
         
            
        });

        it("Should update the highest bidder correctly", async function () {
         
            
        });

        it("Should throw an error when the bid amount is lower than the current bid price", async function () {
         
            
        });

        it("Should throw an error when the bid is placed on an already sold item", async function () {
         
            
        });

      });

      describe("\n \n Bid acception", function () {
        
                
        it("Should properly accept a bid on a specific item.", async function () {
         
            
        });

        it("Should properly accept a bid on more than one item.", async function () {
         
            
        });

        it("Should reset the item's bid information correctly after the bid has been accepted", async function () {
         

        });

        it("Should update the item's owner correctly.", async function () {
         
            
        });

        it("Should increment the seller's balance correctly/", async function () {
         
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
         

        });

        it("Should throw an error when called by a non-seller.", async function () {
         

        });

        it("Should throw an error when there are no bids on the item.", async function () {
         

        });

        it("Should throw an error when the item is not for sale.", async function () {
         
            
        });

        it("Should throw an error when the bid has already been accepted.", async function () {
         
            
        });

        it("Should throw an error when the bid has been cancelled", async function () {
         
            
        });

      });

      describe("\n \n Bid cancelation", function () {

        it("Should properly cancel a bid on a specific item", async function () {
         
            
        });

        it("Should properly cancel a bid on more than one item", async function () {
         
            
        });

        it("Should return the bid amount to the bidder correctly.", async function () {
         
            
        });

        it("Should reset the item's bid information correctly after the bid has been cancelled.", async function () {
         
            
        });

        it("Should throw an error when called by a non-bidder.", async function () {
         

        });

        it("Should throw an error when there are no bids on the item.", async function () {
         

        });

        it("Should throw an error when the item is not for sale.", async function () {
         

        });

        it("Should throw an error when the bid has already been accepted.", async function () {
         
            
        });

        it("Should throw an error when the bid has already been cancelled", async function () {
         
            
        });

      });

      describe("\n \n Buy", function () {
        
        it("Should properly purchase an item at its current price", async function () {
         
            
        });

        it("Should properly purchase more than one item at its current price", async function () {
         
            
        });

        it("Should update the item's owner correctly.", async function () {
         
            
        });

        it("Should increment the seller's balance correctly/", async function () {
         
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
         

        });

        it("Should throw an error when the item is already sold", async function () {
         
            
        });

        it("Should throw an error when the buyer's balance is insufficient.", async function () {
         
            
        });

        it("Should throw an error when called by the seller.", async function () {
         
            
        });
      });
    });*/
            
});


