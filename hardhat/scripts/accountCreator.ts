// Node.js script to create private-public key pairs and store them in a csv file

const csvWriter = require('csv-writer');
import { ethers } from "hardhat";
import { Signer } from 'ethers';
const crypto = require('crypto');
const path = require('path');

const accountsAmount: number = 5;

const writer = csvWriter.createObjectCsvWriter({
    path: path.resolve(__dirname, 'accounts.csv'),
    header: [
      { id: 'address', title: 'Address' },
      { id: 'privateKey', title: 'Private_Key' },
    ],
  });

type Account = {
    address: string;
    privateKey: string;
};



const main = async () => {
    const newAccounts: Account[] = [];
    // generate 5 private keys and addresses the store them at the newAccounts array
    for (let i = 0; i < accountsAmount; i++) {
    
        let newPrivateKey = crypto.randomBytes(32).toString('hex');
        // make sure the private key starts with 0x
        if (newPrivateKey.substring(0, 2) != "0x") {
            newPrivateKey = "0x" + newPrivateKey;
        }
        const account: Signer = new ethers.Wallet(newPrivateKey);

        const getAddress = async () => {
        const newAddress: string = await account.getAddress();
        return newAddress;
        }

        account.getAddress().then((newAddress: string) => {
            const newAccount: Account = {
                address: newAddress,
                privateKey: newPrivateKey
            };
            newAccounts.push(newAccount);
        });
    }

    // if newAccounts array size is equal to accountsAmount then write the newAccounts array to the csv file
    // else wait 1 second and try again
    const writeAccounts = async () => {
        if (newAccounts.length == accountsAmount) {

        writer.writeRecords(newAccounts).then(() => {
            console.log(`Succesfully created ${accountsAmount} accounts and stored them in accounts.csv`);
        });
        } else {
            console.log('waiting for newAccounts array to be filled');
            setTimeout(writeAccounts, 1000);
        }

    }
    await writeAccounts();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
