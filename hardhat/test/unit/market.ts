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

  
      before(async () => {
       
       accounts = await ethers.getSigners();
       
      });

      beforeEach (async () => {
      
        /*
        const EcoMarket = await ethers.getContractFactory("EcoMarket");
        const ecoMarketDeploy = await EcoMarket.deploy();
        await ecoMarketDeploy.deployed();
        ecoMarketAddress = ecoMarketDeploy.address;
        console.log("EcoMarket deployed to:", ecoMarketAddress);
      */
      });
        
      
  
    describe("\n \n Deployment + Admin functions", function () {
      it("Should set the right owner", async function () {
          throw new Error("Not implemented");
        
        
      });
  
      it("Should set the right NGO address", async function () {
          throw new Error("Not implemented");
        
        
      });
  
      it("Should set the correct fee", async function () {
          throw new Error("Not implemented");
        
          //
      });
  
      it("Should start at version 1.0.0", async function () {
          throw new Error("Not implemented");
  
      });

     it("Should set the contract creator as admin", async function () {
          throw new Error("Not implemented");

      });

      it("Should add a new admin", async function () {
          throw new Error("Not implemented");

      });

      it("Should remove an admin", async function () {
          throw new Error("Not implemented");

      });
      
      it("Should change the owner", async function () {
          throw new Error("Not implemented");

      });

      it("Should change the NGO address", async function () {
          throw new Error("Not implemented");

      });

      it("Should change the fee", async function () {
          throw new Error("Not implemented");

      });

      it("Should change the version", async function () {
          throw new Error("Not implemented");

      });

      it("Should revert if not owner - admin addition", async function () {
          throw new Error("Not implemented");

      });

      it("Should revert if not admin - fee change", async function () {
          throw new Error("Not implemented");

      });

      it("Should revert if not admin - version change", async function () {
          throw new Error("Not implemented");
        
      });

      it("Should revert if not admin - ngo change", async function () {
          throw new Error("Not implemented");

      });

      it("Should revert if not owner - admin removal", async function () {
          throw new Error("Not implemented");

      });

      it("Should revert if not owner - owner change", async function () {
          throw new Error("Not implemented");

      });
    });

    describe("\n \n ERC1155 assets", function () {

      describe("\n \n Create sale", function () {
        
        it("Should properly create a new sale for a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly create a new sale for more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the available item count correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item is already for sale", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-owner", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item has already been sold", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Cancel sale", function () {
        
        it("Should properly cancel a sale for a specific item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly cancel a sale for more than one item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-owner", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item has already been sold", async function () {
          throw new Error("Not implemented");
            
        });


      });

      describe("\n \n Bid", function () {

        it("Should properly place a bid on a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly place a bid on more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the highest bid correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the highest bidder correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid amount is lower than the current bid price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid is placed on an already sold item", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Bid acception", function () {
        
                
        it("Should properly accept a bid on a specific item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly accept a bid on more than one item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should reset the item's bid information correctly after the bid has been accepted", async function () {
          throw new Error("Not implemented");

        });

        it("Should update the item's owner correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should increment the seller's balance correctly/", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when called by a non-seller.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when there are no bids on the item.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has already been accepted.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has been cancelled", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Bid cancelation", function () {

        it("Should properly cancel a bid on a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly cancel a bid on more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should return the bid amount to the bidder correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should reset the item's bid information correctly after the bid has been cancelled.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-bidder.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when there are no bids on the item.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the bid has already been accepted.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has already been cancelled", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Buy", function () {
        
        it("Should properly purchase an item at its current price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly purchase more than one item at its current price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the item's owner correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should increment the seller's balance correctly/", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is already sold", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the buyer's balance is insufficient.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by the seller.", async function () {
          throw new Error("Not implemented");
            
        });
      });
    });

    describe("\n \n ERC721 assets", function () {

      describe("\n \n Create sale", function () {
        
        it("Should properly create a new sale for a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly create a new sale for more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the available item count correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item is already for sale", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-owner", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item has already been sold", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Cancel sale", function () {
        
        it("Should properly cancel a sale for a specific item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly cancel a sale for more than one item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-owner", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the item has already been sold", async function () {
          throw new Error("Not implemented");
            
        });


      });

      describe("\n \n Bid", function () {

        it("Should properly place a bid on a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly place a bid on more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the highest bid correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the highest bidder correctly", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid amount is lower than the current bid price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid is placed on an already sold item", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Bid acception", function () {
        
                
        it("Should properly accept a bid on a specific item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly accept a bid on more than one item.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should reset the item's bid information correctly after the bid has been accepted", async function () {
          throw new Error("Not implemented");

        });

        it("Should update the item's owner correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should increment the seller's balance correctly/", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when called by a non-seller.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when there are no bids on the item.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has already been accepted.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has been cancelled", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Bid cancelation", function () {

        it("Should properly cancel a bid on a specific item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly cancel a bid on more than one item", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should return the bid amount to the bidder correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should reset the item's bid information correctly after the bid has been cancelled.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by a non-bidder.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when there are no bids on the item.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is not for sale.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the bid has already been accepted.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the bid has already been cancelled", async function () {
          throw new Error("Not implemented");
            
        });

      });

      describe("\n \n Buy", function () {
        
        it("Should properly purchase an item at its current price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should properly purchase more than one item at its current price", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should update the item's owner correctly.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should increment the seller's balance correctly/", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should decrement the buyer's balance correctly.", async function () {
          throw new Error("Not implemented");

        });

        it("Should throw an error when the item is already sold", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when the buyer's balance is insufficient.", async function () {
          throw new Error("Not implemented");
            
        });

        it("Should throw an error when called by the seller.", async function () {
          throw new Error("Not implemented");
            
        });
      });
    });
            
});


