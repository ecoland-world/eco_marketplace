import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";

const config: HardhatUserConfig = {
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
