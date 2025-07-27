import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: "https://1rpc.io/base",
      chainId: 8453,
      accounts: [
        "",
      ], // Add your private key here if needed
    },
  },
};

export default config;
