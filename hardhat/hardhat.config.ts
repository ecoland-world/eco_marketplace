import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";
import dotenv from "dotenv";
dotenv.config();



// add mumbai testnet 
// take accounts from accounts.csv file


const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/your-api-key",
        blockNumber: 13000000,
      },
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.MUMBAI_RICH_ACCOUNT_PRIVATE_KEY as string, 
        "pvt_key_1",
        "pvt_key_2",
        "pvt_key_3",
        "pvt_key_4",
        "pvt_key_5"
      ],
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      }
    ]
  }

};

export default config;
