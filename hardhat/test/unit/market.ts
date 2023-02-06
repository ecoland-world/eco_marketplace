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
      
        
        const EcoMarket = await ethers.getContractFactory("EcoMarketPlace");
        ecoMarketDeploy = await EcoMarket.connect(accounts[2]).deploy(ngoAddress, ethers.utils.parseEther("0.05"), "1.0.0");
        await ecoMarketDeploy.deployed();
        ecoMarketAddress = ecoMarketDeploy.address;
        //console.log("EcoMarket deployed to:", ecoMarketAddress);
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
    });

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
    });
            
});


